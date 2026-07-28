from io import BytesIO
from pathlib import Path
from typing import Any

from django.conf import settings
from docxtpl import DocxTemplate


REQUIRED_TEMPLATE_FIELDS = [
    "full_name",
    "date_of_birth",
    "class_name",
    "student_id",
    "phone",
    "email",
    "faculty_name",
    "retention_duration",
    "retention_reason",
    "attachment_note",
    "application_date",
]


def generate_retention_form(
    context: dict[str, Any],
) -> BytesIO:
    """
    Điền dữ liệu vào mẫu đơn xin nghỉ học tạm thời
    và trả file Word trong bộ nhớ.
    """

    template_path = Path(
        settings.RETENTION_FORM_TEMPLATE
    )

    if not template_path.exists():
        raise FileNotFoundError(
            f"Không tìm thấy template: {template_path}"
        )

    missing_fields = [
        field
        for field in REQUIRED_TEMPLATE_FIELDS
        if not context.get(field)
    ]

    if missing_fields:
        raise ValueError(
            "Thiếu dữ liệu tạo đơn bảo lưu: "
            + ", ".join(missing_fields)
        )

    document = DocxTemplate(str(template_path))
    document.render(context)

    output = BytesIO()
    document.save(output)
    output.seek(0)

    return output