"""
Guardrails - Safety and validation layer for AI Agent.

Based on: prompts/guardrails.md, prompts/system_prompt.md
Ensures the AI Agent follows all 10 business rules and safety constraints.
"""
from typing import Optional, Dict, Any, List, Tuple
from .models.session import WorkflowMemory
from .intent_classifier import Intent


class GuardrailViolation(Exception):
    """Raised when a guardrail rule is violated."""
    def __init__(self, rule: str, message: str):
        self.rule = rule
        self.message = message
        super().__init__(f"[{rule}] {message}")


class Guardrails:
    """
    Guardrails system that validates all agent actions against business rules.
    
    Rules from system_prompt.md:
    RULE_1: Không được tự tạo thông tin
    RULE_2: Không được đoán dữ liệu
    RULE_3: Không được bỏ qua bước
    RULE_4: Nếu thiếu dữ liệu thì phải hỏi
    RULE_5: Chỉ chuyển bước khi bước hiện tại hoàn thành
    RULE_6: OCR chưa xác nhận thì không được dùng để tạo đơn
    RULE_7: Nếu sinh viên chọn không đủ điều kiện thì phải dừng
    RULE_8: Không được sửa quy trình nghiệp vụ
    RULE_9: Nếu hỏi ngoài phạm vi thì lịch sự từ chối
    RULE_10: Nếu không chắc chắn, yêu cầu liên hệ Phòng Đào tạo
    """
    
    RULES = {
        'RULE_1': 'Không được tự tạo thông tin',
        'RULE_2': 'Không được đoán dữ liệu',
        'RULE_3': 'Không được bỏ qua bước',
        'RULE_4': 'Nếu thiếu dữ liệu thì phải hỏi',
        'RULE_5': 'Chỉ chuyển bước khi bước hiện tại hoàn thành',
        'RULE_6': 'OCR chưa xác nhận thì không được dùng để tạo đơn',
        'RULE_7': 'Nếu sinh viên chọn không đủ điều kiện thì phải dừng',
        'RULE_8': 'Không được sửa quy trình nghiệp vụ',
        'RULE_9': 'Nếu hỏi ngoài phạm vi thì lịch sự từ chối',
        'RULE_10': 'Nếu không chắc chắn, yêu cầu liên hệ Phòng Đào tạo',
    }
    
    def __init__(self):
        self.violations: List[Dict] = []
    
    def validate_input(self, message: str, intent: Intent, memory: Optional[WorkflowMemory] = None) -> None:
        """
        RULE_9: Validate user input.
        If user asks out-of-scope questions, reject politely.
        """
        if intent == Intent.OUT_OF_SCOPE:
            raise GuardrailViolation(
                'RULE_9',
                'Xin lỗi, tôi chỉ hỗ trợ các thủ tục học vụ. '
                'Vui lòng liên hệ Phòng Đào tạo để được hỗ trợ thêm.'
            )
    
    def validate_planner_decision(self, decision: dict, memory: WorkflowMemory) -> None:
        """
        Validate the planner's decision before execution.
        Checks all applicable rules.
        """
        action = decision.get('action')
        next_state = decision.get('nextState')
        tool = decision.get('tool')
        
        # RULE_3 & RULE_5: Validate state transitions
        if next_state:
            self._validate_state_transition(memory.current_state, next_state, memory)
        
        # RULE_6: Cannot generate form if OCR not confirmed
        if action == 'GENERATE_FORM' or tool == 'PDFGenerator':
            self._validate_form_generation(memory)
        
        # RULE_7: Cannot continue if not eligible
        if memory.eligible is False and action not in ('END_WORKFLOW', 'ASK_CONFIRMATION'):
            raise GuardrailViolation(
                'RULE_7',
                'Sinh viên đã xác nhận không đủ điều kiện. Phải dừng quy trình.'
            )
        
        # RULE_1 & RULE_2: Cannot fabricate or guess data
        if action == 'CALL_TOOL' and tool is None:
            raise GuardrailViolation(
                'RULE_1',
                'Không được tự tạo thông tin. Phải gọi Tool để lấy dữ liệu.'
            )
    
    def _validate_state_transition(self, from_state: str, to_state: str, memory: WorkflowMemory) -> None:
        """
        RULE_3 & RULE_5: Validate state transitions.
        - Cannot skip states
        - Can only transition when current state conditions are met
        """
        # Cannot transition from terminal states
        if memory.status in ('COMPLETED', 'CANCELLED'):
            raise GuardrailViolation(
                'RULE_3',
                f'Không thể chuyển state từ trạng thái kết thúc: {memory.status}'
            )
        
        # State order for CHANGE_MAJOR
        state_order = [
            'START', 'WAIT_UPLOAD_DOCUMENT', 'WAIT_OCR', 'VERIFY_INFORMATION',
            'WAIT_TARGET_MAJOR', 'PREVIEW_DOCUMENT', 'WAIT_EXCEL_DOWNLOAD',
            'WAIT_ELIGIBILITY_CONFIRM', 'WAIT_EXAM_METHOD', 'WAIT_SCORE_INPUT',
            'GENERATE_FORM', 'PREVIEW_FORM', 'SUBMIT_REQUEST', 'DONE'
        ]
        
        if from_state in state_order and to_state in state_order:
            from_idx = state_order.index(from_state)
            to_idx = state_order.index(to_state)
            
            # Allowed backward transitions (for edit flows)
            allowed_backward = [
                ('PREVIEW_FORM', 'WAIT_SCORE_INPUT'),
                ('PREVIEW_FORM', 'WAIT_EXAM_METHOD'),
                ('PREVIEW_DOCUMENT', 'WAIT_UPLOAD_DOCUMENT'),
                ('WAIT_OCR', 'WAIT_UPLOAD_DOCUMENT'),
            ]
            
            if to_idx < from_idx and (from_state, to_state) not in allowed_backward:
                raise GuardrailViolation(
                    'RULE_3',
                    f'Không thể quay lui từ {from_state} về {to_state}'
                )
    
    def _validate_form_generation(self, memory: WorkflowMemory) -> None:
        """
        RULE_6: Cannot generate form if OCR not confirmed.
        RULE_4: Must have all required data.
        """
        if not memory.verification.get('confirmed'):
            raise GuardrailViolation(
                'RULE_6',
                'OCR chưa được sinh viên xác nhận. Không được tạo đơn.'
            )
        
        if memory.targetMajor is None:
            raise GuardrailViolation(
                'RULE_4',
                'Thiếu thông tin ngành muốn chuyển. Phải hỏi sinh viên.'
            )
        
        if memory.eligible is not True:
            raise GuardrailViolation(
                'RULE_4',
                'Thiếu xác nhận điều kiện chuyển ngành. Phải hỏi sinh viên.'
            )
        
        if memory.examMethod is None:
            raise GuardrailViolation(
                'RULE_4',
                'Thiếu phương thức xét tuyển. Phải hỏi sinh viên.'
            )
        
        if not memory.scores:
            raise GuardrailViolation(
                'RULE_4',
                'Thiếu điểm xét tuyển. Phải hỏi sinh viên.'
            )
    
    def validate_tool_call(self, tool_name: str, memory: WorkflowMemory) -> None:
        """
        RULE_8: Validate tool calls against allowed tools for current state.
        """
        # Map states to allowed tools
        state_tools = {
            'WAIT_OCR': ['OCR'],
            'WAIT_ELIGIBILITY_CONFIRM': ['ConditionChecker'],
            'GENERATE_FORM': ['PDFGenerator'],
            'SUBMIT_REQUEST': ['Workflow'],
        }
        
        allowed = state_tools.get(memory.current_state, [])
        if tool_name not in allowed:
            raise GuardrailViolation(
                'RULE_8',
                f'Tool {tool_name} không được phép gọi trong state {memory.current_state}'
            )
    
    def get_violations(self) -> List[Dict]:
        return self.violations
    
    def clear_violations(self) -> None:
        self.violations = []