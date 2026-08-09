from datetime import datetime, timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.students.models import Semester


def get_business_date():
    """
    Khi DEBUG=True và có DEMO_CURRENT_DATE
    thì dùng ngày giả lập để test.
    Khi chạy thật thì dùng ngày thật.
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


def get_current_semester():
    """
    Tìm học kỳ chứa ngày hiện tại/ngày demo.
    """

    today = get_business_date()

    semester = Semester.objects.filter(
        start_date__lte=today,
        end_date__gte=today,
    ).first()

    if not semester:
        raise ValidationError({
            "reason": (
                "Không xác định được học kỳ hiện tại. "
                "Vui lòng kiểm tra dữ liệu biểu đồ năm học."
            )
        })

    return semester


def validate_personal_retention_deadline(
    reason_code
):
    """
    Lý do cá nhân chỉ được đăng ký
    trong 04 tuần đầu của học kỳ.
    """

    # Các lý do khác không áp dụng giới hạn 4 tuần
    if reason_code != "Cá nhân":
        return

    today = get_business_date()

    semester = get_current_semester()

    semester_start = semester.start_date

    # 4 tuần = 28 ngày
    deadline = (
        semester_start +
        timedelta(days=28)
    )

    last_valid_date = (
        deadline -
        timedelta(days=1)
    )

    if today >= deadline:
        raise ValidationError({
            "reason": (
                "Thời hạn đăng ký bảo lưu "
                "vì lý do cá nhân đã kết thúc. "
                "Thủ tục này chỉ được thực hiện "
                "trong 04 tuần đầu của "
                f"{semester.name}, "
                f"năm học {semester.academic_year}, "
                f"từ {semester_start:%d/%m/%Y} "
                f"đến {last_valid_date:%d/%m/%Y}."
            )
        })