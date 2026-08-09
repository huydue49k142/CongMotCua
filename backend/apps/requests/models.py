import os
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
        PENDING = "PENDING", "Chờ tiếp nhận"
        ADDITIONAL_INFO_REQUIRED = "ADDITIONAL_INFO_REQUIRED", "Yêu cầu bổ sung"
        APPROVED = "APPROVED", "Đã duyệt"
        REJECTED = "REJECTED", "Từ chối"
        DELETED = "DELETED", "Đã xóa"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="requests")
    request_type = models.CharField(max_length=50, choices=RequestType.choices)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT, db_index=True)
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày gửi")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày hoàn thành")
    supplement_requirements = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Danh sách tài liệu yêu cầu bổ sung",
    )

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.student.full_name}"

    class Meta:
        verbose_name = "Yêu cầu"
        verbose_name_plural = "Các yêu cầu"
        ordering = ['-created_at']
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=['student'],
        #         condition=~models.Q(status__in=['APPROVED', 'REJECTED', 'DELETED']),
        #         name='unique_active_request_per_student'
        #     )
        # ]
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
    document_key = models.CharField(
        max_length=100,
        blank=True,
        default="",
        db_index=True,
        verbose_name="Mã loại tài liệu",
    )
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

class ProcedureDraft(BaseModel):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="procedure_drafts",
    )

    request_type = models.CharField(
        max_length=50,
        choices=Request.RequestType.choices,
    )

    is_started = models.BooleanField(
        default=False
    )

    current_step = models.PositiveSmallIntegerField(
        default=1
    )

    # Chỉ lưu dữ liệu có thể chuyển thành JSON:
    # form, trạng thái, kết quả OCR, mã hồ sơ...
    draft_data = models.JSONField(
        default=dict,
        blank=True,
    )

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.get_request_type_display()}"
        )

    class Meta:
        verbose_name = "Bản nháp thủ tục"
        verbose_name_plural = "Các bản nháp thủ tục"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "request_type",
                ],
                name=(
                    "unique_procedure_draft_"
                    "per_student_and_type"
                ),
            )
        ]


def procedure_draft_document_upload_to(instance, filename):
    """
    Lưu tài liệu bản nháp theo sinh viên, thủ tục và loại tài liệu.
    """
    extension = os.path.splitext(filename)[1].lower()
    stored_name = f"{uuid.uuid4().hex}{extension}"

    return (
        "procedure_drafts/"
        f"{instance.draft.student.student_id}/"
        f"{instance.draft.request_type}/"
        f"{instance.document_key}/"
        f"{stored_name}"
    )


class ProcedureDraftDocument(models.Model):
    class DocumentKey(models.TextChoices):
        DROPOUT_SIGNED_APPLICATION = (
            "DROPOUT_SIGNED_APPLICATION",
            "Đơn thôi học đã ký",
        )
        ACADEMIC_LEAVE_EVIDENCE = (
            "ACADEMIC_LEAVE_EVIDENCE",
            "Minh chứng bảo lưu",
        )
        ACADEMIC_LEAVE_SIGNED_APPLICATION = (
            "ACADEMIC_LEAVE_SIGNED_APPLICATION",
            "Đơn bảo lưu đã ký",
        )
        RESUME_SIGNED_APPLICATION = (
            "RESUME_SIGNED_APPLICATION",
            "Đơn học tiếp đã ký",
        )
        MAJOR_CHANGE_ADMISSION_LETTER = (
            "MAJOR_CHANGE_ADMISSION_LETTER",
            "Giấy báo trúng tuyển",
        )
        MAJOR_CHANGE_GRADUATION_CERTIFICATE = (
            "MAJOR_CHANGE_GRADUATION_CERTIFICATE",
            "Giấy chứng nhận tốt nghiệp THPT",
        )
        MAJOR_CHANGE_SIGNED_APPLICATION = (
            "MAJOR_CHANGE_SIGNED_APPLICATION",
            "Đơn chuyển ngành đã ký",
        )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    draft = models.ForeignKey(
        ProcedureDraft,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    document_key = models.CharField(
        max_length=100,
        choices=DocumentKey.choices,
    )

    file = models.FileField(
        upload_to=procedure_draft_document_upload_to,
        max_length=500,
    )

    original_name = models.CharField(
        max_length=255,
    )

    content_type = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    file_size = models.PositiveBigIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.draft.get_request_type_display()} - "
            f"{self.get_document_key_display()} - "
            f"{self.original_name}"
        )

    class Meta:
        verbose_name = "Tài liệu bản nháp"
        verbose_name_plural = "Các tài liệu bản nháp"
        ordering = ["created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "draft",
                    "document_key",
                ],
                name=(
                    "unique_document_key_"
                    "per_procedure_draft"
                ),
            )
        ]