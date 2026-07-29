from typing import Any


DOCUMENT_RULES: dict[str, dict[str, Any]] = {
    # =========================================================
    # CHUYỂN NGÀNH - GIẤY BÁO TRÚNG TUYỂN
    # =========================================================
    "MAJOR_CHANGE_ADMISSION_LETTER": {
        "procedure_type": "MAJOR_CHANGE",

        "expected_name": (
            "Giấy báo trúng tuyển"
        ),

        "description": (
            "Giấy báo, thông báo hoặc quyết định "
            "xác nhận sinh viên đã trúng tuyển "
            "vào một ngành đào tạo."
        ),

        "accepted_keywords": [
            "giấy báo trúng tuyển",
            "thông báo trúng tuyển",
            "quyết định trúng tuyển",
            "kết quả trúng tuyển",
            "xác nhận nhập học",
            "ngành trúng tuyển",
        ],

        "require_signature": False,

        "extract_fields": [
            "full_name",
            "admission_year",
            "admission_major",
            "admission_method",
            "admission_combo",
            "admission_score",
        ],
    },

    # =========================================================
    # CHUYỂN NGÀNH - GIẤY CHỨNG NHẬN TỐT NGHIỆP THPT
    # =========================================================
    "MAJOR_CHANGE_GRADUATION_CERTIFICATE": {
        "procedure_type": "MAJOR_CHANGE",

        "expected_name": (
            "Giấy chứng nhận tốt nghiệp THPT"
        ),

        "description": (
            "Giấy chứng nhận tốt nghiệp hoặc "
            "bằng tốt nghiệp trung học phổ thông."
        ),

        "accepted_keywords": [
            "giấy chứng nhận tốt nghiệp",
            "giấy chứng nhận tốt nghiệp thpt",
            "tốt nghiệp trung học phổ thông",
            "bằng tốt nghiệp trung học phổ thông",
            "bằng tốt nghiệp",
        ],

        "require_signature": False,

        "extract_fields": [
            "full_name",
            "date_of_birth",
            "place_of_birth",
            "graduation_year",
        ],
    },

    # =========================================================
    # CHUYỂN NGÀNH - ĐƠN ĐÃ KÝ
    # =========================================================
    "MAJOR_CHANGE_SIGNED_APPLICATION": {
        "procedure_type": "MAJOR_CHANGE",

        "expected_name": (
            "Đơn xin chuyển ngành"
        ),

        "description": (
            "Đơn đề nghị chuyển từ ngành đang học "
            "sang một ngành đào tạo khác."
        ),

        "accepted_keywords": [
            "đơn xin chuyển ngành",
            "xin chuyển ngành",
            "ngành đang học",
            "ngành xin chuyển đến",
            "lý do xin chuyển ngành",
        ],

        "require_signature": True,

        # Chỉ kiểm tra chữ ký sinh viên.
        "required_signature_zones": [
            "applicant",
        ],

        "extract_fields": [
            "full_name",
            "student_id",
            "current_major",
            "target_major",
            "transfer_reason",
        ],
    },

    # =========================================================
    # BẢO LƯU
    # =========================================================
    "RETENTION_SIGNED_APPLICATION": {
        "procedure_type": "RETENTION",

        "expected_name": (
            "Đơn xin nghỉ học tạm thời"
        ),

        "description": (
            "Đơn xin nghỉ học tạm thời hoặc "
            "bảo lưu kết quả học tập."
        ),

        "accepted_keywords": [
            "đơn xin nghỉ học tạm thời",
            "đơn xin bảo lưu",
            "xin nghỉ học tạm thời",
            "bảo lưu kết quả học tập",
        ],

        "require_signature": True,

        "required_signature_zones": [
            "parent_guardian",
            "applicant",
        ],

        "extract_fields": [
            "full_name",
            "student_id",
            "retention_reason",
            "retention_period",
        ],
    },

    # =========================================================
    # THÔI HỌC
    # =========================================================
    "DROPOUT_SIGNED_APPLICATION": {
    "procedure_type": "DROPOUT",

    "expected_name": "Đơn xin thôi học",

    "description": (
        "Đơn đề nghị thôi học hoặc chấm dứt "
        "việc học tại trường."
    ),

    "accepted_keywords": [
        "đơn xin thôi học",
        "xin được thôi học",
        "chấm dứt việc học",
        "lý do xin thôi học",
    ],

    "require_signature": True,

    # Chỉ bắt buộc 2 chữ ký.
    "required_signature_zones": [
        "parent_guardian",
        "applicant",
    ],

    "extract_fields": [
        "full_name",
        "student_id",
        "dropout_reason",
    ],
},

    # =========================================================
    # HỌC TIẾP
    # =========================================================
    "RESUME_SIGNED_APPLICATION": {
    "procedure_type": "RESUME",

    "expected_name": (
        "Đơn xin trở lại học tập"
    ),

    "description": (
        "Đơn đề nghị trở lại hoặc tiếp tục "
        "học tập sau thời gian nghỉ học tạm thời."
    ),

    "accepted_keywords": [
        "đơn xin trở lại học tập",
        "đơn xin học tiếp",
        "xin tiếp tục học tập",
        "trở lại học tập",
    ],

    "require_signature": True,

    "required_signature_zones": [
        "parent_guardian",
        "applicant",
    ],

    "extract_fields": [
        "full_name",
        "student_id",
        "resume_semester",
        "resume_academic_year",
    ],
},
}


def get_document_rule(
    document_type: str,
) -> dict[str, Any]:
    normalized_document_type = (
        document_type.strip()
    )

    rule = DOCUMENT_RULES.get(
        normalized_document_type
    )

    if rule is None:
        raise ValueError(
            "Loại tài liệu không được hỗ trợ: "
            f"{normalized_document_type}. "
            "Các loại hiện có: "
            f"{list(DOCUMENT_RULES.keys())}"
        )

    return rule