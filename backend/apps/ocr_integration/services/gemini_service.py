from io import BytesIO

from django.conf import settings
from google import genai
from google.genai import types
from PIL import Image

from ..exceptions import TextExtractionError
from .document_rules import get_document_rule
from .schemas import DocumentAnalysisResult


def convert_image_to_part(
    image: Image.Image,
) -> types.Part:
    """
    Chuyển ảnh PIL thành dữ liệu JPEG
    để gửi trực tiếp cho Gemini.
    """

    buffer = BytesIO()

    image.convert("RGB").save(
        buffer,
        format="JPEG",
        quality=85,
        optimize=True,
    )

    return types.Part.from_bytes(
        data=buffer.getvalue(),
        mime_type="image/jpeg",
    )


def build_analysis_prompt(
    document_type: str,
    ocr_text: str,
) -> str:
    rule = get_document_rule(document_type)

    accepted_keywords = ", ".join(
        rule["accepted_keywords"]
    )

    extract_fields = ", ".join(
        rule["extract_fields"]
    )

    identity_required = (
        "full_name" in rule["extract_fields"]
        and "student_id" in rule["extract_fields"]
    )

    if identity_required:
        identity_instruction = """
YÊU CẦU NHẬN DẠNG DANH TÍNH SINH VIÊN:

- Bắt buộc tìm và trích xuất full_name và student_id.
- full_name phải lấy từ khu vực thông tin sinh viên,
  ví dụ: "Họ và tên", "Họ tên", "Tôi tên là",
  "Sinh viên", hoặc nội dung tương đương.
- Không lấy tên phụ huynh, người giám hộ,
  cán bộ, giảng viên hoặc tên tại phần xác nhận
  làm full_name.
- Không lấy tên chỉ xuất hiện trong vùng chữ ký
  làm full_name nếu không có căn cứ đó là họ tên
  của sinh viên trong phần thông tin hồ sơ.
- student_id phải lấy đúng từ trường:
  "MSSV", "Mã số sinh viên", "Mã sinh viên",
  "Student ID", hoặc nội dung tương đương.
- Không lấy CCCD, số điện thoại, ngày sinh,
  mã hồ sơ, số quyết định hoặc số văn bản
  làm student_id.
- Giữ nguyên nội dung đọc được từ tài liệu.
- Nếu không đọc rõ họ tên thì trả full_name = null.
- Nếu không đọc rõ MSSV thì trả student_id = null.
- Không suy đoán, không tự điền và không sửa
  họ tên hoặc MSSV theo kiến thức bên ngoài.
- Nếu tài liệu có nhiều người, chỉ lấy thông tin
  của sinh viên/người làm đơn.
""".strip()
    else:
        identity_instruction = """
Tài liệu này không bắt buộc đối chiếu đồng thời
họ tên và MSSV sinh viên. Chỉ trích xuất các trường
được yêu cầu nếu thật sự nhìn thấy.
""".strip()

    require_signature = rule.get(
        "require_signature",
        False,
    )

    if not require_signature:
        signature_instruction = """
Tài liệu này không bắt buộc có chữ ký.

Yêu cầu:
- Đặt signature.required = false.
- Đặt signature.present = false nếu không có chữ ký.
- Các vùng trong signature_checks có thể để present = false.
""".strip()

    elif document_type == (
        "DROPOUT_SIGNED_APPLICATION"
    ):
        signature_instruction = """
Tài liệu phải là Đơn xin thôi học.

Không được nhầm với:
- Đơn xin nghỉ học tạm thời.
- Đơn xin trở lại học tập.
- Đơn xin chuyển ngành.
- Giấy xác nhận hoặc bảng điểm.

CHỈ KIỂM TRA HAI VÙNG CHỮ KÝ:

1. parent_guardian:
- Phụ huynh.
- Người giám hộ.
- Ý kiến phụ huynh.
- Xác nhận của gia đình.
- Hoặc nội dung tương đương.

2. applicant:
- Người làm đơn.
- Sinh viên.
- Người viết đơn.
- Người xin thôi học.
- Hoặc nội dung tương đương.

QUY TẮC:

- present = true chỉ khi nhìn thấy nét ký viết tay
  hoặc chữ ký số trong đúng vùng tương ứng.
- Tên gõ bằng máy không phải chữ ký.
- Dòng "(Ký và ghi rõ họ tên)" không phải chữ ký.
- Dòng "(Ký tên)" không phải chữ ký.
- Vùng ký trống phải trả present = false.
- Không dùng chữ ký vùng này để xác nhận vùng khác.
- Không khẳng định chữ ký là thật hoặc đúng người.

KHÔNG KIỂM TRA CHỮ KÝ LÃNH ĐẠO KHOA.

Luôn trả:

faculty_leader.present = false

Chỉ yêu cầu:
- parent_guardian.present = true
- applicant.present = true
""".strip()

    elif document_type == (
        "RESUME_SIGNED_APPLICATION"
    ):
        signature_instruction = """
    Tài liệu này phải là Đơn xin trở lại học tập
    hoặc Đơn xin học tiếp.

    CHỈ KIỂM TRA HAI VÙNG CHỮ KÝ:

1. parent_guardian:
- Phụ huynh.
- Người giám hộ.
- Ý kiến phụ huynh.
- Xác nhận của gia đình.
- Hoặc nội dung tương đương.

2. applicant:
- Người làm đơn.
- Sinh viên.
- Người viết đơn.
- Người xin trở lại học tập.
- Hoặc nội dung tương đương.

QUY TẮC:

- present = true chỉ khi nhìn thấy nét ký viết tay
  hoặc chữ ký số trong đúng vùng tương ứng.
- Tên được gõ bằng máy không phải chữ ký.
- Dòng "(Ký và ghi rõ họ tên)" không phải chữ ký.
- Vùng ký trống phải trả present = false.
- Không dùng chữ ký của vùng này để xác nhận vùng khác.
- Không khẳng định chữ ký là thật hoặc đúng người.

KHÔNG KIỂM TRA CHỮ KÝ LÃNH ĐẠO KHOA.

Luôn trả:
faculty_leader.present = false

Chỉ yêu cầu:
parent_guardian.present = true
applicant.present = true
""".strip()

    elif document_type == (
        "MAJOR_CHANGE_SIGNED_APPLICATION"
    ):
       signature_instruction = """
        Tài liệu cần kiểm tra là Đơn xin chuyển ngành.

        QUY TẮC NHẬN DIỆN TÀI LIỆU:

        - File tải lên có thể gồm nhiều trang và nhiều biểu mẫu.
        - Phải kiểm tra tất cả các trang trong file.
        - Không được chỉ dựa vào trang đầu tiên để phân loại tài liệu.

        Nếu trong bất kỳ trang nào có các dấu hiệu:

        - Tiêu đề "ĐƠN XIN CHUYỂN NGÀNH";
        - Hoặc "ĐƠN XIN CHUYỂN NGÀNH ĐÀO TẠO";
        - Có nội dung xin chuyển từ ngành đang học
        sang một ngành đào tạo khác;
        - Có khu vực "Người làm đơn";

        thì xác định:

        detected_document_type =
        "MAJOR_CHANGE_SIGNED_APPLICATION"

        và:

        is_match = true.

        PDF vẫn được xem là đúng tài liệu nếu ngoài trang đơn
        còn có các trang như:

        - Danh mục hồ sơ chuyển ngành;
        - Phiếu xác nhận điều kiện chuyển ngành;
        - Ý kiến khoa chuyển đi;
        - Ý kiến khoa chuyển đến;
        - Ý kiến thủ trưởng cơ sở đào tạo;
        - Các tài liệu minh chứng khác.

        Không được kết luận sai tài liệu chỉ vì PDF có nhiều trang.

        Không được nhầm với:

        - Đơn xin thôi học;
        - Đơn xin nghỉ học tạm thời;
        - Đơn xin trở lại học tập;
        - Giấy báo trúng tuyển;
        - Giấy chứng nhận tốt nghiệp THPT.

        CHỈ KIỂM TRA MỘT VÙNG CHỮ KÝ:

        applicant:

        - Người làm đơn;
        - Sinh viên ký tên;
        - Người viết đơn;
        - Hoặc vùng có nội dung tương đương.

        QUY TẮC KIỂM TRA CHỮ KÝ:

        - Phải tìm vùng "Người làm đơn" trên trang chứa
        Đơn xin chuyển ngành.
        - applicant.present = true khi nhìn thấy nét ký viết tay
        hoặc chữ ký số tại vùng "Người làm đơn"
        hoặc ngay sát vùng này.
        - Chữ ký có thể nằm phía trên hoặc phía dưới
        tên sinh viên được in sẵn.
        - Tên sinh viên được gõ bằng máy không phải chữ ký.
        - Dòng "(Ký và ghi rõ họ tên)" không phải chữ ký.
        - Nếu chỉ có tên in sẵn nhưng không có nét ký,
        applicant.present = false.
        - Nếu có nét ký viết tay tại vùng Người làm đơn,
        applicant.present = true.

        KHÔNG BẮT BUỘC:

        - Chữ ký phụ huynh;
        - Chữ ký người giám hộ;
        - Chữ ký lãnh đạo khoa;
        - Chữ ký thủ trưởng cơ sở đào tạo.

        Luôn trả:

        parent_guardian.present = false

        faculty_leader.present = false

        Không dùng việc các vùng ý kiến khoa đang trống
        để kết luận hồ sơ không hợp lệ.

        Không khẳng định chữ ký là thật hoặc đúng người.
        Chỉ xác nhận có hay không có dấu hiệu chữ ký.
        """.strip()

    else:
        signature_instruction = """
Tài liệu phải là Đơn xin nghỉ học tạm thời
hoặc Đơn xin bảo lưu kết quả học tập.

CHỈ KIỂM TRA HAI VÙNG CHỮ KÝ:

1. parent_guardian:
- Phụ huynh.
- Người giám hộ.
- Ý kiến phụ huynh.
- Xác nhận của gia đình.
- Hoặc nội dung tương đương.

2. applicant:
- Người làm đơn.
- Sinh viên.
- Người viết đơn.
- Người xin nghỉ học tạm thời.
- Hoặc nội dung tương đương.

QUY TẮC:

- present = true chỉ khi nhìn thấy nét ký viết tay
  hoặc chữ ký số trong đúng vùng tương ứng.
- Tên được gõ bằng máy không phải chữ ký.
- Dòng "(Ký và ghi rõ họ tên)" không phải chữ ký.
- Vùng ký trống phải trả present = false.
- Không lấy chữ ký vùng này để xác nhận vùng khác.
- Không khẳng định chữ ký là thật hoặc đúng người.

KHÔNG KIỂM TRA CHỮ KÝ LÃNH ĐẠO KHOA.

Luôn trả:
faculty_leader.present = false

Chỉ yêu cầu:
parent_guardian.present = true
applicant.present = true
""".strip()

    limited_ocr_text = ocr_text[:12000]

    return f"""
Bạn là hệ thống kiểm tra sơ bộ hồ sơ hành chính sinh viên.

LOẠI TÀI LIỆU ĐƯỢC YÊU CẦU:

- Mã: {document_type}
- Tên: {rule["expected_name"]}
- Mô tả: {rule["description"]}

CỤM TỪ CÓ THỂ XUẤT HIỆN:

{accepted_keywords}

CÁC LOẠI TÀI LIỆU CÓ THỂ NHẬN BIẾT:

- MAJOR_CHANGE_ADMISSION_LETTER:
  Giấy báo hoặc thông báo trúng tuyển.

- MAJOR_CHANGE_GRADUATION_CERTIFICATE:
  Giấy chứng nhận hoặc bằng tốt nghiệp THPT.

- RETENTION_SIGNED_APPLICATION:
  Đơn xin bảo lưu hoặc nghỉ học tạm thời.

- DROPOUT_SIGNED_APPLICATION:
  Đơn xin thôi học.

- RESUME_SIGNED_APPLICATION:
  Đơn xin học tiếp hoặc trở lại học tập.

- UNKNOWN:
  Không xác định được loại tài liệu.

QUY TẮC PHÂN LOẠI NGHIÊM NGẶT:

- Trước tiên phải xác định loại tài liệu thực tế.
- Không được mặc định tài liệu đúng chỉ vì hệ thống
  yêu cầu một loại tài liệu cụ thể.
- Ảnh chụp màn hình, bảng mô tả chức năng,
  tài liệu hướng dẫn hoặc nội dung chỉ nhắc đến tên đơn
  phải được phân loại là UNKNOWN.
- Việc xuất hiện cụm từ "đơn xin thôi học" không đủ
  để kết luận đây là Đơn xin thôi học.
- Đơn xin thôi học phải có cấu trúc của đơn hành chính
  và nội dung thể hiện sinh viên đề nghị được thôi học.
- is_match chỉ được true khi detected_document_type
  trùng chính xác expected_document_type.
- Không đủ bằng chứng thì detected_document_type = UNKNOWN
  và is_match = false.

NHIỆM VỤ:

1. Xem toàn bộ các trang được cung cấp.
2. Xác định loại tài liệu thực tế.
3. So sánh với loại tài liệu được yêu cầu.
4. is_match chỉ được true khi đúng loại tài liệu.
5. Trích xuất các trường sau nếu thật sự nhìn thấy:
   {extract_fields}
6. Không nhìn thấy thì trả null, tuyệt đối không đoán.
7. Ngày tháng chuẩn hóa thành DD/MM/YYYY nếu có thể.
8. Giữ nguyên nội dung tiếng Việt.
9. Ghi lý do ngắn gọn trong validation_reason.

{identity_instruction}

YÊU CẦU VỀ CHỮ KÝ:

{signature_instruction}

VĂN BẢN TESSERACT ĐỌC SƠ BỘ:

----------------------------
{limited_ocr_text}
----------------------------

Ưu tiên hình ảnh tài liệu khi văn bản OCR bị sai.

Trả kết quả đúng theo schema đã cấu hình.
""".strip()


def analyze_document_with_gemini(
    images: list[Image.Image],
    document_type: str,
    ocr_text: str = "",
) -> DocumentAnalysisResult:
    """
    Dùng Gemini kiểm tra đúng loại tài liệu,
    chữ ký và trích xuất thông tin.
    """

    if not settings.GEMINI_API_KEY:
        raise TextExtractionError(
            "Chưa cấu hình GEMINI_API_KEY."
        )

    if not images:
        raise TextExtractionError(
            "Không có trang tài liệu để gửi Gemini."
        )

    try:
        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        prompt = build_analysis_prompt(
            document_type=document_type,
            ocr_text=ocr_text,
        )

        contents = [
            types.Part.from_text(text=prompt)
        ]

        # Giới hạn số trang để tránh gửi nhầm
        # tài liệu quá dài và tốn token.
        for image in images[:10]:
            contents.append(
                convert_image_to_part(image)
            )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type=(
                    "application/json"
                ),
                response_schema=(
                    DocumentAnalysisResult
                ),
                temperature=0.1,
            ),
        )

        if response.parsed is not None:
            if isinstance(
                response.parsed,
                DocumentAnalysisResult,
            ):
                return response.parsed

            return (
                DocumentAnalysisResult
                .model_validate(response.parsed)
            )

        if not response.text:
            raise TextExtractionError(
                "Gemini không trả về kết quả."
            )

        return (
            DocumentAnalysisResult
            .model_validate_json(response.text)
        )

    except TextExtractionError:
        raise

    except Exception as error:
        raise TextExtractionError(
            f"Gemini xử lý tài liệu thất bại: "
            f"{error}"
        ) from error