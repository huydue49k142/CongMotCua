"use client";

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import {
  Archive,
  Bot,
  Check,
  ChevronRight,
  UploadCloud,
  X,
  FileText,
  Download,
  CheckCircle2,
  ScanSearch,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRetentionProfile, RetentionProfile } from '@/services/retention.service';
import axios from 'axios';

type SignatureCheck = {
  present: boolean;
  confidence?: number;
  evidence?: string;
};

type RetentionOCRResult = {
  format_valid: boolean;
  is_match: boolean;
  accepted: boolean;

  detected_document_type?: string;
  validation_reason?: string;
  error_message?: string;

  signature_checks: {
    parent_guardian: SignatureCheck;
    applicant: SignatureCheck;
    faculty_leader: SignatureCheck;
  };
};

export default function RetentionPage() {
  const router = useRouter();

  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quản lý các bước trong form
  const [currentStep, setCurrentStep] =
    useState<1 | 2 | 3 | 4 | 5>(1);

  const [profile, setProfile] =
    useState<RetentionProfile | null>(null);

  // Thêm state này
  const [profileError, setProfileError] =
    useState<string>("");

  // State: Bước 1 - Form khai báo & File minh chứng
  const [formData, setFormData] = useState({
    reason: "",
    duration: "",
    attachmentNote: "",
  });

  const [evidenceFile, setEvidenceFile] =
    useState<File | null>(null);

  const evidenceFileRef =
    useRef<HTMLInputElement>(null);

  // State: Bước 2 - Tải đơn
  const [downloadState, setDownloadState] =
    useState<
      "idle" | "downloading" | "downloaded"
    >("idle");

  // State: Bước 3 - Upload đơn đã ký & AI quét
  const [docFile, setDocFile] =
    useState<File | null>(null);

  const docFileRef =
    useRef<HTMLInputElement>(null);

  const [scanState, setScanState] =
    useState<
      "idle" | "scanning" | "success" | "error"
    >("idle");

const [aiResult, setAiResult] =
  useState<RetentionOCRResult | null>(null);

const [scanErrorType, setScanErrorType] =
  useState<"document" | "signature" | null>(
    null
  );

  const chatEndRef =
    useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, profile, currentStep, downloadState, scanState]);

// Load dữ liệu sinh viên khi bắt đầu thủ tục
useEffect(() => {
  if (!isStarted) return;

  setIsLoading(true);
  setProfileError("");

  getRetentionProfile()
    .then((data) => {
      setProfile(data);
    })
    .catch((error) => {
      console.error(
        "Lỗi khi lấy dữ liệu sinh viên:",
        error
      );

      setProfile(null);

      setProfileError(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin sinh viên."
      );
    })
    .finally(() => {
      setIsLoading(false);
    });
}, [isStarted]);

  // --- Handlers Bước 1 ---
  const handleStart = () => setIsStarted(true);
  const handleCancel = () => router.push('/student/dashboard');
  const handleInputChange = (field: keyof typeof formData, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setEvidenceFile(e.target.files[0]);
  };
  const removeEvidence = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEvidenceFile(null);
    if (evidenceFileRef.current) evidenceFileRef.current.value = '';
  };
  const handleSubmitForm = () => setCurrentStep(2);

  // --- Handlers Bước 2 ---
  const handleDownloadDoc = async () => {
  if (downloadState === "downloading") return;

  try {
    setDownloadState("downloading");

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      throw new Error(
        "Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại."
      );
    }



    const reason = formData.reason.trim();
    const duration = formData.duration.trim();
    const attachmentNote =
      formData.attachmentNote.trim();

    if (!reason) {
      throw new Error("Vui lòng chọn lý do xin nghỉ học.");
    }

    if (!duration) {
      throw new Error("Vui lòng chọn thời gian bảo lưu.");
    }

    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000/api"
    ).replace(/\/$/, "");

    const response = await fetch(
      `${apiBase}/documents/retention/download/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          duration,
          attachment_note: attachmentNote,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => null);

      const missingFields: string[] =
        errorData?.missing_fields ?? [];

      if (missingFields.length > 0) {
        throw new Error(
          `Thiếu thông tin: ${missingFields.join(", ")}`
        );
      }

      throw new Error(
        errorData?.reason ||
          errorData?.duration ||
          errorData?.message ||
          errorData?.detail ||
          "Không thể tạo đơn xin nghỉ học tạm thời."
      );
    }

    const fileBlob = await response.blob();
    const downloadUrl =
      window.URL.createObjectURL(fileBlob);

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = profile?.studentId
      ? `Don_xin_nghi_hoc_tam_thoi_${profile.studentId}.docx`
      : "Don_xin_nghi_hoc_tam_thoi.docx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    setDownloadState("downloaded");
  } catch (error) {
    console.error("Lỗi tải đơn bảo lưu:", error);

    setDownloadState("idle");

    alert(
      error instanceof Error
        ? error.message
        : "Không thể tải đơn xin nghỉ học tạm thời."
    );
  }
};

  const handleContinueToUpload = () => setCurrentStep(3);

  // --- Handlers Bước 3 ---
  const handleDocFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  setDocFile(file);
  setScanState("scanning");
  setScanErrorType(null);
  setAiResult(null);

  const emptySignatureChecks = {
    parent_guardian: {
      present: false,
    },
    applicant: {
      present: false,
    },
    faculty_leader: {
      present: false,
    },
  };

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  const allowedExtensions = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
  ];

  // Kiểm tra định dạng ngầm.
  if (!allowedExtensions.includes(extension)) {
    setAiResult({
      format_valid: false,
      is_match: false,
      accepted: false,

      validation_reason:
        "Định dạng file không hợp lệ. " +
        "Chỉ chấp nhận PDF, JPG, JPEG hoặc PNG.",

      signature_checks:
        emptySignatureChecks,
    });

    setScanErrorType("document");
    setScanState("error");
    return;
  }

  const accessToken =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access");

  if (!accessToken) {
    setScanState("idle");

    alert(
      "Phiên đăng nhập đã hết hạn. " +
      "Vui lòng đăng nhập lại."
    );

    router.push("/login");
    return;
  }

  const uploadData = new FormData();

  uploadData.append(
    "uploaded_file",
    file
  );

  uploadData.append(
    "document_type",
    "RETENTION_SIGNED_APPLICATION"
  );

  const configuredApi =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const apiBase =
    configuredApi.replace(/\/$/, "");

  const ocrUrl = apiBase.endsWith("/api")
    ? `${apiBase}/ocr/verify/`
    : `${apiBase}/api/ocr/verify/`;

  try {
    const response = await axios.post(
      ocrUrl,
      uploadData,
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

    const data = response.data;

    console.log(
      "Kết quả OCR bảo lưu:",
      data
    );

    // Kiểm tra ngầm tài liệu có đúng
    // Đơn xin nghỉ học tạm thời hay không.
    const correctDocument =
      data.is_match === true &&
      data.detected_document_type ===
        "RETENTION_SIGNED_APPLICATION";

    if (!correctDocument) {
      setAiResult({
        format_valid: true,
        is_match: false,
        accepted: false,

        detected_document_type:
          data.detected_document_type,

        validation_reason:
          data.validation_reason ||
          "File tải lên không phải " +
          "Đơn xin nghỉ học tạm thời.",

        error_message:
          data.error_message,

        signature_checks:
          emptySignatureChecks,
      });

      setScanErrorType("document");
      setScanState("error");
      return;
    }

    const signatureChecks = {
      parent_guardian: {
        present:
          data.signature_checks
            ?.parent_guardian
            ?.present === true,

        confidence:
          data.signature_checks
            ?.parent_guardian
            ?.confidence,

        evidence:
          data.signature_checks
            ?.parent_guardian
            ?.evidence,
      },

      applicant: {
        present:
          data.signature_checks
            ?.applicant
            ?.present === true,

        confidence:
          data.signature_checks
            ?.applicant
            ?.confidence,

        evidence:
          data.signature_checks
            ?.applicant
            ?.evidence,
      },

      faculty_leader: {
        present: false,
        confidence: 0,
        evidence:
          "Đơn bảo lưu không yêu cầu chữ ký Lãnh đạo Khoa.",
      },
    };

    const allSignaturesPresent =
      signatureChecks.parent_guardian.present &&
      signatureChecks.applicant.present;

    const normalizedResult:
      RetentionOCRResult = {
      format_valid: true,
      is_match: true,

      accepted:
        data.accepted === true &&
        allSignaturesPresent,

      detected_document_type:
        data.detected_document_type,

      validation_reason:
        data.validation_reason,

      error_message:
        data.error_message,

      signature_checks:
        signatureChecks,
    };

    setAiResult(normalizedResult);

    if (!allSignaturesPresent) {
      setScanErrorType("signature");
      setScanState("error");
      return;
    }

    setScanErrorType(null);
    setScanState("success");
  } catch (error) {
    console.error(
      "Lỗi kiểm tra OCR bảo lưu:",
      error
    );

    let message =
      "Không thể xử lý tài liệu.";

    if (axios.isAxiosError(error)) {
      const statusCode =
        error.response?.status;

      const errorData =
        error.response?.data;

      console.error(
        "OCR retention backend response:",
        errorData
      );

      if (statusCode === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem(
          "access_token"
        );

        alert(
          "Phiên đăng nhập đã hết hạn. " +
          "Vui lòng đăng nhập lại."
        );

        router.push("/login");
        return;
      }

      message =
        errorData?.error_message ||
        errorData?.detail ||
        errorData?.validation_reason ||
        errorData?.uploaded_file?.[0] ||
        errorData?.document_type?.[0] ||
        message;
    }

    setAiResult({
      format_valid: false,
      is_match: false,
      accepted: false,
      validation_reason: message,

      signature_checks:
        emptySignatureChecks,
    });

    setScanErrorType("document");
    setScanState("error");
  } finally {
    if (docFileRef.current) {
      docFileRef.current.value = "";
    }
  }
};

const handleRetryScan = () => {
  setDocFile(null);
  setAiResult(null);
  setScanErrorType(null);
  setScanState("idle");

  setTimeout(() => {
    docFileRef.current?.click();
  }, 0);
};
  const handleContinueToPreview = () => setCurrentStep(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [requestId, setRequestId] = useState("");

  // Khóa đồng bộ để ngăn hai request được gửi gần như cùng lúc.
  // State React cập nhật bất đồng bộ nên chỉ dùng isSubmitting là chưa đủ.
  const submitLockRef = useRef(false);

  // --- Handlers Bước 4 ---
  const handleFinalSubmit = async () => {
    if (
      !docFile ||
      isSubmitting ||
      submitLockRef.current
    ) {
      return;
    }

    if (!formData.reason.trim()) {
      alert("Vui lòng chọn lý do xin nghỉ học.");
      return;
    }

    if (!formData.duration.trim()) {
      alert("Vui lòng nhập thời gian bảo lưu.");
      return;
    }

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      alert(
        "Phiên đăng nhập đã hết hạn. " +
        "Vui lòng đăng nhập lại."
      );
      router.push("/login");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000/api"
      ).replace(/\/$/, "");

      const formDataToSend = new FormData();

      formDataToSend.append("file", docFile);
      formDataToSend.append(
        "reason",
        formData.reason.trim()
      );
      formDataToSend.append(
        "duration",
        formData.duration.trim()
      );
      formDataToSend.append(
        "attachmentNote",
        formData.attachmentNote.trim()
      );

      if (evidenceFile) {
        formDataToSend.append(
          "evidence_file",
          evidenceFile
        );
      }

      const response = await axios.post(
        `${apiBase}/thoi-hoc/submit-retention/`,
        formDataToSend,
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.success === true) {
        setTrackingCode(
          response.data.trackingCode ||
          response.data.requestId ||
          ""
        );

        if (response.data.requestId) {
          setRequestId(
            String(response.data.requestId)
          );
        }

        setCurrentStep(5);
        return;
      }

      alert(
        response.data?.error ||
        response.data?.detail ||
        response.data?.message ||
        "Không thể nộp hồ sơ."
      );
    } catch (error: unknown) {
      console.error(
        "Lỗi khi nộp hồ sơ bảo lưu:",
        error
      );

      let message =
        "Có lỗi xảy ra khi nộp hồ sơ. " +
        "Vui lòng thử lại.";

      if (axios.isAxiosError(error)) {
        const statusCode =
          error.response?.status;

        const errorData =
          error.response?.data;

        console.error(
          "Mã lỗi nộp hồ sơ:",
          statusCode
        );

        console.error(
          "Phản hồi backend:",
          errorData
        );

        if (statusCode === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem(
            "access_token"
          );

          alert(
            "Phiên đăng nhập đã hết hạn. " +
            "Vui lòng đăng nhập lại."
          );

          router.push("/login");
          return;
        }

        if (
          typeof errorData === "string" &&
          errorData.includes(
            "UNIQUE constraint failed: " +
            "requests_request.student_id"
          )
        ) {
          message =
            "Bạn đã có một hồ sơ học vụ trong hệ thống. " +
            "Backend hiện chưa cho phép tạo thêm hồ sơ " +
            "cho cùng sinh viên.";
        } else {
          message =
            errorData?.error ||
            errorData?.detail ||
            errorData?.message ||
            errorData?.non_field_errors?.[0] ||
            (statusCode === 409
              ? "Bạn đã có một hồ sơ bảo lưu đang được xử lý."
              : message);
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      alert(message);
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const retentionSignatureItems = [
  {
    key: "parent_guardian",
    label: "Phụ huynh / Người giám hộ",
  },
  {
    key: "applicant",
    label: "Người làm đơn",
  },

] as const;
  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface
        title="Bảo lưu"
        description="Bảo lưu kết quả"
        Icon={Archive}
        welcomeMessage={
          <>Chào bạn, hệ thống Trường Đại học Kinh tế ghi nhận bạn đang chọn thủ tục <strong>xin nghỉ học tạm thời</strong>. Bạn có muốn bắt đầu tạo hồ sơ không?</>
        }
        welcomePrimaryLabel="Bắt đầu làm thủ tục"
        welcomeSecondaryLabel="Không, quay lại"
        onStart={handleStart}
        onCancel={handleCancel}
        isStarted={isStarted}
      >
        {isStarted && (
          <div className="flex flex-col gap-8 mt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ================= BƯỚC 1: ĐIỀN THÔNG TIN ================= */}
            {currentStep >= 1 && (
              <>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Hệ thống đã tự động trích xuất thông tin cá nhân của bạn. Vui lòng bổ sung thời gian và lý do bảo lưu. <span className="text-orange-600 font-medium">Lưu ý: Trường hợp nghỉ học vì lý do cá nhân, thủ tục này bắt buộc phải thực hiện trong 4 tuần đầu của học kỳ xin nghỉ học.</span>
                    </p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm"><Check size={18} /> Thông tin định danh</h3>
                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">Tự động điền</span>
                    </div>

                    <div className="p-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8 text-gray-500">Đang tải dữ liệu...</div>
                      ) : profile ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 mb-8">
                            <div><label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Họ và tên</label><input type="text" readOnly value={profile.fullName} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Ngày sinh</label><input type="text" readOnly value={profile.dob} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Sinh viên lớp</label><input type="text" readOnly value={profile.classId} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Mã số sinh viên</label><input type="text" readOnly value={profile.studentId} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Số điện thoại</label><input type="text" readOnly value={profile.phone} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Email</label><input type="text" readOnly value={profile.email} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-700 outline-none" /></div>
                          </div>

                          <div className="border-t border-dashed border-gray-200 mb-6 w-full"></div>

                          <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Thông tin cần khai báo</h4>
                            <div className="space-y-5">
                              <div>
                                <label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Lý do xin nghỉ <span className="text-red-500">*</span></label>
                                <select disabled={currentStep > 1} value={formData.reason} onChange={(e) => handleInputChange('reason', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white disabled:bg-gray-50">
                                  <option value="">-- Chọn lý do --</option>
                                  <option value="Cá nhân">Lý do cá nhân</option>
                                  <option value="Sức khỏe/Khác">Lý do sức khỏe / Khác</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">
                                  Thời gian bảo lưu <span className="text-red-500">*</span>
                                </label>

                                <input
                                  type="text"
                                  list="retention-duration-options"
                                  disabled={currentStep > 1}
                                  value={formData.duration}
                                  onChange={(e) =>
                                    handleInputChange("duration", e.target.value)
                                  }
                                  placeholder="Nhập hoặc chọn thời gian bảo lưu"
                                  autoComplete="off"
                                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white disabled:bg-gray-50"
                                />

                                <datalist id="retention-duration-options">
                                  <option value="1 kỳ" />
                                  <option value="2 kỳ" />
                                  <option value="3 kỳ" />
                                  <option value="4 kỳ" />
                                </datalist>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Tài liệu đính kèm (nếu có)</label>
                                <div className="flex flex-col gap-3">
                                  <input disabled={currentStep > 1} type="text" placeholder="Ghi chú thêm (VD: Giấy xác nhận bệnh viện...)" value={formData.attachmentNote} onChange={(e) => handleInputChange('attachmentNote', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white disabled:bg-gray-50" />
                                  {!evidenceFile ? (
                                    <div onClick={() => currentStep === 1 && evidenceFileRef.current?.click()} className={`border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center transition bg-white ${currentStep === 1 ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}>
                                      <UploadCloud size={28} className="text-blue-500 mb-2" />
                                      <p className="text-sm text-gray-700 font-medium mb-1">Nhấn để tải lên file minh chứng</p>
                                      <p className="text-xs text-gray-400">Bệnh án, giấy gọi NVQS...</p>
                                      <input type="file" className="hidden" ref={evidenceFileRef} onChange={handleEvidenceChange} accept=".pdf,.docx,.jpg,.png" />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={20} className="text-blue-500 shrink-0" />
                                        <span className="text-sm font-medium text-blue-700 truncate">{evidenceFile.name}</span>
                                      </div>
                                      {currentStep === 1 && (
                                        <button onClick={removeEvidence} className="text-blue-400 hover:text-red-500 p-1"><X size={18} /></button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {currentStep === 1 && (
                            <button onClick={handleSubmitForm} disabled={!formData.reason || !formData.duration} className={`w-full py-3 rounded-md font-medium transition flex justify-center items-center gap-2 mt-4 ${formData.reason && formData.duration ? 'bg-[#0070F4] text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-default'}`}>
                              Lưu thông tin & Khởi tạo đơn <ChevronRight size={18} />
                            </button>
                          )}
                        </>
                      ) : profileError ? (
                        <div className="p-6 text-center text-red-600">
                          {profileError}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          Không tìm thấy thông tin sinh viên.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= BƯỚC 2: HƯỚNG DẪN KÝ & TẢI ĐƠN ================= */}
            {currentStep >= 2 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Tuyệt vời! Thông tin hợp lệ. Hệ thống đã tạo xong <strong>Đơn xin nghỉ học tạm thời</strong>. Để tiếp tục, bạn vui lòng tải đơn này về và xin đầy đủ chữ ký xác nhận nhé.</p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-5">Hướng dẫn xin chữ ký</h4>
                    <div className="flex flex-col gap-6 relative">
                      {/* Line connecting steps */}
                      <div className="absolute left-[15px] top-[24px] bottom-[24px] w-[2px] bg-gray-100 z-0"></div>

                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                        <div>
                          <h5 className="font-bold text-gray-800 text-sm">Tải và kiểm tra file</h5>
                          <p className="text-xs text-gray-500 mt-1">Tải file Word bên dưới và xem lại thông tin đã được điền sẵn.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <div>
                          <h5 className="font-bold text-gray-800 text-sm">Ký tên người làm đơn</h5>
                          <p className="text-xs text-gray-500 mt-1">Ký và ghi rõ họ tên tại mục "Người làm đơn".</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <div>
                          <h5 className="font-bold text-gray-800 text-sm">Xin chữ ký xác nhận</h5>
                          <p className="text-xs text-gray-500 mt-1">Xin đủ chữ ký tại mục "Ý kiến của phụ huynh".</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadDoc}
                    disabled={downloadState === "downloading"}
                    className={`w-full py-3.5 rounded-lg font-medium transition flex justify-center items-center gap-2 text-sm ${
                      downloadState === "downloading"
                        ? "bg-blue-600 text-white opacity-80 cursor-not-allowed"
                        : "bg-[#0070F4] text-white hover:bg-blue-700 shadow-sm"
                    }`}
                  >
                    {downloadState === "downloading" ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Đang tạo đơn...
                      </span>
                    ) : (
                      <>
                        <Download size={18} />
                        Tải xuống Đơn xin nghỉ học tạm thời (.docx)
                      </>
                    )}
                  </button>

                  {downloadState === 'downloaded' && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg py-3 px-4 flex items-center gap-2 text-sm font-medium animate-in fade-in">
                      <CheckCircle2 size={18} className="text-green-600" /> Don_xin_nghi_hoc_tam_thoi.docx đã tải xuống
                    </div>
                  )}

                  {downloadState === 'downloaded' && currentStep === 2 && (
                    <div className="mt-2 animate-in fade-in slide-in-from-bottom-4">
                      <button
                        type="button"
                        onClick={handleContinueToUpload}
                        className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm shadow-sm"
                      >
                        Tiếp tục tải lên hồ sơ đã ký
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ================= BƯỚC 3: UPLOAD & QUÉT AI ================= */}
            {currentStep >= 3 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 mt-4">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Chào mừng bạn quay lại! Hãy tải lên bản scan/chụp của <strong>Đơn xin nghỉ học tạm thời đã có đầy đủ chữ ký</strong> để hệ thống kiểm tra nhé.</p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {/* Input luôn tồn tại để nút thử lại hoạt động */}
                  <input
                    type="file"
                    className="hidden"
                    ref={docFileRef}
                    onChange={handleDocFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={currentStep > 3}
                  />

                  {/* Chưa chọn tài liệu */}
                  {scanState === "idle" && (
                    <div
                      onClick={() => {
                        if (currentStep === 3) {
                          docFileRef.current?.click();
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition bg-white shadow-sm ${
                        currentStep === 3
                          ? "border-gray-300 cursor-pointer hover:bg-gray-50"
                          : "border-gray-200 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3">
                        <UploadCloud size={24} />
                      </div>

                      <p className="font-semibold text-gray-800 text-sm mb-1">
                        Tải lên Đơn xin nghỉ học tạm thời đã ký
                      </p>

                      <p className="text-xs text-gray-400 mb-4">
                        Chấp nhận PDF, JPG, JPEG hoặc PNG
                      </p>

                      <button
                        type="button"
                        disabled={currentStep > 3}
                        className="bg-white border border-gray-200 rounded-md px-5 py-2 text-sm font-medium text-gray-600 shadow-sm disabled:opacity-50"
                      >
                        Chọn file
                      </button>
                    </div>
                  )}

                  {/* Đang phân tích */}
                  {scanState === "scanning" && (
                    <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 text-[#0070F4] font-bold text-sm mb-4">
                        <ScanSearch
                          size={20}
                          className="animate-pulse"
                        />

                        AI đang kiểm tra tài liệu...
                      </div>

                      <div className="space-y-3 ml-2">
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Kiểm tra ngầm định dạng và loại đơn
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#0070F4]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Quét vùng Phụ huynh / Người giám hộ
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#0070F4]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Quét vùng Người làm đơn
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sai định dạng hoặc sai loại tài liệu */}
                  {scanState === "error" &&
                    scanErrorType === "document" && (
                      <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                        <div className="flex gap-3 items-start">
                          <div className="bg-red-500 text-white rounded-full p-1">
                            <X
                              size={20}
                              strokeWidth={3}
                            />
                          </div>

                          <div>
                            <h4 className="font-bold text-red-700">
                              Tài liệu không hợp lệ!
                            </h4>

                            <p className="text-sm text-red-600 mt-1">
                              {aiResult?.validation_reason ||
                                aiResult?.error_message ||
                                "File tải lên không phải Đơn xin nghỉ học tạm thời."}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRetryScan}
                          className="w-full mt-5 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Thử tải lại file khác
                        </button>
                      </div>
                    )}

                  {/* Đúng đơn nhưng thiếu chữ ký */}
                  {scanState === "error" &&
                    scanErrorType === "signature" &&
                    aiResult && (
                      <div className="border border-red-200 bg-red-50/50 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="bg-red-500 text-white rounded-full p-2">
                            <X
                              size={20}
                              strokeWidth={3}
                            />
                          </div>

                          <div>
                            <h4 className="font-bold text-red-700">
                              Chưa đủ chữ ký xác nhận
                            </h4>

                            <p className="text-sm text-red-600 mt-1">
                              Vui lòng bổ sung các chữ ký còn thiếu và tải lại đơn.
                            </p>
                          </div>
                        </div>

                        <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
                          {retentionSignatureItems.map(
                            (item) => {
                              const check =
                                aiResult.signature_checks[
                                  item.key
                                ];

                              return (
                                <div
                                  key={item.key}
                                  className={`w-full rounded-lg border p-4 flex flex-col items-center justify-center gap-2 ${
                                    check.present
                                      ? "bg-green-50 border-green-200"
                                      : "bg-red-50 border-red-200"
                                  }`}
                                >
                                  <User
                                    size={19}
                                    className={
                                      check.present
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  />

                                  <span
                                    className={`text-xs font-semibold text-center ${
                                      check.present
                                        ? "text-green-800"
                                        : "text-red-800"
                                    }`}
                                  >
                                    {item.label}
                                  </span>

                                  {check.present ? (
                                    <Check
                                      size={17}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <X
                                      size={17}
                                      className="text-red-600"
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleRetryScan}
                          className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Thử tải lại file khác
                        </button>
                      </div>
                    )}

                  {/* Đúng đơn và đủ hai chữ ký */}
                  {scanState === "success" &&
                    aiResult && (
                      <>
                        <div className="border border-green-200 bg-green-50/80 rounded-xl p-5 shadow-sm animate-in fade-in">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-500 text-white rounded-full p-2">
                                <Check
                                  size={20}
                                  strokeWidth={3}
                                />
                              </div>

                              <div>
                                <h4 className="font-bold text-green-700">
                                  Tài liệu hợp lệ!
                                </h4>

                                <p className="text-sm text-green-700 mt-0.5">
                                  Đủ 2 vùng chữ ký xác nhận
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                              <ScanSearch size={15} />
                              AI Vision
                            </span>
                          </div>

                          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
                            {retentionSignatureItems.map(
                              (item) => (
                                <div
                                  key={item.key}
                                  className="w-full bg-green-100/60 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                                >
                                  <span className="text-xs font-semibold text-green-800 text-center">
                                    {item.label}
                                  </span>

                                  <Check
                                    size={17}
                                    className="text-green-600"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {currentStep === 3 && (
                          <button
                            type="button"
                            onClick={handleContinueToPreview}
                            className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm shadow-sm"
                          >
                            Tiếp tục xem trước & Nộp hồ sơ
                            <ChevronRight size={18} />
                          </button>
                        )}
                      </>
                    )}
                </div>
              </>
            )}

            {/* ================= BƯỚC 4: PREVIEW ================= */}
            {currentStep >= 4 && (
              <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 mt-2">
                <div className="p-5 flex justify-between items-center border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800">Bản xem trước tổng hợp hồ sơ</h4>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">Chờ xác nhận</span>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-green-50/50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-800">Đơn xin nghỉ học tạm thời (Bản scan đã ký đủ 2 bên)</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 font-bold">
                      AI xác nhận <Check size={14} strokeWidth={3} />
                    </span>
                  </div>

                  {currentStep === 4 && (
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className={`w-full py-3.5 rounded-lg font-medium transition flex justify-center items-center gap-2 mt-2 shadow-sm text-sm ${isSubmitting ? 'bg-blue-600 text-white opacity-80 cursor-not-allowed' : 'bg-[#0070F4] text-white hover:bg-blue-700'}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Đang nộp hồ sơ...
                        </span>
                      ) : (
                        <>
                          <Check size={18} /> Nộp hồ sơ về Phòng Đào tạo
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 5: SUCCESS & TRACKING ================= */}
            {currentStep >= 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Hồ sơ xin nghỉ học tạm thời của bạn đã được gửi thành công đến hệ thống tiếp nhận của Phòng Đào tạo! Bạn có thể xem lại hoặc theo dõi tiến trình xử lý tại trang chi tiết hồ sơ.</p>
                  </div>
                </div>

                {/* Banner */}
                <div className="ml-12 border border-green-200 bg-green-50 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 text-white rounded-full p-2"><Check size={24} /></div>
                    <div>
                      <h3 className="font-bold text-green-700 text-base">Nộp hồ sơ thành công!</h3>
                      <p className="text-green-600 text-xs mt-0.5">Quyết định bảo lưu sẽ được cấp sau khi Ban Giám hiệu phê duyệt.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Mã hồ sơ</p>
                    <p className="text-green-800 font-bold text-base">{trackingCode}</p>
                  </div>
                </div>

                {/* Chi tiết hồ sơ */}
                <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-gray-200 p-4">
                    <h4 className="font-bold text-gray-800 text-center text-sm">Xem chi tiết hồ sơ</h4>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Mã hồ sơ</p>
                        <p className="font-bold text-gray-800 text-lg">{trackingCode}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          Thời gian nộp: {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} — {new Date().toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className="bg-[#0070F4] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        Chờ xử lý
                      </span>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-6"></div>

                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">THÔNG TIN SINH VIÊN & NỘI DUNG BẢO LƯU</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Người làm đơn</p>
                          <p className="font-semibold text-gray-800 text-sm">{profile?.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Mã số sinh viên</p>
                          <p className="font-semibold text-gray-800 text-sm">{profile?.studentId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Lớp sinh viên</p>
                          <p className="font-semibold text-gray-800 text-sm">{profile?.classId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Lý do xin nghỉ</p>
                          <p className="font-semibold text-gray-800 text-sm">{formData.reason}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Thời gian bảo lưu</p>
                          <p className="font-semibold text-gray-800 text-sm">{formData.duration}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-6"></div>

                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">MINH CHỨNG & DỮ LIỆU ĐÍNH KÈM</h5>
                      <div className="border border-gray-100 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <FileText size={20} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Đơn xin nghỉ học tạm thời (Bản scan/ảnh chụp)</p>
                            <p className="text-xs text-green-600 font-medium mt-1">AI đã kiểm duyệt đủ chữ ký: Phụ huynh / Người giám hộ và Người làm đơn</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <button 
                        onClick={() => router.push(requestId ? `/student/submissions/${requestId}` : '/student/submissions')} 
                        className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-sm text-sm"
                      >
                        Xem chi tiết hồ sơ
                      </button>
                    </div>
                  </div>
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