"""
Session model - represents a user session with workflow memory.
"""
from dataclasses import dataclass, field
from typing import Optional, Any
from datetime import datetime


@dataclass
class WorkflowMemory:
    """
    Workflow Memory stores the state and data for a specific workflow instance.
    
    This is the core memory structure that the Planner reads/writes during
    the workflow execution. It follows the schema defined in the design docs.
    
    Memory Lifecycle:
    - Create: When a workflow is initiated
    - Update: After each state transition
    - Delete: When workflow completes, cancels, or timeout > 30 min
    """
    workflow_type: str  # CHANGE_MAJOR, DROP_OUT, SUSPEND, RESUME
    current_state: str
    status: str = 'IN_PROGRESS'  # IN_PROGRESS, COMPLETED, CANCELLED, ERROR
    
    # Student Information (from Student Service)
    student: dict = field(default_factory=lambda: {
        'studentId': None,
        'fullName': None,
        'gender': None,
        'dateOfBirth': None,
        'citizenId': None,
        'email': None,
        'phoneNumber': None,
        'faculty': None,
        'currentMajor': None,
        'course': None,
        'academicStatus': None,
    })
    
    # Documents
    documents: dict = field(default_factory=lambda: {
        'uploaded': False,
        'admissionLetter': None,
        'graduationCertificate': None,
    })
    
    # OCR Result
    ocr: dict = field(default_factory=lambda: {
        'status': None,
        'confidence': None,
        'student': {},
        'exam': {},
    })
    
    # Verification
    verification: dict = field(default_factory=lambda: {
        'confirmed': False,
        'edited': False,
        'confirmTime': None,
    })
    
    # Workflow data
    targetMajor: Optional[str] = None
    eligible: Optional[bool] = None
    examMethod: Optional[str] = None
    
    # Scores
    scores: dict = field(default_factory=dict)
    
    # Generated form
    generatedForm: dict = field(default_factory=lambda: {
        'status': None,
        'fileName': None,
        'downloadUrl': None,
        'previewUrl': None,
        'exportTime': None,
    })
    
    # Submission
    submission: dict = field(default_factory=lambda: {
        'submitted': False,
        'requestId': None,
        'status': None,
        'createdTime': None,
    })
    
    # Error tracking
    errors: list = field(default_factory=list)
    
    # Metadata
    createdAt: datetime = field(default_factory=datetime.now)
    updatedAt: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> dict:
        return {
            'workflow_type': self.workflow_type,
            'current_state': self.current_state,
            'status': self.status,
            'student': self.student,
            'documents': self.documents,
            'ocr': self.ocr,
            'verification': self.verification,
            'targetMajor': self.targetMajor,
            'eligible': self.eligible,
            'examMethod': self.examMethod,
            'scores': self.scores,
            'generatedForm': self.generatedForm,
            'submission': self.submission,
            'errors': self.errors,
            'createdAt': self.createdAt.isoformat(),
            'updatedAt': self.updatedAt.isoformat(),
        }
    
    def is_valid_for_form_generation(self) -> bool:
        """Check if all required data is present for PDF generation."""
        return all([
            self.verification.get('confirmed'),
            self.eligible is True,
            self.targetMajor is not None,
            self.examMethod is not None,
            bool(self.scores),
        ])


@dataclass
class Session:
    """
    User session containing authentication info and active workflows.
    """
    session_id: str
    user_id: str
    access_token: Optional[str] = None
    is_authenticated: bool = False
    active_workflow: Optional[WorkflowMemory] = None
    created_at: datetime = field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    metadata: dict = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            'session_id': self.session_id,
            'user_id': self.user_id,
            'is_authenticated': self.is_authenticated,
            'active_workflow': self.active_workflow.to_dict() if self.active_workflow else None,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'metadata': self.metadata,
        }