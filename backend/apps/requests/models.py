import uuid
from django.conf import settings
from django.db import models
from apps.students.models import Student
from apps.common.models import BaseModel

class Request(BaseModel):
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
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="major_change_request")
    reason = models.TextField(verbose_name="Lý do chuyển ngành")

    def __str__(self):
        return f"Yêu cầu chuyển ngành của {self.request.student.full_name}"

    class Meta:
        verbose_name = "Yêu cầu Chuyển ngành"
        verbose_name_plural = "Yêu cầu Chuyển ngành"

class AcademicLeaveRequest(models.Model):
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="academic_leave_request")
    reason = models.TextField(verbose_name="Lý do ngừng học")

    class Meta:
        verbose_name = "Yêu cầu Ngừng học"
        verbose_name_plural = "Yêu cầu Ngừng học"

class ResumeStudiesRequest(models.Model):
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="resume_studies_request")
    courses = models.JSONField(verbose_name="Danh sách học phần dự kiến", default=list)
    
    class Meta:
        verbose_name = "Yêu cầu Tiếp tục học"
        verbose_name_plural = "Yêu cầu Tiếp tục học"

class DropoutRequest(models.Model):
    request = models.OneToOneField(Request, on_delete=models.CASCADE, primary_key=True, related_name="dropout_request")
    reason = models.TextField(verbose_name="Lý do thôi học")

    class Meta:
        verbose_name = "Yêu cầu Thôi học"
        verbose_name_plural = "Yêu cầu Thôi học"

class RequestHistory(models.Model):
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

class RequestDocument(models.Model):
    class DocumentType(models.TextChoices):
        INITIAL = "INITIAL", "Hồ sơ ban đầu"
        SUPPLEMENTARY = "SUPPLEMENTARY", "Hồ sơ bổ sung"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="request_documents/", max_length=255)
    document_type = models.CharField(max_length=50, choices=DocumentType.choices, default=DocumentType.INITIAL)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            import os
            self.file_name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Tài liệu đính kèm"
        verbose_name_plural = "Tài liệu đính kèm"
        ordering = ['uploaded_at']