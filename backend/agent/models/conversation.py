"""
Conversation model - represents a conversation session between user and AI Agent.
"""
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class Message:
    """A single message in the conversation."""
    role: str  # 'user' | 'assistant' | 'system'
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata,
        }


@dataclass
class Conversation:
    """
    Represents the full conversation history between a user and the AI Agent.
    Each conversation belongs to one session/workflow.
    """
    conversation_id: str
    workflow_type: Optional[str] = None  # CHANGE_MAJOR, DROP_OUT, SUSPEND, RESUME
    messages: list = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True

    def add_message(self, role: str, content: str, metadata: Optional[dict] = None) -> Message:
        msg = Message(
            role=role,
            content=content,
            metadata=metadata or {}
        )
        self.messages.append(msg)
        self.updated_at = datetime.now()
        return msg

    def get_last_user_message(self) -> Optional[Message]:
        for msg in reversed(self.messages):
            if msg.role == 'user':
                return msg
        return None

    def get_last_assistant_message(self) -> Optional[Message]:
        for msg in reversed(self.messages):
            if msg.role == 'assistant':
                return msg
        return None

    def get_context_window(self, max_messages: int = 20) -> list:
        """Get the last N messages for LLM context window."""
        return [m.to_dict() for m in self.messages[-max_messages:]]

    def to_dict(self) -> dict:
        return {
            'conversation_id': self.conversation_id,
            'workflow_type': self.workflow_type,
            'messages': [m.to_dict() for m in self.messages],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active,
        }