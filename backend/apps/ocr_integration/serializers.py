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
        read_only=True
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
            "missing_fields",
            "validation_reason",
            "signature_checks",
            "error_message",
            "created_at",
        )

        read_only_fields = fields

    def get_accepted(
        self,
        result: OCRResult,
    ) -> bool:
        """
        Tài liệu được chấp nhận khi:

        - Đúng loại tài liệu được yêu cầu.
        - Độ tin cậy đạt ngưỡng.
        - Không có lỗi xử lý.
        - Có đủ các vùng chữ ký bắt buộc
          đối với loại thủ tục tương ứng.
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

        # Các tài liệu không yêu cầu chữ ký
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

            if zone_result.get("present") is not True:
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
        choices=OCRJob.DocumentType.choices
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