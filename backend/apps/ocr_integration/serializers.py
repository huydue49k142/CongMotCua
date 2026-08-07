import re
import unicodedata
from pathlib import Path

from rest_framework import serializers

from .models import OCRJob, OCRResult
from .services.document_rules import get_document_rule


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


# Các loại đơn bắt buộc phải khớp danh tính
# với sinh viên đang đăng nhập.
IDENTITY_REQUIRED_TYPES = {
    OCRJob.DocumentType.MAJOR_CHANGE_SIGNED_APPLICATION,
    OCRJob.DocumentType.RETENTION_SIGNED_APPLICATION,
    OCRJob.DocumentType.DROPOUT_SIGNED_APPLICATION,
    OCRJob.DocumentType.RESUME_SIGNED_APPLICATION,
}


def normalize_name(value: object) -> str:
    """
    Chuẩn hóa họ tên để so sánh:

    - Không phân biệt chữ hoa/thường.
    - Bỏ dấu tiếng Việt.
    - Bỏ dấu câu.
    - Gộp khoảng trắng.
    """
    normalized = str(value or "").strip().lower()

    normalized = unicodedata.normalize(
        "NFD",
        normalized,
    )

    normalized = "".join(
        character
        for character in normalized
        if unicodedata.category(character) != "Mn"
    )

    normalized = normalized.replace("đ", "d")

    normalized = re.sub(
        r"[^a-z0-9\s]",
        " ",
        normalized,
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized.strip()


def normalize_student_id(value: object) -> str:
    """
    Chuẩn hóa MSSV:

    - Không phân biệt chữ hoa/thường.
    - Bỏ khoảng trắng và ký tự phân cách.
    """
    return re.sub(
        r"[^0-9A-Za-z]",
        "",
        str(value or ""),
    ).upper()


class OCRJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRJob

        fields = (
            "id",
            "uploaded_file",
            "document_type",
            "expected_title",
            "status",
            "created_at",
        )

        read_only_fields = (
            "id",
            "expected_title",
            "status",
            "created_at",
        )


class OCRResultSerializer(serializers.ModelSerializer):
    job = OCRJobSerializer(
        read_only=True,
    )

    expected_title = serializers.CharField(
        source="job.expected_title",
        read_only=True,
    )

    document_type = serializers.CharField(
        source="job.document_type",
        read_only=True,
    )

    accepted = serializers.SerializerMethodField()

    identity_checks = serializers.SerializerMethodField()

    # Ghi đè nội dung trả về để ưu tiên lỗi danh tính.
    validation_reason = serializers.SerializerMethodField()

    class Meta:
        model = OCRResult

        fields = (
            "id",
            "job",
            "document_type",
            "expected_title",
            "detected_document_type",
            "is_match",
            "accepted",
            "confidence",
            "extracted_title",
            "extracted_fields",
            "identity_checks",
            "missing_fields",
            "validation_reason",
            "signature_checks",
            "error_message",
            "created_at",
        )

        read_only_fields = fields

    def get_identity_checks(
        self,
        result: OCRResult,
    ) -> dict:
        """
        Đối chiếu họ tên và MSSV OCR đọc được
        với sinh viên đang đăng nhập.

        expected_student_name và expected_student_id
        được truyền từ OCRVerificationView qua context.
        """
        document_type = result.job.document_type

        required = (
            document_type in IDENTITY_REQUIRED_TYPES
        )

        extracted_fields = (
            result.extracted_fields or {}
        )

        extracted_name = str(
            extracted_fields.get(
                "full_name",
                "",
            )
            or ""
        ).strip()

        extracted_student_id = str(
            extracted_fields.get(
                "student_id",
                "",
            )
            or ""
        ).strip()

        expected_name = str(
            self.context.get(
                "expected_student_name",
                "",
            )
            or ""
        ).strip()

        expected_student_id = str(
            self.context.get(
                "expected_student_id",
                "",
            )
            or ""
        ).strip()

        normalized_extracted_name = normalize_name(
            extracted_name
        )

        normalized_expected_name = normalize_name(
            expected_name
        )

        normalized_extracted_student_id = (
            normalize_student_id(
                extracted_student_id
            )
        )

        normalized_expected_student_id = (
            normalize_student_id(
                expected_student_id
            )
        )

        name_match = (
            bool(normalized_extracted_name)
            and bool(normalized_expected_name)
            and normalized_extracted_name
            == normalized_expected_name
        )

        student_id_match = (
            bool(normalized_extracted_student_id)
            and bool(normalized_expected_student_id)
            and normalized_extracted_student_id
            == normalized_expected_student_id
        )

        valid = (
            not required
            or (
                name_match
                and student_id_match
            )
        )

        return {
            "required": required,
            "valid": valid,
            "expected_name": expected_name,
            "extracted_name": extracted_name,
            "name_match": name_match,
            "expected_student_id": expected_student_id,
            "extracted_student_id": extracted_student_id,
            "student_id_match": student_id_match,
        }

    def get_validation_reason(
        self,
        result: OCRResult,
    ) -> str:
        identity = self.get_identity_checks(
            result
        )

        if identity["required"]:
            if not identity["expected_name"]:
                return (
                    "Tài khoản đang đăng nhập thiếu "
                    "họ tên sinh viên."
                )

            if not identity["expected_student_id"]:
                return (
                    "Tài khoản đang đăng nhập thiếu "
                    "mã số sinh viên."
                )

            if not identity["extracted_name"]:
                return (
                    "Không đọc được họ tên sinh viên "
                    "trên tài liệu."
                )

            if not identity["extracted_student_id"]:
                return (
                    "Không đọc được mã số sinh viên "
                    "trên tài liệu."
                )

            if not identity["name_match"]:
                return (
                    "Họ tên trên tài liệu không khớp "
                    "với tài khoản đang đăng nhập."
                )

            if not identity["student_id_match"]:
                return (
                    "Mã số sinh viên trên tài liệu "
                    "không khớp với tài khoản "
                    "đang đăng nhập."
                )

        return result.validation_reason or ""

    def get_accepted(
        self,
        result: OCRResult,
    ) -> bool:
        """
        Tài liệu chỉ được chấp nhận khi:

        - Đúng loại tài liệu được yêu cầu.
        - Độ tin cậy đạt ngưỡng.
        - Không có lỗi xử lý.
        - Họ tên và MSSV khớp tài khoản
          đối với các đơn đã ký.
        - Có đủ các vùng chữ ký bắt buộc.
        """
        correct_document = (
            result.is_match
            and result.detected_document_type
            == result.job.document_type
            and result.confidence >= 0.80
            and not result.error_message
        )

        if not correct_document:
            return False

        try:
            rule = get_document_rule(
                result.job.document_type
            )
        except ValueError:
            return False

        identity = self.get_identity_checks(
            result
        )

        if (
            identity["required"]
            and not identity["valid"]
        ):
            return False

        # Tài liệu không yêu cầu chữ ký
        # chỉ cần đúng loại và đủ độ tin cậy.
        if not rule.get(
            "require_signature",
            False,
        ):
            return True

        checks = result.signature_checks or {}

        required_zones = rule.get(
            "required_signature_zones",
            ["applicant"],
        )

        for zone_name in required_zones:
            zone_result = checks.get(
                zone_name,
                {},
            )

            if (
                zone_result.get("present")
                is not True
            ):
                return False

            confidence = zone_result.get(
                "confidence",
                0.0,
            )

            if confidence < 0.70:
                return False

        return True


class OCRVerificationRequestSerializer(
    serializers.Serializer
):
    uploaded_file = serializers.FileField()

    document_type = serializers.ChoiceField(
        choices=OCRJob.DocumentType.choices,
    )

    def validate_uploaded_file(
        self,
        uploaded_file,
    ):
        extension = Path(
            uploaded_file.name
        ).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                "Chỉ chấp nhận PDF, JPG, "
                "JPEG hoặc PNG."
            )

        if uploaded_file.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                "Dung lượng file không được "
                "vượt quá 10 MB."
            )

        return uploaded_file