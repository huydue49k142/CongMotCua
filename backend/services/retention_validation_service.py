from datetime import datetime, timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError


def get_business_date():
    """
    Trả về ngày dùng cho nghiệp vụ.

    - Khi DEBUG=True và có DEMO_CURRENT_DATE:
      dùng ngày giả lập để test.
    - Khi chạy thật:
      dùng ngày thật của hệ thống.
    """

    demo_date = getattr(
        settings,
        "DEMO_CURRENT_DATE",
        ""
    )

    if settings.DEBUG and demo_date:
        try:
            return datetime.strptime(
                demo_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            raise ValidationError({
                "detail": (
                    "DEMO_CURRENT_DATE phải có "
                    "định dạng YYYY-MM-DD."
                )
            })

    return timezone.localdate()


def get_retention_deadline_info():
    """
    Lấy thông tin thời hạn 04 tuần đầu học kỳ.
    """

    semester_start_value = getattr(
        settings,
        "SEMESTER_START_DATE",
        ""
    )

    if not semester_start_value:
        raise ValidationError({
            "detail": (
                "Hệ thống chưa cấu hình "
                "ngày bắt đầu học kỳ."
            )
        })

    try:
        semester_start = datetime.strptime(
            semester_start_value,
            "%Y-%m-%d"
        ).date()
    except ValueError:
        raise ValidationError({
            "detail": (
                "SEMESTER_START_DATE phải có "
                "định dạng YYYY-MM-DD."
            )
        })

    # 4 tuần = 28 ngày
    deadline = (
        semester_start +
        timedelta(days=28)
    )

    last_valid_date = (
        deadline -
        timedelta(days=1)
    )

    return {
        "today": get_business_date(),
        "semester_start": semester_start,
        "deadline": deadline,
        "last_valid_date": last_valid_date,
    }


def validate_personal_retention_deadline(
    reason_code: str
):
    """
    BR2.2-4:
    Chỉ lý do cá nhân mới bị giới hạn
    trong 04 tuần đầu học kỳ.
    """

    reason_code = str(
        reason_code or ""
    ).strip()

    # Các lý do khác không áp dụng rule 4 tuần
    if reason_code != "Cá nhân":
        return get_retention_deadline_info()

    info = get_retention_deadline_info()

    today = info["today"]
    semester_start = info["semester_start"]
    deadline = info["deadline"]
    last_valid_date = info["last_valid_date"]

    # Chưa bắt đầu học kỳ
    if today < semester_start:
        raise ValidationError({
            "reason": (
                "Chưa đến thời gian thực hiện "
                "thủ tục bảo lưu vì lý do cá nhân. "
                f"Học kỳ bắt đầu từ "
                f"{semester_start:%d/%m/%Y}."
            )
        })

    # Đã quá 4 tuần đầu
    if today >= deadline:
        raise ValidationError({
            "reason": (
                "Thời hạn giải quyết thủ tục "
                "bảo lưu vì lý do cá nhân "
                "đã kết thúc. "
                "Thủ tục này chỉ được thực hiện "
                "trong 04 tuần đầu của học kỳ, "
                f"từ {semester_start:%d/%m/%Y} "
                f"đến {last_valid_date:%d/%m/%Y}. "
                "Vui lòng liên hệ trực tiếp "
                "Phòng Đào tạo để được tư vấn thêm."
            )
        })

    return info