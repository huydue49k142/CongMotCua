"""
API Views for AI Agent Chat.

Provides:
- POST /api/agent/chat/ - Send message to AI Agent
- GET  /api/agent/state/ - Get current workflow state
- POST /api/agent/cancel/ - Cancel active workflow
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from agent.orchestrator import AgentOrchestrator


# Global orchestrator instance (in production, use dependency injection)
_orchestrator = AgentOrchestrator()


class AgentChatView(APIView):
    """
    POST /api/agent/chat/
    
    Send a message to the AI Agent and get a response.
    
    Request:
    {
        "message": "Tôi muốn chuyển ngành",
        "session_id": "optional_session_id"  # Nếu không có, tự tạo mới
    }
    
    Response:
    {
        "response": "Câu trả lời từ AI...",
        "state": "WAIT_UPLOAD_DOCUMENT",
        "workflow": "CHANGE_MAJOR",
        "status": "IN_PROGRESS",
        "intent": "CHANGE_MAJOR",
        "error": null
    }
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        message = request.data.get('message', '').strip()
        session_id = request.data.get('session_id') or f"session_{request.user.id}"
        
        if not message:
            return Response(
                {'error': 'Vui lòng nhập tin nhắn.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process message through AI Agent
        result = _orchestrator.process_message(
            user_id=str(request.user.id),
            message=message,
            session_id=session_id
        )
        
        return Response(result, status=status.HTTP_200_OK)


class AgentStateView(APIView):
    """
    GET /api/agent/state/?session_id=xxx
    
    Get the current state of an active workflow.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get('session_id') or f"session_{request.user.id}"
        
        state = _orchestrator.get_workflow_state(session_id)
        if not state:
            return Response(
                {'error': 'Không có quy trình nào đang hoạt động.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(state, status=status.HTTP_200_OK)


class AgentCancelView(APIView):
    """
    POST /api/agent/cancel/
    
    Cancel the active workflow.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id') or f"session_{request.user.id}"
        
        result = _orchestrator.cancel_workflow(session_id)
        return Response(result, status=status.HTTP_200_OK)