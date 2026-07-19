import uuid
from django.conf import settings
from django.db import models
from apps.students.models import Student

class Request(models.Model):
    """Model YeuCau (Bảng trung tâm)"""
    class RequestType(models.TextChoices):
        MAJOR_CHANGE = "MAJOR_CHANGE", "Chuyển ngành"
        ACADEMIC_LEAVE = "ACADEMIC_LEAVE", "Ngừng học"
        RESUME_STUDIES = "RESUME_STUDIES", "Tiếp tục học"
        DROPOUT = "DROPOUT", "Thôi học"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Bản nháp"
        PENDING_REVIEW = "PENDING_REVIEW", "Chờ tiếp nhận"
        IN_PROGRESS = "IN_PROGRESS", "Đang xử lý"
        ADDITIONAL_INFO_REQUIRED = "ADDITIONAL_INFO_REQUIRED", "Yêu cầu bổ sung"
        APPROVED = "APPROVED", "Đã duyệt"
        REJECTED = "REJECTED", "Từ chối"
        CANCELLED = "CANCELLED", "Đã hủy"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="requests")
    request_type = models.CharField(max_length=50, choices=RequestType.choices)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT, db_index=True)

    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày gửi")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày hoàn thành")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.student.full_name}"

    class Meta:
        verbose_name = "Yêu cầu"
        verbose_name_plural = "Các yêu cầu"
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student'],
                condition=~models.Q(status__in=['APPROVED', 'REJECTED', 'CANCELLED']),
                name='unique_active_request_per_student'
            )
        ]
        indexes = [
            models.Index(fields=['student', 'status']),
        ]

class MajorChangeRequest(models.Model):
    """Model ChuyenNganh"""
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="major_change_request")
    reason = models.TextField(verbose_name="Lý do chuyển ngành")
    
    def __str__(self):
        return f"Yêu cầu chuyển ngành của {self.request.student.full_name}"

class AcademicLeaveRequest(models.Model):
    """Model NgungHoc"""
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="academic_leave_request")
    reason = models.TextField(verbose_name="Lý do ngừng học")

class ResumeStudiesRequest(models.Model):
    """Model TiepTucHoc"""
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="resume_studies_request")
    reason = models.TextField(verbose_name="Lý do tiếp tục học")

class DropoutRequest(models.Model):
    """Model ThoiHoc"""
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="dropout_request")
    reason = models.TextField(verbose_name="Lý do thôi học")


class RequestHistory(models.Model):
    """Model LichSuXuLy"""
    id = models.BigAutoField(primary_key=True)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="history")
    status = models.CharField(max_length=50, choices=Request.Status.choices, verbose_name="Trạng thái")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="actions", verbose_name="Người thực hiện")
    notes = models.TextField(blank=True, verbose_name="Ghi chú")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian")

    class Meta:
        verbose_name = "Lịch sử xử lý"
        verbose_name_plural = "Lịch sử xử lý"
        ordering = ['-timestamp']