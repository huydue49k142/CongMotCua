from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import DraftRequestSerializer, RequestSerializer

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