"""
Memory Manager - Manages workflow memory lifecycle.

Based on: memory/memory_lifecycle.md, memory/memory_types.md
"""
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from .models.session import WorkflowMemory


class MemoryManager:
    """
    Manages the lifecycle of workflow memory.
    
    Memory Types:
    - Session Memory: Temporary, deleted when session ends
    - Persistent Memory: Stored in database permanently
    
    Lifecycle:
    - Create: When workflow is initiated
    - Update: After each state transition
    - Delete: When workflow completes, cancels, or timeout > 30 min
    """
    
    SESSION_TIMEOUT_MINUTES = 30
    
    def __init__(self):
        # In-memory storage (will be replaced with DB in production)
        self._store: Dict[str, WorkflowMemory] = {}
        self._timestamps: Dict[str, datetime] = {}
    
    def create_memory(self, workflow_type: str) -> WorkflowMemory:
        """
        Create a new workflow memory instance.
        
        Initial state:
        {
            "workflow": workflow_type,
            "currentState": "START",
            "status": "IN_PROGRESS"
        }
        """
        memory = WorkflowMemory(
            workflow_type=workflow_type,
            current_state='START',
            status='IN_PROGRESS'
        )
        # Generate a memory ID based on workflow type and timestamp
        memory_id = f"{workflow_type}_{int(datetime.now().timestamp())}"
        self._store[memory_id] = memory
        self._timestamps[memory_id] = datetime.now()
        return memory
    
    def get_memory(self, memory_id: str) -> Optional[WorkflowMemory]:
        """Get workflow memory by ID."""
        memory = self._store.get(memory_id)
        if memory:
            # Check timeout
            last_access = self._timestamps.get(memory_id, memory.createdAt)
            if datetime.now() - last_access > timedelta(minutes=self.SESSION_TIMEOUT_MINUTES):
                self.delete_memory(memory_id)
                return None
            self._timestamps[memory_id] = datetime.now()
        return memory
    
    def update_memory(self, memory_id: str, updates: dict) -> Optional[WorkflowMemory]:
        """
        Update workflow memory with new values.
        
        Based on memory_lifecycle.md - after each state transition,
        specific memory fields are updated.
        """
        memory = self.get_memory(memory_id)
        if not memory:
            return None
        
        for key, value in updates.items():
            if hasattr(memory, key):
                setattr(memory, key, value)
        
        memory.updatedAt = datetime.now()
        self._timestamps[memory_id] = datetime.now()
        return memory
    
    def update_nested_field(self, memory_id: str, section: str, key: str, value: Any) -> Optional[WorkflowMemory]:
        """
        Update a nested field in memory.
        Example: update_nested_field('id', 'documents', 'uploaded', True)
        """
        memory = self.get_memory(memory_id)
        if not memory:
            return None
        
        section_data = getattr(memory, section, None)
        if section_data is not None and isinstance(section_data, dict):
            section_data[key] = value
            setattr(memory, section, section_data)
            memory.updatedAt = datetime.now()
            self._timestamps[memory_id] = datetime.now()
        
        return memory
    
    def delete_memory(self, memory_id: str) -> bool:
        """
        Delete workflow memory.
        
        Triggers:
        - Workflow COMPLETED
        - Workflow CANCELLED
        - Timeout > 30 minutes
        - New workflow created
        """
        if memory_id in self._store:
            del self._store[memory_id]
            del self._timestamps[memory_id]
            return True
        return False
    
    def cleanup_expired(self) -> int:
        """Clean up all expired memory sessions. Returns count of cleaned items."""
        now = datetime.now()
        expired_ids = []
        for memory_id, last_access in self._timestamps.items():
            if now - last_access > timedelta(minutes=self.SESSION_TIMEOUT_MINUTES):
                expired_ids.append(memory_id)
        
        for memory_id in expired_ids:
            self.delete_memory(memory_id)
        
        return len(expired_ids)
    
    def get_active_memory_count(self) -> int:
        """Get count of active (non-expired) memory instances."""
        self.cleanup_expired()
        return len(self._store)