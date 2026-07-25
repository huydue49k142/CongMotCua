"""
Orchestrator - The main entry point for the AI Agent.

The Orchestrator coordinates all components:
1. Intent Classifier → 2. Memory Manager → 3. Guardrails →
4. Planner → 5. Tool Executor → 6. Memory Update → 7. Response Generator

This is the ONLY module that external code (API, WebSocket) should call.
"""
from typing import Optional, Dict, Any
from .intent_classifier import IntentClassifier, Intent
from .memory_manager import MemoryManager
from .state_machine import StateMachine, WorkflowType
from .planner import Planner
from .tool_executor import ToolExecutor, ToolResult
from .guardrails import Guardrails, GuardrailViolation
from .response_generator import ResponseGenerator
from .models.session import WorkflowMemory


class AgentOrchestrator:
    """
    Main orchestrator for the AI Agent.
    
    Usage:
        orchestrator = AgentOrchestrator()
        result = orchestrator.process_message(
            user_id="22123456",
            message="Tôi muốn chuyển ngành",
            session_id="session_123"
        )
        print(result['response'])
    """
    
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.memory_manager = MemoryManager()
        self.planner = Planner()
        self.tool_executor = ToolExecutor()
        self.guardrails = Guardrails()
        self.response_generator = ResponseGenerator()
        
        # Track active workflows per session
        self._active_workflows: Dict[str, WorkflowMemory] = {}
        self._state_machines: Dict[str, StateMachine] = {}
    
    def process_message(self, user_id: str, message: str, 
                        session_id: str) -> Dict[str, Any]:
        """
        Process a user message through the AI Agent pipeline.
        
        Args:
            user_id: The student ID
            message: The user's message
            session_id: The conversation session ID
        
        Returns:
            {
                'response': str,         # Message to show user
                'state': str,            # Current workflow state
                'workflow': str,         # Workflow type
                'status': str,           # Workflow status
                'intent': str,           # Detected intent
                'requires_upload': bool, # Whether UI should show upload
                'allowed_actions': list, # Actions user can take
                'error': str or None,    # Error message if any
            }
        """
        try:
            # Step 1: Classify intent
            intent_result = self.intent_classifier.classify(message)
            intent = intent_result['intent']
            
            # Step 2: Get or create memory
            memory = self._active_workflows.get(session_id)
            
            # Step 3: Handle out-of-scope
            if intent == Intent.OUT_OF_SCOPE:
                return self._build_response(
                    response=self.response_generator.generate_out_of_scope(),
                    intent=intent.value,
                )
            
            # Step 4: Handle new workflow intent
            if self.intent_classifier.is_workflow_intent(intent):
                if memory and memory.status == 'IN_PROGRESS':
                    # User already has active workflow - ask to cancel first
                    return self._build_response(
                        response='Bạn đang có quy trình đang xử lý. Bạn có muốn hủy và tạo mới không?',
                        state=memory.current_state,
                        workflow=memory.workflow_type,
                        status=memory.status,
                        intent=intent.value,
                    )
                
                # Create new workflow
                memory = self.memory_manager.create_memory(intent.value)
                state_machine = StateMachine(WorkflowType(intent.value))
                
                self._active_workflows[session_id] = memory
                self._state_machines[session_id] = state_machine
                
                # Get planner decision
                decision = self.planner.plan(message, intent, memory)
                
            elif intent == Intent.STATUS and memory:
                # Return current status
                return self._build_response(
                    response=self.response_generator.generate_status(memory),
                    state=memory.current_state,
                    workflow=memory.workflow_type,
                    status=memory.status,
                    intent=intent.value,
                )
            
            elif intent == Intent.HELP:
                return self._build_response(
                    response=self.response_generator.generate_welcome(),
                    intent=intent.value,
                )
            
            elif memory and memory.status == 'IN_PROGRESS':
                # Continue existing workflow
                state_machine = self._state_machines.get(session_id)
                decision = self.planner.plan(message, intent, memory)
            else:
                # No active workflow and not a workflow intent
                return self._build_response(
                    response=self.response_generator.generate_welcome(),
                    intent=intent.value,
                )
            
            # Step 5: Validate planner decision with guardrails
            self.guardrails.validate_planner_decision(decision, memory)
            
            # Step 6: Execute tool if needed
            tool_result = None
            if decision.get('tool'):
                tool_name = decision['tool']
                self.guardrails.validate_tool_call(tool_name, memory)
                tool_result = self.tool_executor.execute(
                    tool_name, 
                    decision.get('tool_params', {})
                )
                
                # If tool failed, ask user to retry
                if not tool_result.success:
                    return self._build_response(
                        response=self.response_generator.generate_error(
                            tool_result.error or 'Thao tác thất bại'
                        ),
                        state=memory.current_state,
                        workflow=memory.workflow_type,
                        status=memory.status,
                        intent=intent.value,
                        error=tool_result.error,
                    )
            
            # Step 7: Update memory based on decision
            if decision.get('memory_updates'):
                for key, value in decision['memory_updates'].items():
                    if '.' in key:
                        # Nested field update (e.g., 'documents.uploaded')
                        section, field = key.split('.', 1)
                        self.memory_manager.update_nested_field(
                            session_id, section, field, value
                        )
                    else:
                        self.memory_manager.update_memory(
                            session_id, {key: value}
                        )
            
            # Step 8: Transition state machine
            if decision.get('nextState'):
                state_machine = self._state_machines.get(session_id)
                if state_machine:
                    transition = state_machine.transition_to(decision['nextState'])
                    if not transition['success']:
                        return self._build_response(
                            response=f"Lỗi chuyển trạng thái: {transition['reason']}",
                            state=memory.current_state,
                            workflow=memory.workflow_type,
                            status='ERROR',
                            intent=intent.value,
                            error=transition['reason'],
                        )
            
            # Step 9: Generate response
            response = decision.get('response', '')
            if not response and tool_result:
                response = tool_result.data.get('message', '')
            if not response:
                response = self.response_generator.generate(memory, decision, tool_result)
            
            # Step 10: Build final response
            return self._build_response(
                response=response,
                state=memory.current_state,
                workflow=memory.workflow_type,
                status=memory.status,
                intent=intent.value,
                tool_result=tool_result.to_dict() if tool_result else None,
            )
            
        except GuardrailViolation as e:
            # Guardrail violation - return error message
            return self._build_response(
                response=e.message,
                state=memory.current_state if memory else 'NONE',
                workflow=memory.workflow_type if memory else 'NONE',
                status='ERROR',
                intent=intent.value if intent else 'UNKNOWN',
                error=f"[{e.rule}] {e.message}",
            )
        
        except Exception as e:
            # Unexpected error
            return self._build_response(
                response=self.response_generator.generate_error(str(e)),
                state='ERROR',
                workflow='UNKNOWN',
                status='ERROR',
                intent='UNKNOWN',
                error=str(e),
            )
    
    def _build_response(self, **kwargs) -> Dict[str, Any]:
        """Build a standardized response dictionary."""
        return {
            'response': kwargs.get('response', ''),
            'state': kwargs.get('state', 'NONE'),
            'workflow': kwargs.get('workflow', 'NONE'),
            'status': kwargs.get('status', 'IDLE'),
            'intent': kwargs.get('intent', 'UNKNOWN'),
            'error': kwargs.get('error', None),
            'tool_result': kwargs.get('tool_result', None),
            'allowed_actions': kwargs.get('allowed_actions', []),
        }
    
    def cancel_workflow(self, session_id: str) -> Dict[str, Any]:
        """Cancel an active workflow."""
        if session_id in self._active_workflows:
            memory = self._active_workflows[session_id]
            memory.status = 'CANCELLED'
            return {
                'success': True,
                'response': 'Quy trình đã được hủy.',
                'workflow': memory.workflow_type,
            }
        return {
            'success': False,
            'response': 'Không có quy trình nào để hủy.',
        }
    
    def get_workflow_state(self, session_id: str) -> Optional[Dict]:
        """Get the current workflow state for a session."""
        memory = self._active_workflows.get(session_id)
        state_machine = self._state_machines.get(session_id)
        
        if not memory or not state_machine:
            return None
        
        return {
            'current_state': memory.current_state,
            'workflow': memory.workflow_type,
            'status': memory.status,
            'state_definition': {
                'description': state_machine.state_definition.description if state_machine.state_definition else '',
                'allowed_tools': state_machine.get_allowed_tools(),
                'next_possible_states': state_machine.get_next_possible_states(),
            },
            'student_info': {
                'studentId': memory.student.get('studentId'),
                'fullName': memory.student.get('fullName'),
            },
        }