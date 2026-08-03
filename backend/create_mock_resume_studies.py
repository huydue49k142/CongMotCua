import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.students.models import Student
from apps.requests.models import Request, ResumeStudiesRequest, RequestHistory, RequestDocument
from apps.users.models import User
from django.utils import timezone
from datetime import timedelta

def create_mock_data():
    student_code = '231121514213'
    try:
        student = Student.objects.get(student_id=student_code)
    except Student.DoesNotExist:
        print(f"Không tìm thấy sinh viên có mã {student_code}")
        return

    staff = User.objects.filter(role=User.Role.STAFF).first()

    statuses_to_create = [
        (Request.Status.PENDING, "Chờ xử lý", None),
        (Request.Status.REJECTED, "Từ chối", "Không đủ điều kiện học tiếp theo quy chế đào tạo điều 15 khoản 2."),
        (Request.Status.APPROVED, "Đã duyệt", "Quyết định số 123/QĐ-ĐH cho phép học tiếp."),
        (Request.Status.DELETED, "Đã xóa", None),
    ]

    for idx, (status, label, note) in enumerate(statuses_to_create):
        # Create Request
        req = Request.objects.create(
            student=student,
            request_type=Request.RequestType.RESUME_STUDIES,
            status=status,
            submitted_at=timezone.now() - timedelta(days=idx+1)
        )

        # Create ResumeStudiesRequest detail
        ResumeStudiesRequest.objects.create(
            request=req,
            courses=[
                {"code": "CS101", "name": "Nhập môn Lập trình"},
                {"code": "MA101", "name": "Giải tích 1"}
            ]
        )

        # Add some initial documents
        RequestDocument.objects.create(
            request=req,
            file="request_documents/dummy_don_xin_hoc_tiep.pdf",
            file_name=f"don_xin_hoc_tiep_{status.lower()}.pdf",
            document_type=RequestDocument.DocumentType.INITIAL
        )

        # Add history if applicable
        if note:
            RequestHistory.objects.create(
                request=req,
                status=status,
                actor=staff,
                notes=note,
            )

        print(f"Đã tạo hồ sơ {label} cho SV {student_code}")

if __name__ == "__main__":
    create_mock_data()
