from typing import Literal

from pydantic import BaseModel, Field


DocumentType = Literal[
    "MAJOR_CHANGE_ADMISSION_LETTER",
    "MAJOR_CHANGE_GRADUATION_CERTIFICATE",
    "MAJOR_CHANGE_SIGNED_APPLICATION",
    "RETENTION_SIGNED_APPLICATION",
    "DROPOUT_SIGNED_APPLICATION",
    "RESUME_SIGNED_APPLICATION",
    "UNKNOWN",
]


SignatureType = Literal[
    "HANDWRITTEN",
    "TYPED_NAME",
    "DIGITAL",
    "NOT_FOUND",
    "UNCERTAIN",
]


class ExtractedFields(BaseModel):
    full_name: str | None = None
    student_id: str | None = None

    date_of_birth: str | None = None
    place_of_birth: str | None = None
    id_number: str | None = None

    admission_year: str | None = None
    admission_major: str | None = None
    admission_method: str | None = None
    admission_combo: str | None = None
    admission_score: str | None = None

    graduation_year: str | None = None

    retention_reason: str | None = None
    retention_period: str | None = None

    dropout_reason: str | None = None

    resume_semester: str | None = None
    resume_academic_year: str | None = None


class SignatureResult(BaseModel):
    required: bool = False
    present: bool = False

    type: SignatureType = "NOT_FOUND"

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
    )

    page: int | None = None
    evidence: str = ""


class SignatureZoneResult(BaseModel):
    present: bool = False

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
    )

    signature_type: SignatureType = "NOT_FOUND"

    page: int | None = None
    evidence: str = ""


class SignatureChecks(BaseModel):
    parent_guardian: SignatureZoneResult = Field(
        default_factory=SignatureZoneResult
    )

    applicant: SignatureZoneResult = Field(
        default_factory=SignatureZoneResult
    )

    faculty_leader: SignatureZoneResult = Field(
        default_factory=SignatureZoneResult
    )


class DocumentAnalysisResult(BaseModel):
    expected_document_type: DocumentType

    detected_document_type: DocumentType = (
        "UNKNOWN"
    )

    is_match: bool = False

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
    )

    extracted_title: str = ""
    validation_reason: str = ""

    extracted_fields: ExtractedFields = Field(
        default_factory=ExtractedFields
    )

    missing_fields: list[str] = Field(
        default_factory=list
    )

    # Kết quả chữ ký chung, giữ để tương thích
    # với code cũ.
    signature: SignatureResult = Field(
        default_factory=SignatureResult
    )

    # Ba vùng chữ ký riêng của đơn thôi học.
    signature_checks: SignatureChecks = Field(
        default_factory=SignatureChecks
    )