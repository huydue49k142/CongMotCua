import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RuleCheckInputSerializer, RuleCheckOutputSerializer

class CheckBusinessRuleAPIView(APIView):
    """
    API view to check business rules for a given student and procedure.
    """
    def post(self, request, format=None):
        """
        Check rules and return a PASS or FAIL result.
        """
        input_serializer = RuleCheckInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # TODO: Implement actual rule engine logic here.
        # For now, we'll return a random result for demonstration.
        result = random.choice(["PASS", "FAIL"])
        
        details = {}
        if result == "FAIL":
            details = {
                "gpa": "PASS",
                "study_duration": "FAIL - Sinh viên năm cuối",
                "discipline": "PASS"
            }

        output_data = {
            "result": result,
            "details": details
        }
        
        output_serializer = RuleCheckOutputSerializer(data=output_data)
        output_serializer.is_valid(raise_exception=True)

        return Response(output_serializer.data, status=status.HTTP_200_OK)