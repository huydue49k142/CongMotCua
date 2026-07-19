from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import OCRVerificationRequestSerializer, OCRResultSerializer
from .services.main_service import verify_document_title

class OCRVerificationView(APIView):
    """
    API endpoint to verify a document's title using OCR.
    Accepts a file upload and an expected title.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        """
        Handles the POST request for document verification.
        """
        serializer = OCRVerificationRequestSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_file = serializer.validated_data['uploaded_file']
            expected_title = serializer.validated_data['expected_title']
            
            # Call the main service function
            result = verify_document_title(uploaded_file, expected_title)
            
            # Serialize the result for the response
            result_serializer = OCRResultSerializer(result)
            
            return Response(result_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)