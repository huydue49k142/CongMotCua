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
    "dropout_reason",
    "confirmation_by",
    "application_date",
]


def generate_dropout_form(
    context: dict[str, Any],
) -> BytesIO:
    template_path = Path(
        settings.DROPOUT_FORM_TEMPLATE
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
            "Thiếu dữ liệu tạo đơn: "
            + ", ".join(missing_fields)
        )

    document = DocxTemplate(str(template_path))
    document.render(context)

    output = BytesIO()
    document.save(output)
    output.seek(0)

    return output