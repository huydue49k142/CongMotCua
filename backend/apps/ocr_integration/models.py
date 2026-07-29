from django.db import models

from apps.common.models import BaseModel


class OCRJob(BaseModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    class DocumentType(models.TextChoices):
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
            "Đơn xin chuyển ngành đã ký",
        )

        RETENTION_SIGNED_APPLICATION = (
            "RETENTION_SIGNED_APPLICATION",
            "Đơn bảo lưu đã ký",
        )

        DROPOUT_SIGNED_APPLICATION = (
            "DROPOUT_SIGNED_APPLICATION",
            "Đơn thôi học đã ký",
        )

        RESUME_SIGNED_APPLICATION = (
            "RESUME_SIGNED_APPLICATION",
            "Đơn học tiếp đã ký",
        )

        UNKNOWN = "UNKNOWN", "Không xác định"

    uploaded_file = models.FileField(
        upload_to="ocr_uploads/"
    )

    document_type = models.CharField(
        max_length=64,
        choices=DocumentType.choices,
        default=DocumentType.UNKNOWN,
    )

    # Giữ lại để không ảnh hưởng dữ liệu và admin cũ.
    expected_title = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    def __str__(self):
        return (
            f"OCR Job {self.id} - "
            f"{self.get_document_type_display()}"
        )


class OCRResult(BaseModel):
    class SignatureType(models.TextChoices):
        HANDWRITTEN = (
            "HANDWRITTEN",
            "Chữ ký viết tay",
        )

        TYPED_NAME = (
            "TYPED_NAME",
            "Tên gõ bằng máy",
        )

        DIGITAL = (
            "DIGITAL",
            "Chữ ký số",
        )

        NOT_FOUND = (
            "NOT_FOUND",
            "Không tìm thấy",
        )

        UNCERTAIN = (
            "UNCERTAIN",
            "Không chắc chắn",
        )

    job = models.OneToOneField(
        OCRJob,
        on_delete=models.CASCADE,
        related_name="result",
    )

    # Tài liệu có đúng loại được yêu cầu không.
    is_match = models.BooleanField(
        default=False
    )

    confidence = models.FloatField(
        default=0.0,
        help_text="Độ tin cậy từ 0.0 đến 1.0",
    )

    detected_document_type = models.CharField(
        max_length=64,
        choices=OCRJob.DocumentType.choices,
        default=OCRJob.DocumentType.UNKNOWN,
    )

    extracted_text = models.TextField(
        blank=True
    )

    extracted_title = models.CharField(
        max_length=500,
        blank=True,
    )

    extracted_fields = models.JSONField(
        default=dict,
        blank=True,
    )

    missing_fields = models.JSONField(
        default=list,
        blank=True,
    )

    validation_reason = models.TextField(
        blank=True
    )

    signature_required = models.BooleanField(
        default=False
    )

    signature_present = models.BooleanField(
        default=False
    )

    signature_type = models.CharField(
        max_length=20,
        choices=SignatureType.choices,
        default=SignatureType.NOT_FOUND,
    )

    signature_confidence = models.FloatField(
        default=0.0
    )

    signature_page = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    signature_evidence = models.TextField(
        blank=True
    )

    error_message = models.TextField(
        blank=True
    )

    signature_checks = models.JSONField(
        default=dict,
        blank=True,
    )

    def __str__(self):
        return (
            f"Result for Job {self.job_id} - "
            f"Match: {self.is_match}"
        )