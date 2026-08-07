import mimetypes
import os

from django.http import FileResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser

from .models import Request, RequestHistory, ProcedureDraft, ProcedureDraftDocument
from .serializers import (
    DraftRequestSerializer,
    RequestSerializer,
    StaffRequestSerializer,
    DetailedRequestSerializer,
    ProcedureDraftSerializer,
    ProcedureDraftDocumentSerializer,
)

from rest_framework import generics, permissions

class StaffPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'STAFF'

class StaffRequestListAPIView(generics.ListAPIView):
    serializer_class = StaffRequestSerializer
    permission_classes = [StaffPermission]

    def get_queryset(self):
        return Request.objects.exclude(status=Request.Status.DRAFT).order_by('-submitted_at', '-created_at')

class StaffDashboardStatsAPIView(APIView):
    permission_classes = [StaffPermission]

    def get(self, request, format=None):
        pending = Request.objects.filter(status=Request.Status.PENDING).count()
        warning = Request.objects.filter(status=Request.Status.ADDITIONAL_INFO_REQUIRED).count()
        rejected = Request.objects.filter(status__in=[Request.Status.REJECTED, Request.Status.DELETED]).count()
        completed = Request.objects.filter(status=Request.Status.APPROVED).count()
        
        return Response({
            'pending': pending,
            'warning': warning,
            'rejected': rejected,
            'completed': completed
        })

class RequestListAPIView(generics.ListAPIView):
    """
    API view to list all requests for the currently authenticated student.
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student_profile'):
            return Request.objects.filter(student=user.student_profile).exclude(status=Request.Status.DRAFT).order_by('-created_at')
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

class RequestDetailAPIView(generics.RetrieveDestroyAPIView):
    """
    API view to retrieve or delete a single request for a student.
    """
    serializer_class = DetailedRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student_profile'):
            return Request.objects.filter(student=user.student_profile)
        return Request.objects.none()

    def perform_destroy(self, instance):
        if instance.status != Request.Status.PENDING:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Chỉ có thể xóa hồ sơ ở trạng thái Chờ xử lý.")
        instance.status = Request.Status.DELETED
        instance.save()

class StaffRequestDetailAPIView(generics.RetrieveAPIView):
    """
    API view for staff to retrieve a single request.
    """
    serializer_class = DetailedRequestSerializer
    permission_classes = [StaffPermission]
    queryset = Request.objects.all()

class StaffRequestActionAPIView(APIView):
    permission_classes = [StaffPermission]

    def post(self, request, pk, format=None):
        try:
            req = Request.objects.get(pk=pk)
        except Request.DoesNotExist:
            return Response({'error': 'Không tìm thấy hồ sơ.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        notes = request.data.get('notes', '')

        if action not in ['APPROVE', 'REJECT', 'REQUEST_INFO']:
            return Response({'error': 'Hành động không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

        if action in ['REJECT', 'REQUEST_INFO'] and not notes:
            return Response({'error': 'Vui lòng cung cấp lý do.'}, status=status.HTTP_400_BAD_REQUEST)

        status_mapping = {
            'APPROVE': Request.Status.APPROVED,
            'REJECT': Request.Status.REJECTED,
            'REQUEST_INFO': Request.Status.ADDITIONAL_INFO_REQUIRED,
        }

        new_status = status_mapping[action]
        req.status = new_status
        req.save()

        # Save history
        RequestHistory.objects.create(
            request=req,
            status=new_status,
            actor=request.user,
            notes=notes
        )

        # Create notification for student
        from apps.notifications.models import Notification
        message = ""
        type_str = req.get_request_type_display()
        if action == 'APPROVE':
            message = f"Hồ sơ {type_str} của bạn đã được phê duyệt."
        elif action == 'REJECT':
            message = f"Hồ sơ {type_str} của bạn đã bị từ chối."
        elif action == 'REQUEST_INFO':
            message = f"Hồ sơ {type_str} của bạn yêu cầu bổ sung thêm thông tin."

        Notification.objects.create(
            user=req.student.user,
            request=req,
            message=message
        )

        return Response({'success': True, 'status': new_status})

class StudentResubmitAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, format=None):
        try:
            user = request.user
            if hasattr(user, 'student_profile'):
                req = Request.objects.get(pk=pk, student=user.student_profile)
            else:
                return Response({'error': 'Bạn không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)
        except Request.DoesNotExist:
            return Response({'error': 'Không tìm thấy hồ sơ.'}, status=status.HTTP_404_NOT_FOUND)

        if req.status != Request.Status.ADDITIONAL_INFO_REQUIRED:
            return Response({'error': 'Hồ sơ không ở trạng thái yêu cầu bổ sung.'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Vui lòng đính kèm tài liệu bổ sung.'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import RequestDocument
        RequestDocument.objects.create(
            request=req,
            file=file_obj,
            document_type=RequestDocument.DocumentType.SUPPLEMENTARY
        )

        # Trạng thái chuyển về PENDING
        new_status = Request.Status.PENDING
        req.status = new_status
        req.save()

        # Save history
        from .models import RequestHistory
        RequestHistory.objects.create(
            request=req,
            status=new_status,
            actor=user,
            notes="Sinh viên đã nộp bổ sung hồ sơ."
        )

        return Response({'success': True, 'status': new_status})

class ProcedureDraftAPIView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_student(self, request):
        user = request.user

        if not hasattr(user, "student_profile"):
            return None

        return user.student_profile

    def is_valid_request_type(
        self,
        request_type,
    ):
        valid_types = {
            value
            for value, _label
            in Request.RequestType.choices
        }

        return request_type in valid_types

    def get(
        self,
        request,
        request_type,
        format=None,
    ):
        student = self.get_student(request)

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not self.is_valid_request_type(
            request_type
        ):
            return Response(
                {
                    "error":
                    "Loại thủ tục không hợp lệ."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        draft = ProcedureDraft.objects.filter(
            student=student,
            request_type=request_type,
        ).first()

        if not draft:
            return Response({
                "exists": False,
                "draft": None,
            })

        serializer = ProcedureDraftSerializer(
            draft
        )

        return Response({
            "exists": True,
            "draft": serializer.data,
        })

    def put(
        self,
        request,
        request_type,
        format=None,
    ):
        student = self.get_student(request)

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not self.is_valid_request_type(
            request_type
        ):
            return Response(
                {
                    "error":
                    "Loại thủ tục không hợp lệ."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_started = request.data.get(
            "is_started",
            False,
        )

        current_step = request.data.get(
            "current_step",
            1,
        )

        draft_data = request.data.get(
            "draft_data",
            {},
        )

        try:
            current_step = int(current_step)
        except (TypeError, ValueError):
            return Response(
                {
                    "error":
                    "Bước hiện tại không hợp lệ."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(draft_data, dict):
            return Response(
                {
                    "error":
                    "Dữ liệu bản nháp không hợp lệ."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        draft, created = (
            ProcedureDraft.objects.update_or_create(
                student=student,
                request_type=request_type,
                defaults={
                    "is_started": bool(is_started),
                    "current_step": current_step,
                    "draft_data": draft_data,
                },
            )
        )

        serializer = ProcedureDraftSerializer(
            draft
        )

        return Response(
            {
                "success": True,
                "created": created,
                "draft": serializer.data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    def delete(
        self,
        request,
        request_type,
        format=None,
    ):
        student = self.get_student(request)

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        ProcedureDraft.objects.filter(
            student=student,
            request_type=request_type,
        ).delete()

        return Response({
            "success": True
        })


class ProcedureDraftDocumentAPIView(APIView):
    """
    GET:
        Lấy danh sách file đã lưu của một bản nháp thủ tục.

    POST:
        Lưu hoặc thay thế một file theo document_key.

    API này được bổ sung riêng cho file bản nháp, không thay đổi
    ProcedureDraftAPIView và các API thủ tục đang hoạt động.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    MAX_FILE_SIZE = 20 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg",
        ".doc",
        ".docx",
    }

    ALLOWED_DOCUMENT_KEYS = {
        Request.RequestType.DROPOUT: {
            ProcedureDraftDocument.DocumentKey
            .DROPOUT_SIGNED_APPLICATION,
        },
        Request.RequestType.ACADEMIC_LEAVE: {
            ProcedureDraftDocument.DocumentKey
            .ACADEMIC_LEAVE_EVIDENCE,
            ProcedureDraftDocument.DocumentKey
            .ACADEMIC_LEAVE_SIGNED_APPLICATION,
        },
        Request.RequestType.RESUME_STUDIES: {
            ProcedureDraftDocument.DocumentKey
            .RESUME_SIGNED_APPLICATION,
        },
        Request.RequestType.MAJOR_CHANGE: {
            ProcedureDraftDocument.DocumentKey
            .MAJOR_CHANGE_ADMISSION_LETTER,
            ProcedureDraftDocument.DocumentKey
            .MAJOR_CHANGE_GRADUATION_CERTIFICATE,
            ProcedureDraftDocument.DocumentKey
            .MAJOR_CHANGE_SIGNED_APPLICATION,
        },
    }

    def get_student(self, request):
        return getattr(
            request.user,
            "student_profile",
            None,
        )

    def validate_request_type(
        self,
        request_type,
    ):
        valid_types = {
            value
            for value, _label
            in Request.RequestType.choices
        }

        return request_type in valid_types

    def get_draft(
        self,
        student,
        request_type,
        create=False,
    ):
        queryset = ProcedureDraft.objects.filter(
            student=student,
            request_type=request_type,
        )

        if not create:
            return queryset.first()

        draft, _created = (
            ProcedureDraft.objects.get_or_create(
                student=student,
                request_type=request_type,
                defaults={
                    "is_started": True,
                    "current_step": 1,
                    "draft_data": {},
                },
            )
        )

        return draft

    def get(
        self,
        request,
        request_type,
        format=None,
    ):
        student = self.get_student(request)

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not self.validate_request_type(
            request_type
        ):
            return Response(
                {
                    "error":
                    "Loại thủ tục không hợp lệ."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        draft = self.get_draft(
            student,
            request_type,
        )

        if not draft:
            return Response({
                "documents": [],
            })

        documents = draft.documents.all()

        serializer = (
            ProcedureDraftDocumentSerializer(
                documents,
                many=True,
                context={
                    "request": request,
                },
            )
        )

        return Response({
            "documents": serializer.data,
        })

    def post(
        self,
        request,
        request_type,
        format=None,
    ):
        student = self.get_student(request)

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not self.validate_request_type(
            request_type
        ):
            return Response(
                {
                    "error":
                    "Loại thủ tục không hợp lệ."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded_file = request.FILES.get(
            "file"
        )

        document_key = str(
            request.data.get(
                "document_key",
                "",
            )
        ).strip()

        if not uploaded_file:
            return Response(
                {
                    "error":
                    "Vui lòng chọn file tài liệu."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_keys = self.ALLOWED_DOCUMENT_KEYS.get(
            request_type,
            set(),
        )

        if document_key not in allowed_keys:
            return Response(
                {
                    "error":
                    "Loại tài liệu không phù hợp với thủ tục."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        extension = os.path.splitext(
            uploaded_file.name
        )[1].lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            return Response(
                {
                    "error":
                    "Chỉ chấp nhận PDF, PNG, JPG, JPEG, DOC hoặc DOCX."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.size > self.MAX_FILE_SIZE:
            return Response(
                {
                    "error":
                    "File không được vượt quá 20 MB."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        draft = self.get_draft(
            student,
            request_type,
            create=True,
        )

        document = (
            ProcedureDraftDocument.objects
            .filter(
                draft=draft,
                document_key=document_key,
            )
            .first()
        )

        created = document is None
        old_file_name = None

        if document is None:
            document = ProcedureDraftDocument(
                draft=draft,
                document_key=document_key,
            )
        elif document.file:
            old_file_name = document.file.name

        document.file = uploaded_file
        document.original_name = (
            uploaded_file.name
        )
        document.content_type = (
            uploaded_file.content_type
            or ""
        )
        document.file_size = (
            uploaded_file.size
        )
        document.save()

        if (
            old_file_name
            and old_file_name
            != document.file.name
        ):
            document.file.storage.delete(
                old_file_name
            )

        serializer = (
            ProcedureDraftDocumentSerializer(
                document,
                context={
                    "request": request,
                },
            )
        )

        return Response(
            {
                "success": True,
                "created": created,
                "document": serializer.data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class ProcedureDraftDocumentDetailAPIView(
    APIView
):
    """
    Xóa một file bản nháp thuộc đúng sinh viên đang đăng nhập.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def delete(
        self,
        request,
        request_type,
        document_id,
        format=None,
    ):
        student = getattr(
            request.user,
            "student_profile",
            None,
        )

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        document = (
            ProcedureDraftDocument.objects
            .filter(
                id=document_id,
                draft__student=student,
                draft__request_type=request_type,
            )
            .first()
        )

        if not document:
            return Response(
                {
                    "error":
                    "Không tìm thấy tài liệu."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if document.file:
            document.file.delete(
                save=False
            )

        document.delete()

        return Response({
            "success": True,
        })


class ProcedureDraftDocumentFileAPIView(
    APIView
):
    """
    Mở file trong tab mới thông qua API có xác thực.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(
        self,
        request,
        request_type,
        document_id,
        format=None,
    ):
        student = getattr(
            request.user,
            "student_profile",
            None,
        )

        if not student:
            return Response(
                {
                    "error":
                    "Không tìm thấy thông tin sinh viên."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        document = (
            ProcedureDraftDocument.objects
            .filter(
                id=document_id,
                draft__student=student,
                draft__request_type=request_type,
            )
            .first()
        )

        if not document:
            return Response(
                {
                    "error":
                    "Không tìm thấy tài liệu."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not document.file:
            return Response(
                {
                    "error":
                    "File tài liệu không còn tồn tại."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        guessed_type, _encoding = (
            mimetypes.guess_type(
                document.original_name
            )
        )

        response = FileResponse(
            document.file.open("rb"),
            as_attachment=False,
            filename=document.original_name,
            content_type=(
                guessed_type
                or document.content_type
                or "application/octet-stream"
            ),
        )

        response["Content-Disposition"] = (
            'inline; filename="'
            f'{document.original_name}"'
        )

        return response