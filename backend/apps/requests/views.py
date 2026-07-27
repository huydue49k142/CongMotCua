from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Request
from .serializers import DraftRequestSerializer, RequestSerializer

from rest_framework import generics, permissions

class RequestListAPIView(generics.ListAPIView):
    """
    API view to list all requests for the currently authenticated student.
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student'):
            return Request.objects.filter(student=user.student).order_by('-created_at')
        return Request.objects.none()

class DraftRequestAPIView(APIView):
    """
    API view to create a new draft procedure request.
    """
    def post(self, request, format=None):
        """
        Create a new draft request for a student.
        """
        serializer = DraftRequestSerializer(data=request.data)
        if serializer.is_valid():
            new_request = serializer.save()
            response_serializer = RequestSerializer(new_request)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)