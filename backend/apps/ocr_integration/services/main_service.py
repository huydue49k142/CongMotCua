from django.core.files.uploadedfile import UploadedFile
from django.db import transaction

from ..models import OCRJob, OCRResult
from .document_rules import get_document_rule
from .file_processor import process_uploaded_file
from .gemini_service import analyze_document_with_gemini
from .ocr_engine import extract_text_from_images
import logging

logger = logging.getLogger(__name__)

def verify_document(
    uploaded_file: UploadedFile,
    document_type: str,
) -> OCRResult:
    """
    Kiểm tra tài liệu bằng Tesseract và Gemini.

    Các nhiệm vụ:
    - Kiểm tra đúng loại tài liệu.
    - Trích xuất thông tin.
    - Kiểm tra chữ ký nếu loại đơn yêu cầu.
    """

    rule = get_document_rule(document_type)

    job = OCRJob.objects.create(
        uploaded_file=uploaded_file,
        document_type=document_type,
        expected_title=rule["expected_name"],
        status=OCRJob.Status.PENDING,
    )

    try:
        job.status = OCRJob.Status.PROCESSING
        job.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # PDF/ảnh thành danh sách ảnh PIL.
        images = process_uploaded_file(
            job.uploaded_file
        )

        if not images:
            raise ValueError(
                "Không tìm thấy trang tài liệu."
            )

        # Tesseract đọc toàn bộ các trang.
        ocr_text = extract_text_from_images(
            images
        )

        # Gemini kiểm tra loại tài liệu,
        # chữ ký và trích xuất thông tin.
        analysis = analyze_document_with_gemini(
            images=images,
            document_type=document_type,
            ocr_text=ocr_text,
        )

        signature = analysis.signature

        with transaction.atomic():
            result, _ = OCRResult.objects.update_or_create(
                job=job,
                defaults={
                    "is_match": analysis.is_match,
                    "confidence": analysis.confidence,
                    "detected_document_type": (
                        analysis.detected_document_type
                        or OCRJob.DocumentType.UNKNOWN
                    ),
                    "extracted_text": ocr_text,
                    "extracted_title": (
                        analysis.extracted_title
                    ),
                    "extracted_fields": (
                        analysis.extracted_fields.model_dump(
                            exclude_none=True
                        )
                    ),

                    "signature_checks": (
                        analysis.signature_checks.model_dump()
                    ),

                    "missing_fields": (
                        analysis.missing_fields
                    ),
                    "validation_reason": (
                        analysis.validation_reason
                    ),
                    "signature_required": (
                        signature.required
                    ),
                    "signature_present": (
                        signature.present
                    ),
                    "signature_type": (
                        signature.type
                    ),
                    "signature_confidence": (
                        signature.confidence
                    ),
                    "signature_page": (
                        signature.page
                    ),
                    "signature_evidence": (
                        signature.evidence
                    ),
                    "error_message": "",
                },
            )

            job.status = OCRJob.Status.COMPLETED
            job.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        return result

    except Exception as error:
        logger.exception(
            "Lỗi xử lý OCR/Gemini: %s",
            error,
        )
        with transaction.atomic():
            job.status = OCRJob.Status.FAILED
            job.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            result, _ = OCRResult.objects.update_or_create(
                job=job,
                defaults={
                    "is_match": False,
                    "confidence": 0.0,
                    "detected_document_type": (
                        OCRJob.DocumentType.UNKNOWN
                    ),
                    "signature_required": (
                        rule["require_signature"]
                    ),
                    "signature_present": False,
                    "signature_type": (
                        OCRResult.SignatureType.UNCERTAIN
                    ),
                    "error_message": str(error),
                    "validation_reason": (
                        "Không thể xử lý tài liệu."
                    ),
                },
            )

        return result