from rest_framework import status
from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import OCRJob
from .serializers import (
    OCRResultSerializer,
    OCRVerificationRequestSerializer,
)
from .services.main_service import verify_document


class OCRVerificationView(APIView):
    """
    API kiểm tra:

    - Đúng loại tài liệu.
    - Thông tin sinh viên trên đơn.
    - Chữ ký bắt buộc.
    - Trích xuất dữ liệu từ tài liệu.
    """

    permission_classes = [
        IsAuthenticated,
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
        # Lấy hồ sơ sinh viên đang đăng nhập.
        student = getattr(
            request.user,
            "student_profile",
            None,
        )

        if student is None:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên "
                    "của tài khoản đang đăng nhập."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Kiểm tra dữ liệu file gửi lên.
        request_serializer = (
            OCRVerificationRequestSerializer(
                data=request.data,
            )
        )

        request_serializer.is_valid(
            raise_exception=True,
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

        # Chạy OCR, Gemini và kiểm tra chữ ký.
        result = verify_document(
            uploaded_file=uploaded_file,
            document_type=document_type,
        )

        # Truyền thông tin tài khoản vào serializer
        # để so sánh với họ tên và MSSV trên đơn.
        response_serializer = OCRResultSerializer(
            result,
            context={
                "request": request,
                "expected_student_name":
                    student.full_name,
                "expected_student_id":
                    student.student_id,
            },
        )

        response_data = response_serializer.data

        # OCR hoặc Gemini xử lý thất bại.
        if (
            result.job.status
            == OCRJob.Status.FAILED
        ):
            return Response(
                response_data,
                status=(
                    status
                    .HTTP_422_UNPROCESSABLE_ENTITY
                ),
            )

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )