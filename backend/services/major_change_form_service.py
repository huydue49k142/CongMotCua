from io import BytesIO
from pathlib import Path
from typing import Any

from django.conf import settings
from docxtpl import DocxTemplate


REQUIRED_TEMPLATE_FIELDS = [
    "full_name",
    "date_of_birth",
    "place_of_birth",
    "class_name",
    "student_id",
    "current_major",
    "enrollment_year",
    "training_type",
    "id_number",
    "id_issue_date",
    "id_issue_place",
    "phone",
    "target_major",
    "admission_method",
    "transfer_reason",
    "evidence_note",
    "application_place",
    "application_date",
]


def generate_major_change_form(
    context: dict[str, Any],
) -> BytesIO:
    """
    Tạo Đơn xin chuyển ngành đào tạo từ template Word.
    """

    template_path = Path(
        settings.MAJOR_CHANGE_FORM_TEMPLATE
    )

    if not template_path.exists():
        raise FileNotFoundError(
            f"Không tìm thấy template: {template_path}"
        )

    missing_fields = [
        field
        for field in REQUIRED_TEMPLATE_FIELDS
        if not str(context.get(field, "")).strip()
    ]

    if missing_fields:
        raise ValueError(
            "Thiếu dữ liệu tạo đơn chuyển ngành: "
            + ", ".join(missing_fields)
        )

    document = DocxTemplate(str(template_path))
    document.render(context)

    output = BytesIO()
    document.save(output)
    output.seek(0)

    return output