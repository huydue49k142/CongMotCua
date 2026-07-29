from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import OCRJob
from .serializers import OCRVerificationRequestSerializer, OCRResultSerializer
from .services.main_service import verify_document

class OCRVerificationView(APIView):
    """
    API kiểm tra loại tài liệu, chữ ký
    và trích xuất thông tin.
    """

    permission_classes = [
        IsAuthenticated
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(
        self,
        request,
        *args,
        **kwargs,
    ):
        request_serializer = (
            OCRVerificationRequestSerializer(
                data=request.data
            )
        )

        request_serializer.is_valid(
            raise_exception=True
        )

        uploaded_file = (
            request_serializer.validated_data[
                "uploaded_file"
            ]
        )

        document_type = (
            request_serializer.validated_data[
                "document_type"
            ]
        )

        result = verify_document(
            uploaded_file=uploaded_file,
            document_type=document_type,
        )

        response_serializer = OCRResultSerializer(
            result
        )

        if result.job.status == OCRJob.Status.FAILED:
            return Response(
                response_serializer.data,
                status=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
            )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )