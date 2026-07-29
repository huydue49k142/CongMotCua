from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime
from rest_framework.exceptions import (
    APIException,
    ValidationError,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.exceptions import APIException

from apps.students.models import Student
from services.major_change_form_service import generate_major_change_form
from services.document_preview_service import convert_docx_to_pdf

from apps.students.models import Student

#THÔI HỌC
from services.dropout_form_service import generate_dropout_form


DOCX_CONTENT_TYPE = (
    "application/vnd.openxmlformats-officedocument."
    "wordprocessingml.document"
)

DROPOUT_REASON_LABELS = {
    "suc_khoe": "Sức khỏe",
    "ly_do_ca_nhan": "Lý do cá nhân",
    "hoan_canh_gia_dinh": "Hoàn cảnh gia đình",
    "khong_du_kha_nang_tai_chinh": "Không đủ khả năng tài chính",
    "chuyen_truong": "Chuyển sang trường khác",
}

def format_date(value) -> str:
    """
    Chuyển ngày thành định dạng dd/mm/yyyy.
    """
    if not value:
        return ""

    if hasattr(value, "strftime"):
        return value.strftime("%d/%m/%Y")

    return str(value)


class DownloadDropoutFormAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Chỉ nhận lý do thôi học từ giao diện.
        reason_code = str(
            request.data.get("reason", "")
        ).strip()

        dropout_reason = DROPOUT_REASON_LABELS.get(
            reason_code,
            reason_code,
        )

        if not dropout_reason:
            raise ValidationError({
                "reason": "Vui lòng nhập lý do thôi học."
            })

        # Lấy sinh viên theo tài khoản đang đăng nhập.
        student = get_object_or_404(
            Student.objects.select_related(
                "student_class__major",
                "user",
            ),
            user=request.user,
        )

        # Dữ liệu lấy trực tiếp từ database.
        phone = str(student.phone or "Chưa cập nhật").strip()
        email = str(request.user.email or "").strip()

        class_name = str(
            student.student_class.class_id or ""
        ).strip()

        # Hiện model Major chỉ có name, nên tạm dùng tên ngành.
        faculty_name = str(
            student.student_class.major.name or ""
        ).strip()

        today = timezone.localdate()

        context = {
            "full_name": student.full_name,
            "date_of_birth": format_date(
                student.date_of_birth
            ),
            "class_name": class_name,
            "student_id": student.student_id,
            "phone": phone,
            "email": email,
            "faculty_name": faculty_name,
            "dropout_reason": dropout_reason,
            "confirmation_by": (
                "Phụ huynh và chính quyền địa phương"
            ),
            "application_date": (
                f"ngày {today.day:02d} "
                f"tháng {today.month:02d} "
                f"năm {today.year}"
            ),
        }

        # Kiểm tra dữ liệu trước khi tạo đơn.
        field_labels = {
            "full_name": "Họ và tên",
            "date_of_birth": "Ngày sinh",
            "class_name": "Lớp",
            "student_id": "Mã số sinh viên",
            "phone": "Số điện thoại",
            "email": "Email",
            "faculty_name": "Khoa hoặc ngành",
            "dropout_reason": "Lý do thôi học",
        }

        missing_fields = [
            label
            for field, label in field_labels.items()
            if not context.get(field)
        ]

        if missing_fields:
            raise ValidationError({
                "message": (
                    "Chưa đủ thông tin để tạo "
                    "đơn xin thôi học."
                ),
                "missing_fields": missing_fields,
            })

        try:
            output = generate_dropout_form(context)

        except FileNotFoundError as error:
            raise APIException(str(error))

        except ValueError as error:
            raise ValidationError({
                "message": str(error),
            })

        filename = (
            f"Don_xin_thoi_hoc_"
            f"{student.student_id}.docx"
        )

        return FileResponse(
            output,
            as_attachment=True,
            filename=filename,
            content_type=DOCX_CONTENT_TYPE,
        )



#BẢO LƯU

from services.retention_form_service import (generate_retention_form)
RETENTION_REASON_LABELS = {
    "Cá nhân": "Lý do cá nhân",
    "Sức khỏe/Khác": "Lý do sức khỏe / Khác",
}


class DownloadRetentionFormAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        reason_code = str(
            request.data.get("reason", "")
        ).strip()

        retention_duration = str(
            request.data.get("duration", "")
        ).strip()

        attachment_note = str(
            request.data.get("attachment_note", "")
        ).strip()

        if not reason_code:
            raise ValidationError({
                "reason": "Vui lòng chọn lý do xin nghỉ học."
            })

        if not retention_duration:
            raise ValidationError({
                "duration": "Vui lòng chọn thời gian bảo lưu."
            })

        # Hiển thị nội dung đẹp thay vì mã lựa chọn.
        retention_reason = RETENTION_REASON_LABELS.get(
            reason_code,
            reason_code,
        )

        # Trường này không bắt buộc trên giao diện.
        if not attachment_note:
            attachment_note = "Không có"

        student = get_object_or_404(
            Student.objects.select_related(
                "student_class__major",
                "user",
            ),
            user=request.user,
        )

        phone = str(student.phone or "Chưa cập nhật").strip()
        email = str(request.user.email or "").strip()

        class_name = str(
            student.student_class.class_id or ""
        ).strip()

        # Hiện model chưa có Faculty riêng,
        # nên dùng tên ngành.
        faculty_name = str(
            student.student_class.major.name or ""
        ).strip()

        today = timezone.localdate()

        context = {
            "full_name": student.full_name,
            "date_of_birth": format_date(
                student.date_of_birth
            ),
            "class_name": class_name,
            "student_id": student.student_id,
            "phone": phone,
            "email": email,
            "faculty_name": faculty_name,
            "retention_duration": retention_duration,
            "retention_reason": retention_reason,
            "attachment_note": attachment_note,
            "application_date": (
                f"ngày {today.day:02d} "
                f"tháng {today.month:02d} "
                f"năm {today.year}"
            ),
        }

        field_labels = {
            "full_name": "Họ và tên",
            "date_of_birth": "Ngày sinh",
            "class_name": "Lớp",
            "student_id": "Mã số sinh viên",
            "phone": "Số điện thoại",
            "email": "Email",
            "faculty_name": "Khoa hoặc ngành",
            "retention_duration": "Thời gian bảo lưu",
            "retention_reason": "Lý do bảo lưu",
        }

        missing_fields = [
            label
            for field, label in field_labels.items()
            if not context.get(field)
        ]

        if missing_fields:
            raise ValidationError({
                "message": (
                    "Chưa đủ thông tin để tạo "
                    "đơn xin nghỉ học tạm thời."
                ),
                "missing_fields": missing_fields,
            })

        try:
            output = generate_retention_form(context)

        except FileNotFoundError as error:
            raise APIException(str(error))

        except ValueError as error:
            raise ValidationError({
                "message": str(error),
            })

        filename = (
            f"Don_xin_nghi_hoc_tam_thoi_"
            f"{student.student_id}.docx"
        )

        return FileResponse(
            output,
            as_attachment=True,
            filename=filename,
            content_type=DOCX_CONTENT_TYPE,
        )


## XIN TRỞ LẠI HỌC TẬP
from services.resume_form_service import (
    generate_resume_form,
)

def normalize_date_string(value: str) -> str:
    """
    Chuyển ngày từ yyyy-mm-dd hoặc dd/mm/yyyy
    về định dạng dd/mm/yyyy.
    """

    value = str(value or "").strip()

    if not value:
        return ""

    for date_format in (
        "%Y-%m-%d",
        "%d/%m/%Y",
    ):
        try:
            return datetime.strptime(
                value[:10],
                date_format,
            ).strftime("%d/%m/%Y")
        except ValueError:
            continue

    return value


class DownloadResumeFormAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Nếu giao diện không có số quyết định,
        # hệ thống dùng mặc định 1284.
        decision_number = str(
            request.data.get("decision_number")
            or "1284"
        ).strip()

        reserved_date = normalize_date_string(
            request.data.get("reserved_date", "")
        )

        if not reserved_date:
            raise ValidationError({
                "reserved_date": (
                    "Không tìm thấy ngày ban hành "
                    "quyết định bảo lưu."
                )
            })

        student = get_object_or_404(
            Student.objects.select_related(
                "student_class__major",
                "user",
            ),
            user=request.user,
        )

        submitted_phone = str(
            request.data.get("phone", "")
        ).strip()

        phone = (
            submitted_phone
            or str(student.phone or "Chưa cập nhật").strip()
        )

        email = str(
            request.user.email or ""
        ).strip()

        faculty_name = str(
            student.student_class.major.name or ""
        ).strip()

        today = timezone.localdate()

        context = {
            "full_name": student.full_name,

            "date_of_birth": format_date(
                student.date_of_birth
            ),

            "class_name": (
                student.student_class.class_id
            ),

            "student_id": student.student_id,

            "phone": phone,

            "email": email,

            "faculty_name": faculty_name,

            "decision_number": decision_number,

            "reserved_date": reserved_date,

            "application_date": (
                f"ngày {today.day:02d} "
                f"tháng {today.month:02d} "
                f"năm {today.year}"
            ),
        }

        field_labels = {
            "full_name": "Họ và tên",
            "date_of_birth": "Ngày sinh",
            "class_name": "Lớp",
            "student_id": "Mã số sinh viên",
            "phone": "Số điện thoại",
            "email": "Email",
            "faculty_name": "Khoa hoặc ngành",
            "decision_number": "Số quyết định bảo lưu",
            "reserved_date": "Ngày quyết định bảo lưu",
        }

        missing_fields = [
            label
            for field, label in field_labels.items()
            if not context.get(field)
        ]

        if missing_fields:
            raise ValidationError({
                "message": (
                    "Chưa đủ thông tin để tạo "
                    "đơn xin trở lại học tập."
                ),
                "missing_fields": missing_fields,
            })

        try:
            output = generate_resume_form(context)

        except FileNotFoundError as error:
            raise APIException(str(error))

        except ValueError as error:
            raise ValidationError({
                "message": str(error),
            })

        filename = (
            f"Don_xin_tro_lai_hoc_tap_"
            f"{student.student_id}.docx"
        )

        return FileResponse(
            output,
            as_attachment=True,
            filename=filename,
            content_type=DOCX_CONTENT_TYPE,
        )


#CHUYỂN NGÀNH
from services.major_change_form_service import (
    generate_major_change_form,
)

DEFAULT_MAJOR_CHANGE_EVIDENCE = (
    "Giấy báo trúng tuyển; "
    "Giấy báo kết quả thi tốt nghiệp THPT; "
    "Bảng điểm; "
    "Giấy xác nhận sinh viên không thuộc diện xét thôi học; "
    "Giấy xác nhận không vi phạm kỷ luật; "
    "Điểm rèn luyện"
)


class DownloadMajorChangeFormAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_major = str(
            request.data.get("target_major", "")
        ).strip()

        enrollment_year = str(
            request.data.get("enrollment_year", "")
        ).strip()

        place_of_birth = str(
            request.data.get("place_of_birth", "")
        ).strip()

        id_number = str(
            request.data.get("id_number", "")
        ).strip()

        id_issue_date = normalize_date_string(
            request.data.get("id_issue_date", "")
        )

        id_issue_place = str(
            request.data.get("id_issue_place", "")
        ).strip()

        submitted_phone = str(
            request.data.get("phone", "")
        ).strip()

        admission_method = str(
            request.data.get(
                "admission_method",
                "Không xác định",
            )
        ).strip()

        admission_combo = str(
            request.data.get("admission_combo", "")
        ).strip() or "Không có"

        admission_score = str(
            request.data.get("admission_score", "")
        ).strip() or "Không có"

        priority_score = str(
            request.data.get("priority_score", "")
        ).strip() or "Không có"

        admission_threshold = str(
            request.data.get(
                "admission_threshold",
                "",
            )
        ).strip() or "Không có"

        transfer_reason = str(
            request.data.get("transfer_reason", "")
        ).strip()

        evidence_note = str(
            request.data.get("evidence_note", "")
        ).strip() or DEFAULT_MAJOR_CHANGE_EVIDENCE

        student = get_object_or_404(
            Student.objects.select_related(
                "student_class__major",
                "user",
            ),
            user=request.user,
        )

        current_major = str(
            student.student_class.major.name or ""
        ).strip()

        class_name = str(
            student.student_class.class_id or ""
        ).strip()

        phone = (
            submitted_phone
            or str(student.phone or "Chưa cập nhật").strip()
        )

        today = timezone.localdate()

        context = {
            # Lấy từ database
            "full_name": student.full_name,

            "date_of_birth": format_date(
                student.date_of_birth
            ),

            "class_name": class_name,

            "student_id": student.student_id,

            "current_major": current_major,

            "phone": phone,

            # Lấy từ OCR hoặc form sinh viên nhập
            "place_of_birth": place_of_birth,

            "enrollment_year": enrollment_year,

            "id_number": id_number,

            "id_issue_date": id_issue_date,

            "id_issue_place": id_issue_place,

            "target_major": target_major,

            "admission_method": admission_method,

            "admission_combo": admission_combo,

            "admission_score": admission_score,

            "priority_score": priority_score,

            "admission_threshold": (
                admission_threshold
            ),

            "transfer_reason": transfer_reason,

            "evidence_note": evidence_note,

            # Giá trị cố định
            "training_type": "Chính quy",

            "application_place": "Đà Nẵng",

            "application_date": (
                f"ngày {today.day:02d} "
                f"tháng {today.month:02d} "
                f"năm {today.year}"
            ),
        }

        field_labels = {
            "full_name": "Họ và tên",
            "date_of_birth": "Ngày sinh",
            "place_of_birth": "Nơi sinh",
            "class_name": "Lớp sinh viên",
            "student_id": "Mã số sinh viên",
            "current_major": "Ngành hiện tại",
            "enrollment_year": "Khóa tuyển sinh",
            "id_number": "Số CCCD",
            "id_issue_date": "Ngày cấp CCCD",
            "id_issue_place": "Nơi cấp CCCD",
            "phone": "Số điện thoại",
            "target_major": "Ngành muốn chuyển đến",
            "admission_method": "Phương thức xét tuyển",
            "transfer_reason": "Lý do chuyển ngành",
        }

        missing_fields = [
            label
            for field, label in field_labels.items()
            if not str(context.get(field, "")).strip()
        ]

        if missing_fields:
            raise ValidationError({
                "message": (
                    "Chưa đủ thông tin để tạo "
                    "đơn xin chuyển ngành."
                ),
                "missing_fields": missing_fields,
            })

        try:
            output = generate_major_change_form(
                context
            )

        except FileNotFoundError as error:
            raise APIException(str(error))

        except ValueError as error:
            raise ValidationError({
                "message": str(error),
            })

        except Exception as error:
            import traceback

            traceback.print_exc()

            raise APIException(
                f"Lỗi tạo đơn chuyển ngành: {error}"
            )

        filename = (
            f"Don_xin_chuyen_nganh_"
            f"{student.student_id}.docx"
        )

        return FileResponse(
            output,
            as_attachment=True,
            filename=filename,
            content_type=DOCX_CONTENT_TYPE,
        )


def build_major_change_context(request, student):
    data = request.data

    student_class = student.student_class
    current_major = student_class.major if student_class else None

    return {
        "full_name": student.full_name,
        "date_of_birth": format_date(student.date_of_birth),
        "place_of_birth": data.get("place_of_birth", ""),

        "class_name": student_class.name if student_class else "",
        "student_id": student.student_id,
        "current_major": current_major.name if current_major else "",

        "enrollment_year": data.get("enrollment_year", ""),
        "training_type": data.get("training_type", "Chính quy"),

        "id_number": data.get("id_number", ""),
        "id_issue_date": data.get("id_issue_date", ""),
        "id_issue_place": data.get("id_issue_place", ""),
        "phone": data.get("phone") or student.phone,

        "target_major": data.get("target_major", ""),
        "admission_method": data.get("admission_method", ""),
        "admission_combo": data.get("admission_combo") or "Không có",
        "admission_score": data.get("admission_score") or "Không có",
        "priority_score": data.get("priority_score") or "Không có",
        "admission_threshold": (
            data.get("admission_threshold") or "Không có"
        ),

        "transfer_reason": data.get("transfer_reason", ""),
        "evidence_note": data.get("evidence_note", ""),

        "application_place": data.get(
            "application_place",
            "Đà Nẵng",
        ),
        "application_date": format_date(timezone.localdate()),
    }


class PreviewMajorChangeFormAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = get_object_or_404(
            Student.objects.select_related(
                "student_class",
                "student_class__major",
            ),
            user=request.user,
        )

        try:
            context = build_major_change_context(request, student)

            # Tạo Word từ đúng template chính thức
            docx_buffer = generate_major_change_form(context)

            # Chuyển Word sang PDF
            pdf_buffer = convert_docx_to_pdf(docx_buffer)

            response = FileResponse(
                pdf_buffer,
                as_attachment=False,
                filename="Don_xin_chuyen_nganh_preview.pdf",
                content_type="application/pdf",
            )

            response["Content-Disposition"] = (
                'inline; filename="Don_xin_chuyen_nganh_preview.pdf"'
            )

            return response

        except Exception as error:
            raise APIException(
                f"Không thể tạo bản xem trước đơn: {error}"
            )