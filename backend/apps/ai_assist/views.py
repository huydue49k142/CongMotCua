from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.utils import timezone
import uuid

from apps.students.models import Student
from apps.requests.models import Request as StudentRequest, DropoutRequest, RequestHistory

SESSIONS = {}
WELCOME_MESSAGE = "Chào mừng! Hệ thống hỗ trợ nộp đơn thôi học (demo tích hợp)."


def _serialize_student(student):
    return {
        "studentId": student.student_id,
        "fullName": student.full_name,
        "dob": student.date_of_birth.strftime('%d/%m/%Y') if student.date_of_birth else None,
        "className": student.student_class.name if student.student_class else None,
        "email": getattr(student.user, 'email', None),
        "phone": None,
    }


def _get_authenticated_student(request):
    if request.user.is_authenticated:
        return getattr(request.user, 'student_profile', None)
    return None


def _get_session(session_id):
    return SESSIONS.get(session_id)


def _create_dropout_request(student, reason):
    existing = StudentRequest.objects.filter(student=student).exclude(
        status__in=[
            StudentRequest.Status.APPROVED,
            StudentRequest.Status.REJECTED,
            StudentRequest.Status.CANCELLED,
        ]
    ).first()
    if existing:
        return None, 'Bạn đang có một yêu cầu đang xử lý. Vui lòng hoàn tất hoặc hủy yêu cầu đó trước khi gửi mới.'

    req = StudentRequest.objects.create(
        student=student,
        request_type=StudentRequest.RequestType.DROPOUT,
        status=StudentRequest.Status.DRAFT,
    )
    DropoutRequest.objects.create(request=req, reason=reason or '')
    return req, None


def _resolve_request(session):
    if session.get('type') == 'db' and session.get('db_request_id'):
        try:
            return StudentRequest.objects.get(id=session['db_request_id'])
        except StudentRequest.DoesNotExist:
            return None
    return None


class StartProcedure(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('sessionId') or str(uuid.uuid4())
        student = _get_authenticated_student(request)
        if student:
            profile = _serialize_student(student)
            session_data = {
                'state': 'WELCOME',
                'created_at': timezone.now(),
                'studentProfile': profile,
                'data': {},
                'type': 'db',
                'db_request_id': None,
            }
        else:
            student_id = request.data.get('studentId')
            profile = _get_student_profile(student_id)
            session_data = {
                'state': 'WELCOME',
                'created_at': timezone.now(),
                'studentProfile': profile,
                'data': {},
                'type': 'demo',
            }
        SESSIONS[session_id] = session_data
        return Response({
            'state': 'WELCOME',
            'message': WELCOME_MESSAGE,
            'studentProfile': profile,
        })


class ConfirmStart(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)
        s['state'] = 'FORM'
        return Response({'state': 'FORM', 'studentProfile': s['studentProfile']})


class SubmitForm(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason')
        expected = request.data.get('expectedLeaveDate')
        note = request.data.get('note')
        errors = []
        if not reason:
            errors.append('Vui lòng nhập lý do thôi học.')
        if not expected:
            errors.append('Vui lòng nhập ngày dự kiến thôi học.')
        if errors:
            return Response({'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        s['data']['form'] = {'reason': reason, 'expectedLeaveDate': expected, 'note': note}
        s['state'] = 'TERMS'

        if s.get('type') == 'db' and s.get('db_request_id') is None:
            student = _get_authenticated_student(request)
            if student:
                req, err = _create_dropout_request(student, reason)
                if err:
                    return Response({'errors': [err]}, status=status.HTTP_409_CONFLICT)
                s['db_request_id'] = str(req.id)

        terms = [
            "Bạn đồng ý chịu trách nhiệm về quá trình thôi học và tuân thủ quy định của nhà trường.",
            "Sau khi thôi học, bạn sẽ mất quyền lợi học bổng, bảo lưu, và các quyền lợi liên quan.",
        ]
        return Response({'state': 'TERMS', 'terms': terms, 'relatedRegulations': []})


class ConfirmTerms(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)
        s['data']['termsAccepted'] = bool(request.data.get('termsAccepted'))
        s['state'] = 'DOWNLOAD_GUIDE'
        steps = ['Tải đơn', 'Ký', 'Nhận chữ ký đóng dấu', 'Quét ảnh/tệp']
        download_url = f"/api/thoi-hoc/download-docx?sessionId={session_id}"
        return Response({'state': 'DOWNLOAD_GUIDE', 'steps': steps, 'downloadUrl': download_url})


class DownloadDocx(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = request.query_params.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)

        db_request = _resolve_request(s)
        if db_request:
            dropout = getattr(db_request, 'dropout_request', None)
            reason = dropout.reason if dropout else ''
            student = db_request.student
            content = (
                f"ĐƠN XIN THÔI HỌC\nHọ tên: {student.full_name}\nMSSV: {student.student_id}\nLớp: {student.student_class.name if student.student_class else ''}\nLý do: {reason}\n"
            )
        else:
            content = f"ĐƠN XIN THÔI HỌC\nHọ tên: {s['studentProfile']['fullName']}\nMSSV: {s['studentProfile']['studentId']}\nLý do: {s['data'].get('form', {}).get('reason')}\n"

        resp = HttpResponse(content, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        resp['Content-Disposition'] = 'attachment; filename=Don_xin_thoi_hoc.docx'
        return resp


class ConfirmDownload(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)
        s['state'] = 'UPLOAD_VERIFY'
        return Response({'state': 'UPLOAD_VERIFY'})


class UploadVerify(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        session_id = request.data.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)
        if 'file' not in request.FILES:
            return Response({'error': 'Vui lòng gửi file.'}, status=status.HTTP_400_BAD_REQUEST)
        uploaded = request.FILES['file']
        signature_check = {'signaturesFound': 3, 'ok': True}
        s['data']['signatureCheck'] = signature_check
        s['data']['uploadedFileName'] = uploaded.name
        s['state'] = 'REVIEW_SUBMIT'
        return Response({'state': 'REVIEW_SUBMIT', 'signatureCheck': signature_check})


class Review(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = request.query_params.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)

        db_request = _resolve_request(s)
        if db_request:
            dropout = getattr(db_request, 'dropout_request', None)
            review_data = {
                'studentProfile': _serialize_student(db_request.student),
                'form': {
                    'reason': dropout.reason if dropout else '',
                    'expectedLeaveDate': s['data'].get('form', {}).get('expectedLeaveDate'),
                    'note': s['data'].get('form', {}).get('note'),
                },
                'uploadedFileName': s['data'].get('uploadedFileName'),
                'signatureCheck': s['data'].get('signatureCheck'),
            }
        else:
            review_data = {
                'studentProfile': s['studentProfile'],
                'form': s['data'].get('form'),
                'uploadedFileName': s['data'].get('uploadedFileName'),
                'signatureCheck': s['data'].get('signatureCheck'),
            }
        return Response(review_data)


class SubmitApplication(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('sessionId')
        s = _get_session(session_id)
        if not s:
            return Response({'error': 'Không tìm thấy phiên.'}, status=status.HTTP_404_NOT_FOUND)

        db_request = _resolve_request(s)
        if db_request:
            db_request.status = StudentRequest.Status.PENDING_REVIEW
            db_request.submitted_at = timezone.now()
            db_request.save()
            RequestHistory.objects.create(
                request=db_request,
                status=db_request.status,
                actor=request.user if request.user.is_authenticated else None,
                notes='Nộp hồ sơ thôi học từ giao diện AI assist.',
            )
            tracking_code = str(db_request.id)
        else:
            tracking_code = f"TH-{uuid.uuid4().hex[:8].upper()}"

        s['state'] = 'TRACKING'
        s['trackingCode'] = tracking_code
        s['stages'] = ['Received', 'Processing', 'Completed']
        s['currentStageIndex'] = 0
        return Response({'trackingCode': tracking_code, 'stages': s['stages'], 'currentStageIndex': 0})
