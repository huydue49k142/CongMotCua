"""
State Machine Engine

Implements the workflow state machine for academic procedures.
Each workflow (CHANGE_MAJOR, DROP_OUT, SUSPEND, RESUME) has its own
state definitions and transition rules.

Based on design document: state_machine/change_major_state.md
"""
from dataclasses import dataclass, field
from typing import Optional, Callable, Any
from enum import Enum


class WorkflowType(str, Enum):
    """Supported workflow types."""
    CHANGE_MAJOR = 'CHANGE_MAJOR'
    DROP_OUT = 'DROP_OUT'
    SUSPEND = 'SUSPEND'
    RESUME = 'RESUME'


class ChangeMajorState(str, Enum):
    """States for the CHANGE_MAJOR workflow.
    
    Based on: state_machine/change_major_state.md
    """
    START = 'START'
    WAIT_UPLOAD_DOCUMENT = 'WAIT_UPLOAD_DOCUMENT'
    WAIT_OCR = 'WAIT_OCR'
    VERIFY_INFORMATION = 'VERIFY_INFORMATION'
    WAIT_TARGET_MAJOR = 'WAIT_TARGET_MAJOR'
    PREVIEW_DOCUMENT = 'PREVIEW_DOCUMENT'
    WAIT_EXCEL_DOWNLOAD = 'WAIT_EXCEL_DOWNLOAD'
    WAIT_ELIGIBILITY_CONFIRM = 'WAIT_ELIGIBILITY_CONFIRM'
    WAIT_EXAM_METHOD = 'WAIT_EXAM_METHOD'
    WAIT_SCORE_INPUT = 'WAIT_SCORE_INPUT'
    GENERATE_FORM = 'GENERATE_FORM'
    PREVIEW_FORM = 'PREVIEW_FORM'
    SUBMIT_REQUEST = 'SUBMIT_REQUEST'
    DONE = 'DONE'
    CANCELLED = 'CANCELLED'
    ERROR = 'ERROR'


@dataclass
class StateDefinition:
    """Defines a single state in the workflow."""
    name: str
    description: str
    allowed_actions: list = field(default_factory=list)
    allowed_tools: list = field(default_factory=list)
    exit_conditions: list = field(default_factory=list)
    next_states: list = field(default_factory=list)


@dataclass
class Transition:
    """Defines a valid state transition."""
    from_state: str
    to_state: str
    condition: Optional[Callable] = None  # Function that returns bool
    condition_description: str = ''


class StateMachine:
    """
    Finite State Machine for workflow management.
    
    Rules:
    1. Agent can only execute actions in current state
    2. Agent cannot skip states
    3. Agent cannot transition if conditions are not met
    4. Each state has specific allowed tools
    """
    
    # Workflow state definitions for CHANGE_MAJOR
    CHANGE_MAJOR_TRANSITIONS = [
        Transition('START', 'WAIT_UPLOAD_DOCUMENT', condition_description='Workflow initialized'),
        Transition('WAIT_UPLOAD_DOCUMENT', 'WAIT_OCR', condition_description='Both documents uploaded'),
        Transition('WAIT_OCR', 'VERIFY_INFORMATION', condition_description='OCR successful'),
        Transition('WAIT_OCR', 'WAIT_UPLOAD_DOCUMENT', condition_description='OCR failed - re-upload'),
        Transition('VERIFY_INFORMATION', 'WAIT_TARGET_MAJOR', condition_description='Information confirmed'),
        Transition('WAIT_TARGET_MAJOR', 'PREVIEW_DOCUMENT', condition_description='Target major entered'),
        Transition('PREVIEW_DOCUMENT', 'WAIT_UPLOAD_DOCUMENT', condition_description='Student wants to re-upload'),
        Transition('PREVIEW_DOCUMENT', 'WAIT_EXCEL_DOWNLOAD', condition_description='Documents confirmed'),
        Transition('WAIT_EXCEL_DOWNLOAD', 'WAIT_ELIGIBILITY_CONFIRM', condition_description='Excel downloaded'),
        Transition('WAIT_ELIGIBILITY_CONFIRM', 'WAIT_EXAM_METHOD', condition_description='Student is eligible'),
        Transition('WAIT_ELIGIBILITY_CONFIRM', 'CANCELLED', condition_description='Student not eligible'),
        Transition('WAIT_EXAM_METHOD', 'WAIT_SCORE_INPUT', condition_description='Exam method selected'),
        Transition('WAIT_SCORE_INPUT', 'GENERATE_FORM', condition_description='Scores entered'),
        Transition('GENERATE_FORM', 'PREVIEW_FORM', condition_description='Form generated'),
        Transition('GENERATE_FORM', 'GENERATE_FORM', condition_description='Form generation failed - retry'),
        Transition('PREVIEW_FORM', 'SUBMIT_REQUEST', condition_description='Student confirmed submission'),
        Transition('PREVIEW_FORM', 'WAIT_SCORE_INPUT', condition_description='Student wants to edit scores'),
        Transition('PREVIEW_FORM', 'WAIT_EXAM_METHOD', condition_description='Student wants to change method'),
        Transition('SUBMIT_REQUEST', 'DONE', condition_description='Workflow submitted successfully'),
        Transition('SUBMIT_REQUEST', 'SUBMIT_REQUEST', condition_description='Submission failed - retry'),
        Transition('*', 'CANCELLED', condition_description='User cancels workflow'),
        Transition('*', 'ERROR', condition_description='System error occurred'),
    ]
    
    # All states for CHANGE_MAJOR
    CHANGE_MAJOR_STATES = {
        'START': StateDefinition(
            'START', 'Initialize workflow and verify user identity',
            allowed_tools=[],
            next_states=['WAIT_UPLOAD_DOCUMENT']
        ),
        'WAIT_UPLOAD_DOCUMENT': StateDefinition(
            'WAIT_UPLOAD_DOCUMENT', 'Wait for student to upload admission letter and graduation certificate',
            allowed_tools=[],
            next_states=['WAIT_OCR']
        ),
        'WAIT_OCR': StateDefinition(
            'WAIT_OCR', 'Process uploaded documents through OCR',
            allowed_tools=['OCR'],
            next_states=['VERIFY_INFORMATION', 'WAIT_UPLOAD_DOCUMENT']
        ),
        'VERIFY_INFORMATION': StateDefinition(
            'VERIFY_INFORMATION', 'Display OCR results for student to verify',
            allowed_tools=[],
            next_states=['WAIT_TARGET_MAJOR']
        ),
        'WAIT_TARGET_MAJOR': StateDefinition(
            'WAIT_TARGET_MAJOR', 'Ask student for target major',
            allowed_tools=[],
            next_states=['PREVIEW_DOCUMENT']
        ),
        'PREVIEW_DOCUMENT': StateDefinition(
            'PREVIEW_DOCUMENT', 'Show document preview for confirmation',
            allowed_tools=[],
            next_states=['WAIT_EXCEL_DOWNLOAD', 'WAIT_UPLOAD_DOCUMENT']
        ),
        'WAIT_EXCEL_DOWNLOAD': StateDefinition(
            'WAIT_EXCEL_DOWNLOAD', 'Guide student to download eligibility check Excel',
            allowed_tools=[],
            next_states=['WAIT_ELIGIBILITY_CONFIRM']
        ),
        'WAIT_ELIGIBILITY_CONFIRM': StateDefinition(
            'WAIT_ELIGIBILITY_CONFIRM', 'Wait for student to confirm eligibility',
            allowed_tools=['ConditionChecker'],
            next_states=['WAIT_EXAM_METHOD', 'CANCELLED']
        ),
        'WAIT_EXAM_METHOD': StateDefinition(
            'WAIT_EXAM_METHOD', 'Ask student to select exam method',
            allowed_tools=[],
            next_states=['WAIT_SCORE_INPUT']
        ),
        'WAIT_SCORE_INPUT': StateDefinition(
            'WAIT_SCORE_INPUT', 'Collect subject scores based on exam method',
            allowed_tools=[],
            next_states=['GENERATE_FORM']
        ),
        'GENERATE_FORM': StateDefinition(
            'GENERATE_FORM', 'Generate the change major application form',
            allowed_tools=['PDFGenerator'],
            next_states=['PREVIEW_FORM', 'GENERATE_FORM']
        ),
        'PREVIEW_FORM': StateDefinition(
            'PREVIEW_FORM', 'Show generated form preview for student review',
            allowed_tools=[],
            next_states=['SUBMIT_REQUEST', 'WAIT_SCORE_INPUT', 'WAIT_EXAM_METHOD']
        ),
        'SUBMIT_REQUEST': StateDefinition(
            'SUBMIT_REQUEST', 'Submit the workflow to backend system',
            allowed_tools=['Workflow'],
            next_states=['DONE', 'SUBMIT_REQUEST']
        ),
        'DONE': StateDefinition(
            'DONE', 'Workflow completed successfully',
            allowed_tools=[],
            next_states=[]
        ),
        'CANCELLED': StateDefinition(
            'CANCELLED', 'Workflow was cancelled',
            allowed_tools=[],
            next_states=[]
        ),
        'ERROR': StateDefinition(
            'ERROR', 'Workflow encountered an error',
            allowed_tools=[],
            next_states=[]
        ),
    }
    
    def __init__(self, workflow_type: WorkflowType):
        self.workflow_type = workflow_type
        self._current_state = 'START'
        self._history = []
        
        # Load state definitions based on workflow type
        if workflow_type == WorkflowType.CHANGE_MAJOR:
            self._states = dict(self.CHANGE_MAJOR_STATES)
            self._transitions = list(self.CHANGE_MAJOR_TRANSITIONS)
        else:
            # Placeholder for other workflow types
            self._states = {}
            self._transitions = []
    
    @property
    def current_state(self) -> str:
        return self._current_state
    
    @property
    def state_definition(self) -> Optional[StateDefinition]:
        return self._states.get(self._current_state)
    
    def get_allowed_tools(self) -> list:
        """Get the list of tools allowed in the current state."""
        state_def = self.state_definition
        return state_def.allowed_tools if state_def else []
    
    def can_transition_to(self, target_state: str) -> tuple:
        """
        Check if a transition to the target state is valid.
        Returns: (is_valid: bool, reason: str)
        """
        # Check for wildcard transitions first
        for t in self._transitions:
            if t.from_state in (self._current_state, '*') and t.to_state == target_state:
                if t.condition is None:
                    return True, ''
                result = t.condition()
                if result:
                    return True, ''
                return False, t.condition_description
        
        # Check exact transitions
        matching = [t for t in self._transitions 
                    if t.from_state == self._current_state and t.to_state == target_state]
        
        if not matching:
            return False, f"No valid transition from {self._current_state} to {target_state}"
        
        # Check if target is in next_states
        state_def = self.state_definition
        if state_def and target_state not in state_def.next_states:
            return False, f"{target_state} is not in allowed next states for {self._current_state}"
        
        return True, ''
    
    def transition_to(self, target_state: str) -> dict:
        """
        Attempt to transition to the target state.
        Returns: {'success': bool, 'from': str, 'to': str, 'reason': str}
        """
        is_valid, reason = self.can_transition_to(target_state)
        
        if not is_valid:
            return {
                'success': False,
                'from': self._current_state,
                'to': target_state,
                'reason': reason
            }
        
        # Record history
        self._history.append({
            'from': self._current_state,
            'to': target_state,
            'timestamp': __import__('datetime').datetime.now().isoformat()
        })
        
        old_state = self._current_state
        self._current_state = target_state
        
        return {
            'success': True,
            'from': old_state,
            'to': target_state,
            'reason': ''
        }
    
    def is_terminal(self) -> bool:
        """Check if current state is a terminal state."""
        return self._current_state in ('DONE', 'CANCELLED', 'ERROR')
    
    def get_history(self) -> list:
        return self._history
    
    def get_next_possible_states(self) -> list:
        """Get all possible next states from the current state."""
        state_def = self.state_definition
        if not state_def:
            return []
        return state_def.next_states
    
    def reset(self):
        """Reset the state machine to initial state."""
        self._current_state = 'START'
        self._history = []
    
    def to_dict(self) -> dict:
        return {
            'workflow_type': self.workflow_type.value,
            'current_state': self._current_state,
            'is_terminal': self.is_terminal(),
            'allowed_tools': self.get_allowed_tools(),
            'next_possible_states': self.get_next_possible_states(),
            'history': self._history,
        }