from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Student
from .serializers import StudentProfileSerializer

class StudentProfileAPIView(APIView):
    """
    API view to retrieve a student's full profile.
    """
    def get(self, request, student_id, format=None):
        """
        Return a student's profile data.
        """
        try:
            student = Student.objects.select_related(
                'user', 
                'student_class__major'
            ).get(student_id=student_id)
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)