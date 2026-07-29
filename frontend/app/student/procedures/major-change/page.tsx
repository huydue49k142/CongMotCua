"use client";

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import {
  ArrowLeftRight,
  Bot,
  CheckCircle2,
  Upload,
  Check,
  ChevronRight,
  FileText,
  X,
  Download,
  Clock,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMajorChangeProfile, MajorChangeProfile } from '@/services/major-change.service';
import axios from 'axios';

type SignatureCheck = {
  present: boolean;
  confidence?: number;
  evidence?: string;
};

type OCRVerifyResult = {
  format_valid?: boolean;
  is_match?: boolean;
  accepted?: boolean;

  detected_document_type?: string;
  validation_reason?: string;
  error_message?: string;

  extracted_fields?: Record<
    string,
    string | number | null
  >;

  signature_checks?: {
    parent_guardian?: SignatureCheck;
    applicant?: SignatureCheck;
    faculty_leader?: SignatureCheck;
  };
};

type SignedScanState =
  | "idle"
  | "scanning"
  | "success"
  | "error";

type SignedScanErrorType =
  | "format"
  | "document"
  | "signature"
  | null;

export default function MajorChangePage() {
  const router = useRouter();

  const [isStarted, setIsStarted] = useState(false);

  // Các bước: 
  // 1: Upload, 2: Form OCR, 3: Check điều kiện, 4: Ngành & Excel, 5: Điền Form, 6: Xem trước, 7: Hoàn tất
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Trạng thái upload file
  const [file1Status, setFile1Status] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [file2Status, setFile2Status] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const [file1Result, setFile1Result] =
    useState<OCRVerifyResult | null>(null);

  const [file2Result, setFile2Result] =
    useState<OCRVerifyResult | null>(null);

  const [file1Error, setFile1Error] =
    useState("");

  const [file2Error, setFile2Error] =
    useState("");

  const file1InputRef = useRef<HTMLInputElement>(null);
  const file2InputRef = useRef<HTMLInputElement>(null);

  // Dữ liệu OCR
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState<MajorChangeProfile | null>(null);
  const [studentName, setStudentName] = useState<string>("bạn");

  // Trạng thái kiểm tra học vụ (Bước 3)
  const [isCheckingAcademic, setIsCheckingAcademic] = useState(false);
  const [academicChecked, setAcademicChecked] = useState(false)
    ;

  // Trạng thái Bước 4 & 5 (Form điền thêm)
  const [targetMajor, setTargetMajor] = useState('');
  const [hasDownloadedExcel, setHasDownloadedExcel] = useState(false);
  const [isQualified, setIsQualified] = useState<boolean | null>(null);
  const [admissionMethod, setAdmissionMethod] = useState('Xét điểm THPT');

  const [admissionScores, setAdmissionScores] = useState({ combo: '', score: '', priority: '', threshold: '' });
  const [additionalInfo, setAdditionalInfo] = useState({ dob: '', pob: '', phone: '', cccd: '', issueDate: '', issuePlace: '' });
  const [reason, setReason] = useState('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Trạng thái nộp cuối cùng
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signedApplicationInputRef =
    useRef<HTMLInputElement>(null);

  const [signedScanState, setSignedScanState] =
    useState<SignedScanState>("idle");

  const [signedScanErrorType, setSignedScanErrorType] =
    useState<SignedScanErrorType>(null);

  const [
    signedApplicationResult,
    setSignedApplicationResult,
  ] = useState<OCRVerifyResult | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "downloaded">("idle");
  const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, currentStep, file1Status, file2Status, isExtracting, academicChecked, hasDownloadedExcel, isQualified, isSubmitting]);




  useEffect(() => {
    if (!isStarted) return;

    getMajorChangeProfile()
      .then((data) => {
        setStudentName(data.fullName || "bạn");
      })
      .catch((error) => {
        console.error(
          "Lỗi khi lấy tên sinh viên:",
          error
        );

        setStudentName("bạn");
      });
  }, [isStarted]);

  const handleStart = () => setIsStarted(true);
  const handleCancel = () => router.push('/student/dashboard');

  const getOCRVerifyUrl = () => {
    const configuredApi =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000/api";

    const apiBase =
      configuredApi.replace(/\/$/, "");

    return apiBase.endsWith("/api")
      ? `${apiBase}/ocr/verify/`
      : `${apiBase}/api/ocr/verify/`;
  };

  const verifyOCRDocument = async (
    file: File,
    documentType: string
  ): Promise<OCRVerifyResult> => {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    const allowedExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
    ];

    if (!allowedExtensions.includes(extension)) {
      throw new Error(
        "Chỉ chấp nhận file PDF, JPG, JPEG hoặc PNG."
      );
    }

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      throw new Error(
        "Phiên đăng nhập đã hết hạn. " +
        "Vui lòng đăng nhập lại."
      );
    }

    const uploadData = new FormData();

    uploadData.append(
      "uploaded_file",
      file
    );

    uploadData.append(
      "document_type",
      documentType
    );

    const response = await axios.post(
      getOCRVerifyUrl(),
      uploadData,
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

    const rawResult =
      response.data?.result ??
      response.data?.data ??
      response.data;

    const analysis =
      rawResult?.gemini_analysis ??
      rawResult?.analysis ??
      rawResult;

    const normalizedResult: OCRVerifyResult = {
      ...rawResult,

      format_valid:
        rawResult?.format_valid ??
        analysis?.format_valid,

      is_match:
        rawResult?.is_match ??
        analysis?.is_match,

      accepted:
        rawResult?.accepted ??
        analysis?.accepted,

      detected_document_type:
        rawResult?.detected_document_type ??
        analysis?.detected_document_type,

      validation_reason:
        rawResult?.validation_reason ??
        analysis?.validation_reason,

      error_message:
        rawResult?.error_message ??
        analysis?.error_message,

      extracted_fields:
        rawResult?.extracted_fields ??
        analysis?.extracted_fields ??
        {},

      signature_checks:
        rawResult?.signature_checks ??
        analysis?.signature_checks ??
        {},
    };

    return normalizedResult;
  };

  const handleUploadFile1 = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setFile1Status("uploading");
    setFile1Result(null);
    setFile1Error("");

    try {
      const result =
        await verifyOCRDocument(
          file,
          "MAJOR_CHANGE_ADMISSION_LETTER"
        );

      const correctDocument =
        result.format_valid !== false &&
        result.is_match === true &&
        result.detected_document_type ===
        "MAJOR_CHANGE_ADMISSION_LETTER";

      if (!correctDocument) {
        setFile1Status("error");

        setFile1Error(
          result.validation_reason ||
          result.error_message ||
          "Tài liệu không phải Giấy báo trúng tuyển."
        );

        return;
      }

      setFile1Result(result);
      setFile1Status("done");
    } catch (error) {
      console.error(
        "Lỗi kiểm tra Giấy báo trúng tuyển:",
        error
      );

      let message =
        "Không thể kiểm tra Giấy báo trúng tuyển.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data
            ?.validation_reason ||
          error.response?.data
            ?.error_message ||
          error.response?.data?.detail ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setFile1Error(message);
      setFile1Status("error");
    } finally {
      if (file1InputRef.current) {
        file1InputRef.current.value = "";
      }
    }
  };

  const handleUploadFile2 = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setFile2Status("uploading");
    setFile2Result(null);
    setFile2Error("");

    try {
      const result =
        await verifyOCRDocument(
          file,
          "MAJOR_CHANGE_GRADUATION_CERTIFICATE"
        );

      const correctDocument =
        result.format_valid !== false &&
        result.is_match === true &&
        result.detected_document_type ===
        "MAJOR_CHANGE_GRADUATION_CERTIFICATE";

      if (!correctDocument) {
        setFile2Status("error");

        setFile2Error(
          result.validation_reason ||
          result.error_message ||
          "Tài liệu không phải Giấy chứng nhận tốt nghiệp THPT."
        );

        return;
      }

      setFile2Result(result);
      setFile2Status("done");
    } catch (error) {
      console.error(
        "Lỗi kiểm tra Giấy chứng nhận tốt nghiệp:",
        error
      );

      let message =
        "Không thể kiểm tra Giấy chứng nhận tốt nghiệp THPT.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data
            ?.validation_reason ||
          error.response?.data
            ?.error_message ||
          error.response?.data?.detail ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setFile2Error(message);
      setFile2Status("error");
    } finally {
      if (file2InputRef.current) {
        file2InputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (
      file1Status !== "done" ||
      file2Status !== "done" ||
      !file1Result ||
      !file2Result ||
      currentStep !== 1
    ) {
      return;
    }

    setIsExtracting(true);

    const admissionFields =
      file1Result.extracted_fields || {};

    const graduationFields =
      file2Result.extracted_fields || {};

    getMajorChangeProfile()
      .then((profile) => {
        const mergedProfile:
          MajorChangeProfile = {
          ...profile,

          fullName: String(
            admissionFields.full_name ||
            graduationFields.full_name ||
            profile.fullName ||
            ""
          ),

          studentId: String(
            admissionFields.student_id ||
            profile.studentId ||
            ""
          ),

          dob: String(
            graduationFields.date_of_birth ||
            profile.dob ||
            ""
          ),

          enrollmentYear: String(
            admissionFields.admission_year ||
            profile.enrollmentYear ||
            ""
          ),

          currentMajor: String(
            admissionFields.admission_major ||
            profile.currentMajor ||
            ""
          ),
        };

        setFormData(mergedProfile);

        setAdditionalInfo((previous) => ({
          ...previous,

          dob:
            mergedProfile.dob ||
            "",

          phone:
            mergedProfile.phone ||
            "",

          cccd:
            mergedProfile.idNumber ||
            "",
        }));

        setCurrentStep(2);
      })
      .catch((error) => {
        console.error(
          "Lỗi lấy hồ sơ sinh viên:",
          error
        );

        alert(
          "Không thể lấy dữ liệu sinh viên."
        );
      })
      .finally(() => {
        setIsExtracting(false);
      });
  }, [
    file1Status,
    file2Status,
    file1Result,
    file2Result,
    currentStep,
  ]);

  const handleConfirmData = () => {
    setCurrentStep(3);
    setIsCheckingAcademic(true);
    setTimeout(() => {
      setIsCheckingAcademic(false);
      setAcademicChecked(true);
    }, 1500);
  };

  const handleDownloadExcel = () => {
    const link = document.createElement("a");

    link.href =
      "/bieu-mau/Kiem_tra_dieu_kien.xlsm";

    link.download =
      "Kiem_tra_dieu_kien_chuyen_truong.xlsm";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setHasDownloadedExcel(true);
  };

  const handleConfirmQualification = (status: boolean) => {
    setIsQualified(status);

    if (status) {
      setCurrentStep(5);
      return;
    }

    // Không cho chuyển sang bước điền hồ sơ khi không đủ điều kiện.
    setCurrentStep(4);
  };

  const handleSignedApplicationUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setSignedScanState("scanning");
    setSignedScanErrorType(null);
    setSignedApplicationResult(null);

    try {
      const result =
        await verifyOCRDocument(
          file,
          "MAJOR_CHANGE_SIGNED_APPLICATION"
        );

      const correctDocument =
        result.format_valid !== false &&
        result.is_match === true &&
        result.detected_document_type ===
        "MAJOR_CHANGE_SIGNED_APPLICATION";

      const applicantSigned =
        result.signature_checks
          ?.applicant
          ?.present === true;

      if (!correctDocument) {
        setSignedApplicationResult(result);
        setSignedScanErrorType("document");
        setSignedScanState("error");
        return;
      }

      if (!applicantSigned) {
        setSignedApplicationResult(result);
        setSignedScanErrorType("signature");
        setSignedScanState("error");
        return;
      }

      setSignedApplicationResult(result);
      setSignedScanErrorType(null);
      setSignedScanState("success");
    } catch (error) {
      console.error(
        "Lỗi kiểm tra Đơn xin chuyển ngành:",
        error
      );

      setSignedScanState("error");
      setSignedScanErrorType("document");
    } finally {
      if (
        signedApplicationInputRef.current
      ) {
        signedApplicationInputRef.current.value =
          "";
      }
    }
  };


  const handleRetrySignedApplication = () => {
    setSignedApplicationResult(null);
    setSignedScanState("idle");
    setSignedScanErrorType(null);

    setTimeout(() => {
      signedApplicationInputRef.current?.click();
    }, 0);
  };

  const handleFinalSubmit = () => {
    const applicantSigned =
      signedApplicationResult
        ?.signature_checks
        ?.applicant
        ?.present === true;

    if (
      signedScanState !== "success" ||
      !applicantSigned
    ) {
      alert(
        "Vui lòng tải lên Đơn xin chuyển ngành có chữ ký của Người làm đơn."
      );

      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(7);
    }, 1500);
  };

  // Check form validation bước 5
  const isForm5Valid = Boolean(
    targetMajor.trim() &&
    additionalInfo.pob.trim() &&
    additionalInfo.phone.trim() &&
    additionalInfo.cccd.trim() &&
    additionalInfo.issueDate.trim() &&
    additionalInfo.issuePlace.trim() &&
    reason.trim()
  );


  const buildMajorChangePayload = () => ({
    target_major: targetMajor.trim(),

    enrollment_year: String(
      formData?.enrollmentYear || ""
    ).trim(),

    training_type: "Chính quy",

    place_of_birth: additionalInfo.pob.trim(),
    phone: additionalInfo.phone.trim(),

    id_number: additionalInfo.cccd.trim(),
    id_issue_date: additionalInfo.issueDate.trim(),
    id_issue_place: additionalInfo.issuePlace.trim(),

    admission_method: admissionMethod,

    admission_combo: admissionScores.combo.trim(),
    admission_score: admissionScores.score.trim(),
    priority_score: admissionScores.priority.trim(),
    admission_threshold: admissionScores.threshold.trim(),

    transfer_reason: reason.trim(),

    evidence_note: [
      "Giấy báo trúng tuyển",
      "Giấy báo kết quả thi tốt nghiệp THPT",
      "Bảng điểm",
      "Giấy xác nhận điều kiện học vụ",
      "Giấy xác nhận không vi phạm kỷ luật",
      "Điểm rèn luyện",
    ].join("; "),

    application_place: "Đà Nẵng",
  });

  const handlePreviewDocument = async () => {
    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      alert(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
      return;
    }

    if (!formData) {
      alert("Chưa có thông tin sinh viên.");
      return;
    }

    if (!isForm5Valid) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      setIsPreviewLoading(true);

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000/api"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${apiBase}/documents/major-change/preview/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildMajorChangePayload()
          ),
        }
      );

      if (!response.ok) {
        const rawError = await response.text();

        console.error(
          "Lỗi API xem trước đơn chuyển ngành:",
          {
            status: response.status,
            response: rawError,
          }
        );

        let errorMessage = rawError;

        try {
          const errorData = JSON.parse(rawError);

          errorMessage =
            errorData?.message ||
            errorData?.detail ||
            rawError;
        } catch {
          // Giữ nguyên rawError
        }

        throw new Error(
          errorMessage ||
          `Backend trả về lỗi ${response.status}`
        );
      }

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/pdf")) {
        const responseText = await response.text();

        throw new Error(
          responseText ||
          "Backend không trả về file PDF."
        );
      }

      const pdfBlob = await response.blob();

      const pdfUrl = URL.createObjectURL(
        new Blob(
          [pdfBlob],
          { type: "application/pdf" }
        )
      );

      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return pdfUrl;
      });

      setCurrentStep(6);
    } catch (error) {
      console.error(
        "Lỗi xem trước đơn chuyển ngành:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tạo bản xem trước đơn chuyển ngành."
      );
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadDoc = async () => {
    if (downloadState === "downloading") {
      return;
    }

    try {
      setDownloadState("downloading");

      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("access");

      if (!accessToken) {
        throw new Error(
          "Không tìm thấy phiên đăng nhập. " +
          "Vui lòng đăng nhập lại."
        );
      }

      if (!formData) {
        throw new Error(
          "Chưa có thông tin sinh viên."
        );
      }

      if (!isForm5Valid) {
        throw new Error(
          "Vui lòng nhập đầy đủ thông tin " +
          "bắt buộc trước khi tải đơn."
        );
      }

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000/api"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${apiBase}/documents/major-change/download/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            target_major: targetMajor.trim(),

            enrollment_year: String(
              formData.enrollmentYear || ""
            ).trim(),

            place_of_birth:
              additionalInfo.pob.trim(),

            phone:
              additionalInfo.phone.trim(),

            id_number:
              additionalInfo.cccd.trim(),

            id_issue_date:
              additionalInfo.issueDate.trim(),

            id_issue_place:
              additionalInfo.issuePlace.trim(),

            admission_method: admissionMethod,

            admission_combo:
              admissionScores.combo.trim(),

            admission_score:
              admissionScores.score.trim(),

            priority_score:
              admissionScores.priority.trim(),

            admission_threshold:
              admissionScores.threshold.trim(),

            transfer_reason: reason.trim(),

            evidence_note: [
              "Giấy báo trúng tuyển",
              "Giấy báo kết quả thi tốt nghiệp THPT",
              "Bảng điểm",
              "Giấy xác nhận điều kiện học vụ",
              "Giấy xác nhận không vi phạm kỷ luật",
              "Điểm rèn luyện",
            ].join("; "),
          }),
        }
      );

      if (!response.ok) {
        const rawError = await response.text();

        let errorData: any = null;

        try {
          errorData = JSON.parse(rawError);
        } catch {
          errorData = null;
        }

        console.error(
          "Lỗi API tạo đơn chuyển ngành:",
          {
            status: response.status,
            response: rawError,
          }
        );

        const missingFields =
          errorData?.missing_fields;

        if (
          Array.isArray(missingFields) &&
          missingFields.length > 0
        ) {
          throw new Error(
            `Thiếu thông tin: ${missingFields.join(", ")
            }`
          );
        }

        throw new Error(
          errorData?.message ||
          errorData?.detail ||
          rawError ||
          `Backend trả về lỗi ${response.status}`
        );
      }

      const fileBlob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(fileBlob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download = formData.studentId
        ? `Don_xin_chuyen_nganh_${formData.studentId}.docx`
        : "Don_xin_chuyen_nganh.docx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setDownloadState("downloaded");
    } catch (error) {
      console.error(
        "Lỗi tải đơn chuyển ngành:",
        error
      );

      setDownloadState("idle");

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn chuyển ngành."
      );
    }
  };

  const updateFormData = (
    field: keyof MajorChangeProfile,
    value: string
  ) => {
    setFormData((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        [field]: value,
      };
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface
        title="Chuyển ngành"
        description="Đăng ký chuyển sang ngành học khác"
        Icon={ArrowLeftRight}
        welcomeMessage={<>Chào bạn, hệ thống Trường Đại học Kinh tế ghi nhận bạn đang chọn thủ tục <strong>chuyển ngành</strong>. Bạn có muốn đăng ký chuyển ngành không?</>}
        welcomePrimaryLabel="Đăng ký chuyển ngành"
        welcomeSecondaryLabel="Không, quay lại"
        onStart={handleStart}
        onCancel={handleCancel}
        isStarted={isStarted}
        headerBadge={isStarted && currentStep < 7 ? (
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> AI đang hỗ trợ
          </span>
        ) : undefined}
      >
        {isStarted && (
          <div className="flex flex-col gap-8 mt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ================= BƯỚC 1: UPLOAD ================= */}
            {currentStep >= 1 && (
              <>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Xin chào <strong>{studentName}</strong>, hệ thống ghi nhận bạn đang làm thủ tục <strong>xin chuyển ngành</strong>. Vui lòng cung cấp các tài liệu minh chứng đầu vào để hệ thống trích xuất thông tin nhé: </p>
                  </div>
                </div>

                <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden p-5">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Khu vực tải tài liệu</h4>
                  <div className="flex flex-col gap-3">
                    {/* TÀI LIỆU 1 */}
                    <div className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${file1Status === 'done' ? 'bg-green-50/30 border-green-300' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                      <div className="flex items-center gap-4">
                        {file1Status === 'done' ? <div className="bg-green-500 text-white p-1.5 rounded-full"><Check size={16} strokeWidth={3} /></div> : <div className="bg-gray-200 text-gray-500 p-1.5 rounded-full"><Upload size={16} /></div>}
                        <div>
                          <p className={`font-semibold text-sm ${file1Status === 'done' ? 'text-green-700' : 'text-gray-700'}`}>Tải lên Giấy báo trúng tuyển (PDF)</p>
                          <p className={`text-xs ${file1Status === 'done' ? 'text-green-600' : 'text-gray-400'}`}>{file1Status === 'done' ? 'Đã tải lên thành công ✓' : 'Giay_Bao_Trung_Tuyen.pdf'}</p>
                        </div>
                      </div>
                      {(file1Status === 'idle' || file1Status === 'error') && (
                        <><button onClick={() => file1InputRef.current?.click()} className="text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md transition shadow-sm">Tải lên</button>
                          <input type="file" className="hidden" ref={file1InputRef} onChange={handleUploadFile1} accept=".pdf,.png,.jpg,.jpeg" /></>
                      )}
                      {file1Status === 'uploading' && <span className="text-sm text-gray-500 animate-pulse font-medium">Đang tải...</span>}
                    </div>
                    {file1Status === "error" &&
                      file1Error && (
                        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                          <p className="text-xs text-red-600">
                            {file1Error}
                          </p>
                        </div>
                      )}

                    {/* TÀI LIỆU 2 */}
                    <div className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${file2Status === 'done' ? 'bg-green-50/30 border-green-300' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                      <div className="flex items-center gap-4">
                        {file2Status === 'done' ? <div className="bg-green-500 text-white p-1.5 rounded-full"><Check size={16} strokeWidth={3} /></div> : <div className="bg-gray-200 text-gray-500 p-1.5 rounded-full"><Upload size={16} /></div>}
                        <div>
                          <p className={`font-semibold text-sm ${file2Status === 'done' ? 'text-green-700' : 'text-gray-700'}`}>Tải lên Bản scan Giấy CN Tốt nghiệp THPT</p>
                          <p className={`text-xs ${file2Status === 'done' ? 'text-green-600' : 'text-gray-400'}`}>{file2Status === 'done' ? 'Đã tải lên thành công ✓' : 'Giay_Chung_Nhan_TN_THPT.pdf'}</p>
                        </div>
                      </div>
                      {(file2Status === 'idle' || file2Status === 'error') && (
                        <><button onClick={() => file2InputRef.current?.click()} className="text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md transition shadow-sm">Tải lên</button>
                          <input type="file" className="hidden" ref={file2InputRef} onChange={handleUploadFile2} accept=".pdf,.png,.jpg,.jpeg" /></>
                      )}
                      {file2Status === 'uploading' && <span className="text-sm text-gray-500 animate-pulse font-medium">Đang tải...</span>}
                    </div>
                    {file2Status === "error" &&
                      file2Error && (
                        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                          <p className="text-xs text-red-600">
                            {file2Error}
                          </p>
                        </div>
                      )}
                  </div>

                  {isExtracting && (
                    <div className="mt-6 flex flex-col items-center justify-center p-6 border border-blue-100 bg-blue-50/50 rounded-xl">
                      <span className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></span>
                      <p className="text-sm font-semibold text-blue-700">AI đang quét và trích xuất dữ liệu...</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ================= BƯỚC 2: FORM XÁC NHẬN OCR ================= */}
            {currentStep >= 2 && formData && (
              <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in">
                <div className="bg-[#F8FAFC] px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm"><div className="bg-[#1E293B] text-white rounded-full p-0.5"><Check size={14} /></div> Đối chiếu dữ liệu — Có thể chỉnh sửa</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">Trích xuất tự động</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 mb-6">
                    {/* Họ và tên */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Họ và tên
                      </label>

                      <input
                        type="text"
                        value={formData.fullName || ""}
                        onChange={(event) =>
                          updateFormData("fullName", event.target.value)
                        }
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none"
                      />
                    </div>

                    {/* Mã số sinh viên */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Mã số sinh viên
                      </label>

                      <input
                        type="text"
                        value={formData.studentId || ""}
                        onChange={(event) =>
                          updateFormData("studentId", event.target.value)
                        }
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none"
                      />
                    </div>

                    {/* Ngày sinh */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Ngày sinh
                      </label>

                      <input
                        type="text"
                        value={formData.dob || ""}
                        onChange={(event) => {
                          updateFormData("dob", event.target.value);

                          setAdditionalInfo((previous) => ({
                            ...previous,
                            dob: event.target.value,
                          }));
                        }}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none"
                      />
                    </div>

                    {/* Số CCCD */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Số CCCD/CMND
                      </label>

                      <input
                        type="text"
                        value={formData.idNumber || ""}
                        onChange={(event) => {
                          updateFormData("idNumber", event.target.value);

                          setAdditionalInfo((previous) => ({
                            ...previous,
                            cccd: event.target.value,
                          }));
                        }}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none"
                      />
                    </div>

                    {/* Năm trúng tuyển */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Năm trúng tuyển
                      </label>

                      <input
                        type="text"
                        value={formData.enrollmentYear || ""}
                        onChange={(event) =>
                          updateFormData(
                            "enrollmentYear",
                            event.target.value
                          )
                        }
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none"
                      />
                    </div>

                    {/* Ngành hiện tại */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Ngành hiện tại
                      </label>

                      <input
                        type="text"
                        value={formData.currentMajor || ""}
                        onChange={(event) =>
                          updateFormData(
                            "currentMajor",
                            event.target.value
                          )
                        }
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                  {currentStep === 2 && (
                    <button onClick={handleConfirmData} className="w-full bg-[#0070F4] text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex justify-center items-center gap-2 text-sm">
                      <Check size={18} /> Xác nhận thông tin chính xác
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 3: KIỂM TRA ĐIỀU KIỆN ================= */}
            {currentStep >= 3 && (
              <div className="ml-12 flex flex-col gap-4 animate-in fade-in mt-2">
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 flex items-center gap-3 text-sm font-medium">
                  <div className="bg-green-500 text-white rounded-full p-0.5"><Check size={16} /></div> Thông tin đã xác nhận — Đang kiểm tra tình trạng học vụ...
                </div>

                {academicChecked && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50/50 border border-green-200 rounded-xl p-5"><h4 className="font-bold text-green-700 text-sm mb-2"><Check size={14} className="inline mr-1 bg-green-500 text-white rounded-full p-0.5" /> Đạt điều kiện</h4><p className="text-gray-800 text-sm font-medium">Không thuộc diện bị buộc thôi học</p></div>
                    <div className="bg-green-50/50 border border-green-200 rounded-xl p-5"><h4 className="font-bold text-green-700 text-sm mb-2"><Check size={14} className="inline mr-1 bg-green-500 text-white rounded-full p-0.5" /> Đạt điều kiện</h4><p className="text-gray-800 text-sm font-medium">Không vi phạm kỷ luật</p></div>
                  </div>
                )}
                {academicChecked && currentStep === 3 && (
                  <button onClick={() => setCurrentStep(4)} className="w-full bg-[#0070F4] text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex justify-center items-center gap-2 text-sm mt-2">
                    Tiếp tục <ChevronRight size={18} />
                  </button>
                )}
              </div>
            )}

            {/* ================= BƯỚC 4 & 5: FORM NHẬP LIỆU ================= */}
            {currentStep >= 4 && (
              <div className="flex flex-col gap-4 animate-in fade-in mt-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Bây giờ hệ thống sẽ kiểm tra <strong>thông tin tuyển sinh</strong> và <strong>lý do chuyển ngành</strong> của bạn. Vui lòng điền đầy đủ thông tin bên dưới.</p>
                  </div>
                </div>

                <div className="ml-12 border border-gray-200 bg-white rounded-xl p-6 shadow-sm">
                  <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Ngành muốn chuyển đến</label>
                    <input type="text" placeholder="VD: Công nghệ Phần mềm, Quản trị Kinh doanh..." value={targetMajor} onChange={(e) => setTargetMajor(e.target.value)} disabled={currentStep > 5} className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>

                  {isQualified !== true && (
                    <div className="flex flex-col gap-4">
                      <div className="bg-[#1F4377] text-white p-5 rounded-2xl shadow-sm">
                        <p className="text-sm text-blue-100 leading-relaxed mb-4">
                          Để đảm bảo tính chính xác theo quy định của Phòng Đào tạo,
                          bạn vui lòng tải công cụ kiểm tra tự động dưới đây.
                        </p>

                        <button
                          type="button"
                          onClick={handleDownloadExcel}
                          className="bg-white text-[#173B70] w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition text-sm"
                        >
                          <Download size={18} />
                          Tải xuống file kiểm tra điều kiện chuyển ngành
                        </button>

                        {hasDownloadedExcel && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
                            <Check size={16} strokeWidth={3} />
                            <span>
                              Kiem_tra_dieu_kien_chuyen_truong.xlsm đã tải xuống
                            </span>
                          </div>
                        )}

                        {hasDownloadedExcel && isQualified === null && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4 animate-in fade-in slide-in-from-bottom-2">
                            <button
                              type="button"
                              onClick={() => handleConfirmQualification(true)}
                              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition text-sm"
                            >
                              Tôi đủ điều kiện
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConfirmQualification(false)}
                              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition text-sm"
                            >
                              Tôi không đủ điều kiện
                            </button>
                          </div>
                        )}
                      </div>

                      {isQualified === false && (
                        <div className="border border-red-300 bg-red-50 rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              size={22}
                              className="text-red-600 shrink-0 mt-0.5"
                            />

                            <div>
                              <h4 className="font-bold text-red-700 text-base">
                                Hồ sơ không đủ điều kiện
                              </h4>

                              <p className="text-sm text-red-600 mt-2 leading-relaxed">
                                Bạn không đủ điều kiện chuyển ngành theo quy định
                                hiện tại. Nếu có thắc mắc, vui lòng liên hệ Phòng
                                Đào tạo để được hỗ trợ.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORM BƯỚC 5 */}
                  {isQualified && (
                    <div className="mt-4 animate-in fade-in">
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 mb-6">
                        <CheckCircle2 size={18} className="text-green-600" /> Bạn đã chọn: Tôi đã đủ điều kiện
                      </div>

                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Phương thức xét tuyển của bạn</h4>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {['Xét điểm THPT', 'Xét học bạ', 'Tuyển thẳng', 'Xét điểm ĐGNL', 'Phương thức khác'].map(method => (
                          <button key={method} onClick={() => setAdmissionMethod(method)} disabled={currentStep > 5} className={`px-4 py-2 border rounded-md text-sm font-medium transition ${admissionMethod === method ? 'bg-[#0070F4] text-white border-[#0070F4]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                            {method}
                          </button>
                        ))}
                      </div>

                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Điểm tuyển sinh</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Tổ hợp môn xét tuyển</label><input type="text" placeholder="VD: A00, A01, D01" value={admissionScores.combo} onChange={e => setAdmissionScores({ ...admissionScores, combo: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Điểm xét tuyển</label><input type="text" placeholder="VD: 24.5" value={admissionScores.score} onChange={e => setAdmissionScores({ ...admissionScores, score: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Điểm ưu tiên (nếu có)</label><input type="text" placeholder="VD: 1.0" value={admissionScores.priority} onChange={e => setAdmissionScores({ ...admissionScores, priority: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Ngưỡng đầu vào (nếu có)</label><input type="text" placeholder="VD: 20" value={admissionScores.threshold} onChange={e => setAdmissionScores({ ...admissionScores, threshold: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                      </div>

                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Thông tin cá nhân bổ sung</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Ngày sinh</label><input type="text" value={additionalInfo.dob} onChange={e => setAdditionalInfo({ ...additionalInfo, dob: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Nơi sinh</label><input type="text" placeholder="VD: TP. Hồ Chí Minh" value={additionalInfo.pob} onChange={e => setAdditionalInfo({ ...additionalInfo, pob: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Số điện thoại</label><input type="text" value={additionalInfo.phone} onChange={e => setAdditionalInfo({ ...additionalInfo, phone: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Số CCCD</label><input type="text" value={additionalInfo.cccd} onChange={e => setAdditionalInfo({ ...additionalInfo, cccd: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Ngày cấp CCCD</label><input type="text" placeholder="VD: 15/06/2021" value={additionalInfo.issueDate} onChange={e => setAdditionalInfo({ ...additionalInfo, issueDate: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Nơi cấp</label><input type="text" placeholder="VD: Cục CS QLHC" value={additionalInfo.issuePlace} onChange={e => setAdditionalInfo({ ...additionalInfo, issuePlace: e.target.value })} disabled={currentStep > 5} className="w-full border rounded-lg p-2.5 text-sm outline-none" /></div>
                      </div>

                      <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Lý do xin chuyển ngành</label>
                        <textarea rows={3} placeholder="Trình bày lý do bạn muốn chuyển ngành" value={reason} onChange={e => setReason(e.target.value)} disabled={currentStep > 5} className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none resize-none"></textarea>
                      </div>

                      {currentStep === 5 && (
                        <button
                          type="button"
                          onClick={handlePreviewDocument}
                          disabled={!isForm5Valid || isPreviewLoading}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {isPreviewLoading
                            ? "Đang tạo bản xem trước..."
                            : "Tiếp tục - Xem trước đơn"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 6: XEM TRƯỚC ================= */}
            {currentStep >= 6 && (
              <div className="flex flex-col gap-4 animate-in fade-in mt-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Cảm ơn bạn. Mình đã tổng hợp xong toàn bộ dữ liệu. Bạn hãy kiểm tra lại bản nháp của <strong>Đơn xin chuyển ngành</strong> và bộ hồ sơ đính kèm dưới đây nhé.</p>
                  </div>
                </div>

                {/* Progress bar xem trước */}
                <div className="ml-12 bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex justify-between items-center text-xs font-medium text-gray-400">
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={16} /> Xác nhận thông tin</div>
                  <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={16} /> Thông tin tuyển sinh & Lý do</div>
                  <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                  <div className="flex items-center gap-2 text-slate-800"><div className="w-5 h-5 bg-slate-800 text-white rounded-full flex justify-center items-center">3</div> Xem trước & Xuất đơn</div>
                </div>

                <div className="ml-12 flex flex-col gap-6">
                  {/* Bản Document Preview */}
                  <div className="bg-gray-100 p-4 rounded-xl">
                    {previewUrl ? (
                      <iframe
                        src={previewUrl}
                        title="Xem trước đơn xin chuyển ngành"
                        className="w-full h-[1000px] bg-white border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <div className="h-[500px] flex items-center justify-center text-gray-500">
                        Chưa có bản xem trước
                      </div>
                    )}
                  </div>

                  {/* Tài liệu đính kèm list */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Tài liệu đính kèm</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"><div className="flex items-center gap-3 text-sm text-gray-700"><FileText size={18} className="text-gray-400" /> Giấy báo trúng tuyển</div><span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-semibold">Đã xác thực</span></div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"><div className="flex items-center gap-3 text-sm text-gray-700"><FileText size={18} className="text-gray-400" /> Giấy chứng nhận Tốt nghiệp THPT</div><span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-semibold">Đã xác thực</span></div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"><div className="flex items-center gap-3 text-sm text-gray-700"><FileText size={18} className="text-gray-400" /> Giấy xác nhận không buộc thôi học</div><span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-semibold">Tạo tự động</span></div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"><div className="flex items-center gap-3 text-sm text-gray-700"><FileText size={18} className="text-gray-400" /> Giấy xác nhận không vi phạm kỷ luật</div><span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-semibold">Tạo tự động</span></div>
                    </div>
                  </div>

                  {currentStep === 6 && (
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadDoc}
                        disabled={downloadState === "downloading"}
                        className={`w-full py-3.5 rounded-lg font-medium transition flex justify-center items-center gap-2 text-sm shadow-sm ${downloadState === "downloading"
                            ? "bg-blue-400 text-white cursor-not-allowed"
                            : "bg-[#0070F4] text-white hover:bg-blue-700"
                          }`}
                      >
                        {downloadState === "downloading" ? (
                          <>
                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            Đang tạo đơn chuyển ngành...
                          </>
                        ) : (
                          <>
                            <Download size={18} />
                            Tải xuống Đơn xin chuyển ngành (.docx)
                          </>
                        )}
                      </button>

                      {downloadState === "downloaded" && (
                        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 flex items-center gap-2 text-sm font-medium">
                          <CheckCircle2 size={18} />
                          Đơn xin chuyển ngành đã được tải xuống.
                        </div>
                      )}

                      {downloadState === "downloaded" && (
                        <div className="flex flex-col gap-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-blue-700">
                              Bước tiếp theo
                            </p>

                            <p className="text-xs text-blue-600 mt-1">
                              Mở file Word vừa tải, ký tại mục
                              <strong> Người làm đơn</strong>.
                              Sau đó lưu hoặc xuất thành PDF,
                              hoặc chụp rõ đơn đã ký rồi tải lên hệ thống.
                            </p>
                          </div>

                          <input
                            ref={signedApplicationInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={
                              handleSignedApplicationUpload
                            }
                          />

                          {signedScanState === "idle" && (
                            <button
                              type="button"
                              onClick={() =>
                                signedApplicationInputRef
                                  .current
                                  ?.click()
                              }
                              className="w-full border-2 border-dashed border-gray-300 bg-white rounded-xl p-7 flex flex-col items-center justify-center hover:bg-gray-50 transition"
                            >
                              <Upload
                                size={28}
                                className="text-blue-500 mb-2"
                              />

                              <span className="text-sm font-semibold text-gray-800">
                                Tải lên Đơn xin chuyển ngành đã ký
                              </span>

                              <span className="text-xs text-gray-400 mt-1">
                                Chấp nhận PDF, JPG, JPEG hoặc PNG
                              </span>
                            </button>
                          )}

                          {signedScanState === "scanning" && (
                            <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 flex flex-col items-center">
                              <span className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />

                              <p className="text-sm font-semibold text-blue-700">
                                AI đang kiểm tra đơn và chữ ký...
                              </p>

                              <p className="text-xs text-blue-500 mt-1">
                                Đang kiểm tra chữ ký Người làm đơn
                              </p>
                            </div>
                          )}

                          {signedScanState === "error" &&
                            signedScanErrorType ===
                            "document" && (
                              <div className="border border-red-200 bg-red-50 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                  <X
                                    size={22}
                                    className="text-red-600 shrink-0"
                                  />

                                  <div>
                                    <p className="font-semibold text-red-700 text-sm">
                                      Tài liệu không hợp lệ
                                    </p>

                                    <p className="text-xs text-red-600 mt-1">
                                      Vui lòng tải đúng Đơn xin chuyển ngành
                                      được tạo từ hệ thống.
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={
                                    handleRetrySignedApplication
                                  }
                                  className="mt-4 w-full border border-red-300 text-red-700 bg-white py-2.5 rounded-lg text-sm font-medium"
                                >
                                  Thử tải lại file khác
                                </button>
                              </div>
                            )}

                          {signedScanState === "error" &&
                            signedScanErrorType ===
                            "signature" && (
                              <div className="border border-red-200 bg-red-50 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-red-700 text-sm">
                                      Chưa tìm thấy chữ ký
                                    </p>

                                    <p className="text-xs text-red-600 mt-1">
                                      Sinh viên cần ký tại mục Người làm đơn.
                                    </p>
                                  </div>

                                  <X
                                    size={24}
                                    className="text-red-600"
                                  />
                                </div>

                                <div className="mt-4 border border-red-200 bg-white rounded-lg p-4 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                      Chữ ký Người làm đơn
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                      Sinh viên ký tên
                                    </p>
                                  </div>

                                  <X
                                    size={22}
                                    className="text-red-600"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={
                                    handleRetrySignedApplication
                                  }
                                  className="mt-4 w-full border border-red-300 text-red-700 bg-white py-2.5 rounded-lg text-sm font-medium"
                                >
                                  Tải lại đơn đã ký
                                </button>
                              </div>
                            )}

                          {signedScanState === "success" && (
                            <div className="border border-green-200 bg-green-50 rounded-xl p-5">
                              <div className="flex items-start gap-3">
                                <CheckCircle2
                                  size={24}
                                  className="text-green-600 shrink-0"
                                />

                                <div>
                                  <p className="font-semibold text-green-700 text-sm">
                                    Đơn hợp lệ
                                  </p>

                                  <p className="text-xs text-green-600 mt-1">
                                    AI đã phát hiện chữ ký của Người làm đơn.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 border border-green-200 bg-white rounded-lg p-4 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    Chữ ký Người làm đơn
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    Đã phát hiện
                                  </p>
                                </div>

                                <CheckCircle2
                                  size={22}
                                  className="text-green-600"
                                />
                              </div>
                            </div>
                          )}

                          {signedScanState === "success" && (
                            <button
                              type="button"
                              onClick={handleFinalSubmit}
                              disabled={isSubmitting}
                              className={`w-full py-3.5 rounded-lg font-medium transition flex justify-center items-center gap-2 text-sm shadow-sm ${isSubmitting
                                  ? "bg-blue-400 text-white cursor-not-allowed"
                                  : "bg-[#0070F4] text-white hover:bg-blue-700"
                                }`}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                  Đang nộp hồ sơ...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={18} />
                                  Nộp toàn bộ hồ sơ
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 7: HOÀN TẤT & THEO DÕI ================= */}
            {currentStep >= 7 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 mt-6">

                {/* Banner Thành công */}
                <div className="ml-12 bg-green-50 border border-green-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="bg-green-500 text-white rounded-full p-2 mb-4"><Check size={32} strokeWidth={3} /></div>
                  <h3 className="font-bold text-green-700 text-lg mb-1">Hồ sơ đã được nộp thành công!</h3>
                  <p className="text-green-600 text-sm mb-3">Phòng Đào tạo sẽ xem xét và phản hồi trong vòng <strong>07 - 10 ngày làm việc kể từ khi nhận đủ hồ sơ</strong>.</p>
                  <p className="text-xs text-gray-500">Mã hồ sơ: <strong>CN-2026-0728A</strong></p>
                </div>

                {/* Tracking Dashboard */}
                <div className="ml-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex border-b border-gray-200 text-sm font-medium">
                    <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 transition-colors ${activeTab === 'details' ? 'text-[#0070F4] border-b-2 border-[#0070F4]' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}>Xem chi tiết hồ sơ</button>
                    <button onClick={() => setActiveTab('tracking')} className={`flex-1 py-4 transition-colors ${activeTab === 'tracking' ? 'text-[#0070F4] border-b-2 border-[#0070F4]' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}>Theo dõi trạng thái</button>
                  </div>

                  {activeTab === 'details' && (
                    <div className="animate-in fade-in">
                      <div className="bg-[#1E3A5F] text-white p-6 flex justify-between items-start">
                        <div>
                          <p className="text-xs text-blue-300 font-semibold mb-1 uppercase tracking-wider">Biên nhận kỹ thuật số</p>
                          <h4 className="font-bold text-2xl mb-6">Đơn xin chuyển ngành</h4>
                          <div className="flex gap-12">
                            <div><p className="text-xs text-blue-300 mb-1">Mã hồ sơ</p><p className="font-semibold">CN-2026-0728A</p></div>
                            <div><p className="text-xs text-blue-300 mb-1">Thời gian nộp</p><p className="font-semibold flex items-center gap-1.5"><Clock size={14} /> 14:22 - 28/07/2026</p></div>
                          </div>
                        </div>
                        <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">⏳ Đang chờ xử lý</span>
                      </div>

                      <div className="p-6">
                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Thông tin cá nhân & Nguyện vọng</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100"><p className="text-xs text-gray-400 mb-1">Họ và tên</p><p className="font-semibold text-gray-800">{formData?.fullName}</p></div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100"><p className="text-xs text-gray-400 mb-1">Mã số sinh viên</p><p className="font-semibold text-gray-800">{formData?.studentId}</p></div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100"><p className="text-xs text-gray-400 mb-1">Ngày sinh</p><p className="font-semibold text-gray-800">{additionalInfo.dob}</p></div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100"><p className="text-xs text-gray-400 mb-1">Số CCCD</p><p className="font-semibold text-gray-800">{additionalInfo.cccd}</p></div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mb-8">
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 mb-1">Chuyển từ</p><p className="font-bold text-slate-800">{formData?.currentMajor}</p>
                          </div>
                          <div className="px-4 text-blue-400"><ArrowLeftRight size={24} /></div>
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 mb-1">Chuyển đến</p><p className="font-bold text-[#0070F4]">{targetMajor}</p>
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Cơ sở xét duyệt</h5>
                        <div className="flex gap-3 mb-8">
                          <span className="bg-[#1E293B] text-white px-4 py-2 rounded-lg text-sm font-semibold">{admissionMethod}</span>
                          <span className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Điểm xét tuyển: <strong>{admissionScores.score}</strong></span>
                          <span className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Ngưỡng đầu vào: <strong>{admissionScores.threshold}</strong></span>
                        </div>

                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Danh sách tài liệu đính kèm (4 tệp)</h5>
                        <div className="space-y-3">
                          {[
                            { name: 'Đơn xin chuyển ngành đào tạo', desc: 'Bản hoàn chỉnh có chữ ký số', icon: <FileText className="text-blue-500" />, bg: 'bg-blue-50' },
                            { name: 'Giấy báo trúng tuyển', desc: 'Bản PDF gốc đã tải lên', icon: <FileText className="text-red-400" />, bg: 'bg-red-50' },
                            { name: 'Giấy chứng nhận Tốt nghiệp THPT', desc: 'Bản scan đã tải lên', icon: <FileText className="text-green-500" />, bg: 'bg-green-50' },
                            { name: 'Giấy xác nhận điều kiện học vụ', desc: 'Gồm ĐK thôi học & Kỷ luật', icon: <FileText className="text-purple-500" />, bg: 'bg-purple-50' },
                          ].map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                              <div className="flex items-center gap-4">
                                <div className={`${file.bg} p-2 rounded-lg`}>{file.icon}</div>
                                <div><p className="text-sm font-semibold text-gray-800">{file.name}</p><p className="text-xs text-gray-400">{file.desc}</p></div>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-100"><Eye size={14} /> Xem</button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-100"><Download size={14} /> Tải</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tracking' && (
                    <div className="p-8 flex items-center justify-center text-gray-500 text-sm">
                      Tính năng theo dõi lộ trình đang được cập nhật...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </ChatInterface>
    </div>
  );
}