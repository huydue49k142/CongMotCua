from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Request, RequestHistory
from .serializers import DraftRequestSerializer, RequestSerializer, StaffRequestSerializer, DetailedRequestSerializer

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