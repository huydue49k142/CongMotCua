"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import {
  PlayCircle,
  Bot,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Download,
  UploadCloud,
  FileText,
  CheckCircle2,
  LayoutList,
  ScanSearch,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getResumeProfile,
  ResumeProfile,
  submitResumeApplication,
} from '@/services/resume.service';
import axios from 'axios';
import { usePersistentProcedureDraft } from "@/hooks/usePersistentProcedureDraft";
import {
  fetchProcedureDraftDocumentAsFile,
  listProcedureDraftDocuments,
  openProcedureDraftDocument,
  ProcedureDraftDocument,
  saveProcedureDraft,
  uploadProcedureDraftDocument,
} from "@/services/procedure-draft.service";

interface CourseForm {
  id: number;
  code: string;
  name: string;
  credits: string;
}

type SignatureCheck = {
  present: boolean;
  confidence?: number;
  evidence?: string;
};

type ResumeOCRResult = {
  format_valid: boolean;
  is_match: boolean;
  accepted: boolean;
  detected_document_type?: string;
  validation_reason?: string;
  error_message?: string;
  extracted_fields?: Record<string, unknown>;
  signature_checks: {
    parent_guardian: SignatureCheck;
    applicant: SignatureCheck;
    faculty_leader: SignatureCheck;
  };
};

type ResumeDraftData = {
  courses: CourseForm[];
  downloadState: "idle" | "downloading" | "downloaded";
  showUploadAI: boolean;
  scanState: "idle" | "scanning" | "success" | "error";
  scanErrorType: "document" | "signature" | null;
  aiResult: ResumeOCRResult | null;
  trackingCode: string;
  requestId: string;
  uploadedFileName: string | null;
  uploadedDocumentId: string | null;
};
const MOCK_COURSES = [
  { code: "", name: "", credits: "" },
  { code: "CS101", name: "Nhập môn lập trình", credits: "3" },
  { code: "MATH101", name: "Giải tích 1", credits: "3" },
  { code: "PHYS101", name: "Vật lý đại cương", credits: "2" },
  { code: "ENG101", name: "Tiếng Anh 1", credits: "4" },
  { code: "CS201", name: "Cấu trúc dữ liệu và giải thuật", credits: "3" },
];

export default function ResumePage() {
  const router = useRouter();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  
  const [courses, setCourses] = useState<CourseForm[]>([
    {
      id: 1,
      code: "",
      name: "",
      credits: "",
    },
  ]);

  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'downloaded'>('idle');
  const [showUploadAI, setShowUploadAI] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] =
    useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] =
    useState<ProcedureDraftDocument | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanErrorType, setScanErrorType] = useState<'document' | 'signature' | null>(null);
  const [aiResult, setAiResult] = useState<ResumeOCRResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const submitLockRef = useRef(false);


  const restoreResumeDraft = useCallback(
    (draft: {
      is_started: boolean;
      current_step: number;
      draft_data?: Partial<ResumeDraftData>;
    }) => {
      const savedData = draft.draft_data || {};

      setIsStarted(draft.is_started === true);

      if (
        Array.isArray(savedData.courses) &&
        savedData.courses.length > 0
      ) {
        setCourses(savedData.courses);
      }

      setTrackingCode(savedData.trackingCode ?? "");
      setRequestId(savedData.requestId ?? "");
      setUploadedFileName(
        savedData.uploadedFileName ?? null
      );

      const normalizedStep = Math.min(
        Math.max(Number(draft.current_step) || 1, 1),
        5
      ) as 1 | 2 | 3 | 4 | 5;

      setCurrentStep(normalizedStep);

      const restoredDownloadState =
        normalizedStep >= 3
          ? "downloaded"
          : savedData.downloadState === "downloading"
            ? "idle"
            : savedData.downloadState ?? "idle";

      setDownloadState(restoredDownloadState);
      setShowUploadAI(
        normalizedStep >= 3 ||
          savedData.showUploadAI === true
      );

      /*
       * Đối tượng File không thể lưu vào JSON.
       * Nội dung file thật sẽ được khôi phục từ backend
       * thông qua ProcedureDraftDocument.
       */
      setUploadedFile(null);

      setScanState(
        savedData.scanState === "scanning"
          ? "idle"
          : savedData.scanState ?? "idle"
      );
      setScanErrorType(
        savedData.scanErrorType ?? null
      );
      setAiResult(savedData.aiResult ?? null);
    },
    []
  );

  const resumeDraftData = useMemo<ResumeDraftData>(
    () => ({
      courses,
      downloadState,
      showUploadAI,
      scanState,
      scanErrorType,
      aiResult,
      trackingCode,
      requestId,
      uploadedFileName:
        uploadedFile?.name ??
        uploadedFileName,
      uploadedDocumentId:
        uploadedDocument?.id ?? null,
    }),
    [
      courses,
      downloadState,
      showUploadAI,
      scanState,
      scanErrorType,
      aiResult,
      trackingCode,
      requestId,
      uploadedFile,
      uploadedFileName,
      uploadedDocument,
    ]
  );

  const { isDraftLoaded } =
    usePersistentProcedureDraft<ResumeDraftData>({
      requestType: "RESUME_STUDIES",
      isStarted,
      currentStep,
      draftData: resumeDraftData,
      restore: restoreResumeDraft,
    });

  /*
   * Sau khi khôi phục bản nháp, tải lại tài liệu thật từ backend.
   * Nhờ vậy người dùng có thể mở file và tiếp tục nộp hồ sơ
   * sau khi F5, đổi thủ tục hoặc đăng nhập lại.
   */
  useEffect(() => {
    if (
      !isDraftLoaded ||
      !isStarted ||
      currentStep < 3
    ) {
      return;
    }

    let cancelled = false;

    const loadSignedDocument = async () => {
      try {
        const documents =
          await listProcedureDraftDocuments(
            "RESUME_STUDIES"
          );

        if (cancelled) {
          return;
        }

        const signedDocument =
          documents.find(
            (document) =>
              document.document_key ===
              "RESUME_SIGNED_APPLICATION"
          ) ?? null;

        setUploadedDocument(signedDocument);

        if (signedDocument) {
          setUploadedFileName(
            signedDocument.original_name
          );

          /*
           * Nếu bản nháp đang ở bước xem trước thì giữ nguyên
           * bước 4 và khôi phục trạng thái OCR hợp lệ.
           */
          if (currentStep >= 4) {
            setScanState("success");
            setScanErrorType(null);
          }
        } else if (currentStep === 4) {
          /*
           * Không còn file thật thì không thể nộp ở bước 4.
           * Quay lại bước 3 để người dùng tải lại.
           */
          setCurrentStep(3);
          setScanState("idle");
          setScanErrorType(null);
          setAiResult(null);
        }
      } catch (error) {
        console.error(
          "Không thể tải tài liệu Học tiếp:",
          error
        );
      }
    };

    void loadSignedDocument();

    return () => {
      cancelled = true;
    };
  }, [
    isDraftLoaded,
    isStarted,
    currentStep,
  ]);


  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, currentStep, courses.length, downloadState, showUploadAI, scanState]);

  useEffect(() => {
    if (isStarted) {
      setIsLoading(true);
      getResumeProfile()
        .then((data) => setProfile(data))
        .catch((error) => console.error('Lỗi khi lấy dữ liệu sinh viên:', error))
        .finally(() => setIsLoading(false));
    }
  }, [isStarted]);

  const handleStart = () => setIsStarted(true);
  const handleCancel = () => router.push('/student/dashboard');

  const handleConfirmProfile = () => setCurrentStep(2);

  // Chuẩn hóa MSSV trước khi đối chiếu OCR với dữ liệu tài khoản.
  const normalizeStudentId = (value: unknown): string => {
    return String(value ?? "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
  };

  /*
   * Nếu sinh viên sửa danh sách học phần sau khi đã tạo/tải đơn,
   * đơn cũ và kết quả OCR không còn khớp với dữ liệu mới.
   * Tự đưa quy trình về bước 2 để tạo/tải lại đơn, không cần nút Chỉnh sửa.
   */
  const invalidateGeneratedResumeAfterCourseEdit = () => {
    if (currentStep >= 3 && currentStep < 5) {
      setDownloadState("idle");
      setShowUploadAI(false);
      setUploadedFile(null);
      setUploadedFileName(null);
      setUploadedDocument(null);
      setScanState("idle");
      setScanErrorType(null);
      setAiResult(null);
      setCurrentStep(2);
    }
  };

  const handleAddCourse = () => {
    setCourses((previous) => [
      ...previous,
      { id: Date.now(), code: '', name: '', credits: '' },
    ]);

    invalidateGeneratedResumeAfterCourseEdit();
  };

  const handleRemoveCourse = (id: number) => {
    if (courses.length <= 1) return;

    setCourses((previous) =>
      previous.filter((course) => course.id !== id)
    );

    invalidateGeneratedResumeAfterCourseEdit();
  };

  const handleChangeCourse = (
    id: number,
    field: keyof CourseForm,
    value: string
  ) => {
    setCourses((previous) =>
      previous.map((course) => {
        if (course.id === id) {
          const updatedCourse = { ...course, [field]: value };

          if (field === 'code') {
            const selectedMock = MOCK_COURSES.find(
              (item) => item.code === value
            );

            if (selectedMock) {
              updatedCourse.name = selectedMock.name;
              updatedCourse.credits = selectedMock.credits;
            } else {
              updatedCourse.name = '';
              updatedCourse.credits = '';
            }
          }

          return updatedCourse;
        }

        return course;
      })
    );

    invalidateGeneratedResumeAfterCourseEdit();
  };

  const handleSubmitCourses = () => {
  if (completedCourseCount === 0) {
    alert("Vui lòng nhập ít nhất một học phần.");
    return;
  }

  const hasIncompleteCourse = courses.some(
      (course) =>
        course.code.trim() === "" ||
        course.name.trim() === "" ||
        course.credits.trim() === ""
    );

    if (hasIncompleteCourse) {
      alert(
        "Vui lòng nhập đầy đủ mã học phần, tên học phần và số tín chỉ."
      );
      return;
    }

    setCurrentStep(3);
  };

  // LOGIC ĐÃ SỬA: Tải đơn thật
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
          "Phiên đăng nhập không tồn tại. " +
          "Vui lòng đăng nhập lại."
        );
      }

      if (!profile) {
        throw new Error(
          "Chưa tải được thông tin sinh viên " +
          "và hồ sơ bảo lưu."
        );
      }

      const decisionNumber = String(
        profile.reservedDecisionNo || "1284"
      ).trim();

      const reservedDate = String(
        profile.reservedDate || ""
      ).trim();

      if (!reservedDate) {
        throw new Error(
          "Không tìm thấy ngày quyết định bảo lưu."
        );
      }

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000/api"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${apiBase}/documents/resume/download/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            decision_number: decisionNumber,
            reserved_date: reservedDate,
            phone: profile.phone,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        const missingFields: string[] =
          errorData?.missing_fields ?? [];

        if (
          Array.isArray(missingFields) &&
          missingFields.length > 0
        ) {
          throw new Error(
            `Thiếu thông tin: ${
              missingFields.join(", ")
            }`
          );
        }

        let errorMessage =
          errorData?.message ||
          errorData?.detail ||
          "Không thể tạo đơn xin trở lại học tập.";

        if (errorData?.reserved_date) {
          errorMessage = Array.isArray(
            errorData.reserved_date
          )
            ? errorData.reserved_date.join(", ")
            : errorData.reserved_date;
        }

        throw new Error(errorMessage);
      }

      const fileBlob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(fileBlob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download = profile.studentId
        ? `Don_xin_tro_lai_hoc_tap_${profile.studentId}.docx`
        : "Don_xin_tro_lai_hoc_tap.docx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setDownloadState("downloaded");

      setTimeout(() => {
        setShowUploadAI(true);
      }, 1000);
    } catch (error) {
      console.error(
        "Lỗi tải đơn xin trở lại học tập:",
        error
      );

      setDownloadState("idle");

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải đơn xin trở lại học tập."
      );
    }
  };

  const triggerFileInput = () => {
    if (currentStep !== 3 || scanState === "scanning") return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadedFile(file);
    setScanState("scanning");
    setScanErrorType(null);
    setAiResult(null);

    const emptySignatureChecks = {
      parent_guardian: { present: false },
      applicant: { present: false },
      faculty_leader: { present: false },
    };

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "";

    const allowedExtensions = [
      "pdf",
      "png",
      "jpg",
      "jpeg",
    ];

    // Kiểm tra định dạng ngầm ở frontend.
    if (!allowedExtensions.includes(extension)) {
      setAiResult({
        format_valid: false,
        is_match: false,
        accepted: false,
        validation_reason:
          "Định dạng file không hợp lệ. " +
          "Chỉ chấp nhận PDF, JPG, JPEG hoặc PNG.",
        signature_checks: emptySignatureChecks,
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

    uploadData.append("uploaded_file", file);
    uploadData.append(
      "document_type",
      "RESUME_SIGNED_APPLICATION"
    );

    const configuredApi =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const apiBase = configuredApi.replace(/\/$/, "");

    const ocrUrl = apiBase.endsWith("/api")
      ? `${apiBase}/ocr/verify/`
      : `${apiBase}/api/ocr/verify/`;

    try {
      const response = await axios.post(
        ocrUrl,
        uploadData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;

      console.log("Kết quả OCR học tiếp:", data);

      // Kiểm tra ngầm đúng loại Đơn xin trở lại học tập.
      const correctDocument =
        data.is_match === true &&
        data.detected_document_type ===
          "RESUME_SIGNED_APPLICATION";

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
              "Đơn xin trở lại học tập.",
          error_message: data.error_message,
          extracted_fields: data.extracted_fields,
          signature_checks: emptySignatureChecks,
        });

        setScanErrorType("document");
        setScanState("error");
        return;
      }

      /*
       * Đối chiếu MSSV trên Đơn xin trở lại học tập đã ký
       * với MSSV chính chủ lấy từ CSDL của tài khoản đang đăng nhập.
       * Sai/không đọc được MSSV chỉ hiện popup riêng, không hiển thị
       * khối "Tài liệu không hợp lệ" vì file vẫn có thể đúng loại đơn.
       */
      const extractedStudentId =
        normalizeStudentId(
          data.extracted_fields?.student_id
        );

      let expectedStudentId =
        normalizeStudentId(
          profile?.studentId
        );

      // Nếu state chưa kịp tải profile thì lấy lại trực tiếp từ backend.
      if (!expectedStudentId) {
        try {
          const latestProfile =
            await getResumeProfile();

          setProfile(latestProfile);
          expectedStudentId =
            normalizeStudentId(
              latestProfile.studentId
            );
        } catch (profileError) {
          console.error(
            "Không thể lấy MSSV sinh viên để đối chiếu:",
            profileError
          );
        }
      }

      if (!expectedStudentId) {
        setAiResult(null);
        setScanErrorType(null);
        setScanState("idle");
        setUploadedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        window.alert(
          "Không xác định được mã số sinh viên của tài khoản đang đăng nhập. " +
          "Vui lòng tải lại trang hoặc đăng nhập lại."
        );

        return;
      }

      if (!extractedStudentId) {
        setAiResult(null);
        setScanErrorType(null);
        setScanState("idle");
        setUploadedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        window.alert(
          "Không đọc được mã số sinh viên trên Đơn xin trở lại học tập. " +
          "Vui lòng kiểm tra file rõ nét và tải lại."
        );

        return;
      }

      if (extractedStudentId !== expectedStudentId) {
        setAiResult(null);
        setScanErrorType(null);
        setScanState("idle");
        setUploadedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        window.alert(
          `Mã số sinh viên trên đơn (${extractedStudentId}) ` +
          `không khớp với mã số sinh viên của tài khoản ` +
          `đang đăng nhập (${expectedStudentId}).\n\n` +
          "Vui lòng tải đúng đơn của bạn."
        );

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
            "Đơn xin trở lại học tập không yêu cầu chữ ký Lãnh đạo Khoa.",
        },
      };

      const allSignaturesPresent =
        signatureChecks.parent_guardian.present &&
        signatureChecks.applicant.present;

      const normalizedResult: ResumeOCRResult = {
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
        extracted_fields:
          data.extracted_fields,
        signature_checks: signatureChecks,
      };

      setAiResult(normalizedResult);

      if (!allSignaturesPresent) {
        setScanErrorType("signature");
        setScanState("error");
        return;
      }

      /*
       * OCR hợp lệ thì lưu file thật vào backend.
       * Cùng document_key sẽ được backend cập nhật/thay thế.
       */
      const savedDocument =
        await uploadProcedureDraftDocument(
          "RESUME_STUDIES",
          "RESUME_SIGNED_APPLICATION",
          file
        );

      setUploadedDocument(savedDocument);
      setUploadedFileName(
        savedDocument.original_name
      );
      setScanErrorType(null);
      setScanState("success");

      /*
       * Ghi ngay trạng thái bước 3 để không mất tiến trình
       * khi người dùng chuyển sang thủ tục khác ngay sau upload.
       */
      try {
        await saveProcedureDraft<ResumeDraftData>(
          "RESUME_STUDIES",
          {
            isStarted: true,
            currentStep: 3,
            draftData: {
              courses,
              downloadState: "downloaded",
              showUploadAI: true,
              scanState: "success",
              scanErrorType: null,
              aiResult: normalizedResult,
              trackingCode,
              requestId,
              uploadedFileName:
                savedDocument.original_name,
              uploadedDocumentId:
                savedDocument.id,
            },
          }
        );
      } catch (draftError) {
        console.error(
          "Không thể lưu bước upload Học tiếp:",
          draftError
        );
      }
    } catch (error) {
      console.error(
        "Lỗi kiểm tra OCR học tiếp:",
        error
      );

      let message = "Không thể xử lý tài liệu.";

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        console.error(
          "OCR resume backend response:",
          errorData
        );

        if (statusCode === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("access_token");

          alert(
            "Phiên đăng nhập đã hết hạn. " +
            "Vui lòng đăng nhập lại."
          );

          router.push("/login");
          return;
        }

        message =
          errorData?.error ||
          errorData?.error_message ||
          errorData?.detail ||
          errorData?.validation_reason ||
          errorData?.uploaded_file?.[0] ||
          errorData?.document_type?.[0] ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setAiResult({
        format_valid: false,
        is_match: false,
        accepted: false,
        validation_reason: message,
        signature_checks: emptySignatureChecks,
      });

      setScanErrorType("document");
      setScanState("error");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRetryUpload = () => {
    setUploadedFile(null);
    setUploadedFileName(null);
    setUploadedDocument(null);
    setAiResult(null);
    setScanErrorType(null);
    setScanState("idle");

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleOpenUploadedApplication = async () => {
    if (uploadedFile) {
      const previewUrl =
        window.URL.createObjectURL(
          uploadedFile
        );

      const previewWindow = window.open(
        previewUrl,
        "_blank",
        "noopener,noreferrer"
      );

      if (!previewWindow) {
        window.URL.revokeObjectURL(
          previewUrl
        );

        alert(
          "Trình duyệt đang chặn tab mới. " +
          "Vui lòng cho phép pop-up cho localhost."
        );
        return;
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          previewUrl
        );
      }, 60_000);

      return;
    }

    if (uploadedDocument) {
      try {
        await openProcedureDraftDocument(
          uploadedDocument
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Không thể mở file đơn đã ký."
        );
      }
      return;
    }

    alert(
      "Không tìm thấy file đơn đã ký trên hệ thống. " +
      "Vui lòng quay lại bước tải file và chọn lại tài liệu."
    );
  };

  const handleContinueToPreview = async () => {
    if (!uploadedFile && !uploadedDocument) {
      alert(
        "Không tìm thấy Đơn xin trở lại học tập đã ký."
      );
      return;
    }

    setCurrentStep(4);

    try {
      await saveProcedureDraft<ResumeDraftData>(
        "RESUME_STUDIES",
        {
          isStarted: true,
          currentStep: 4,
          draftData: {
            ...resumeDraftData,
            downloadState: "downloaded",
            showUploadAI: true,
            scanState: "success",
            scanErrorType: null,
            uploadedFileName:
              uploadedFile?.name ||
              uploadedDocument?.original_name ||
              uploadedFileName,
            uploadedDocumentId:
              uploadedDocument?.id ?? null,
          },
        }
      );
    } catch (draftError) {
      console.error(
        "Không thể lưu bước xem trước Học tiếp:",
        draftError
      );
    }
  };

  const handleSubmitFinal = async () => {
    if (
      isSubmitting ||
      submitLockRef.current
    ) {
      return;
    }

    if (!uploadedFile && !uploadedDocument) {
      alert(
        "Vui lòng tải lên Đơn xin trở lại học tập đã ký."
      );
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      /*
       * Sau F5/đổi thủ tục, File trong React không còn.
       * Tải lại file đã lưu trên backend để tiếp tục nộp.
       */
      const fileToSubmit =
        uploadedFile ??
        (uploadedDocument
          ? await fetchProcedureDraftDocumentAsFile(
              uploadedDocument
            )
          : null);

      if (!fileToSubmit) {
        throw new Error(
          "Không thể khôi phục Đơn xin trở lại học tập đã ký."
        );
      }

      const result =
        await submitResumeApplication(
          courses,
          fileToSubmit
        );

      if (!result.success) {
        alert(
          result.error ||
          "Không thể nộp hồ sơ."
        );
        return;
      }

      const returnedRequestId =
        result.requestId
          ? String(result.requestId)
          : "";

      const returnedTrackingCode =
        result.trackingCode ||
        returnedRequestId;

      setTrackingCode(
        returnedTrackingCode
      );
      setRequestId(
        returnedRequestId
      );
      setCurrentStep(5);

      /*
       * Ghi ngay bước cuối xuống backend,
       * giống cách trang Bảo lưu đang thực hiện.
       */
      try {
        await saveProcedureDraft<ResumeDraftData>(
          "RESUME_STUDIES",
          {
            isStarted: true,
            currentStep: 5,
            draftData: {
              ...resumeDraftData,
              trackingCode:
                returnedTrackingCode,
              requestId:
                returnedRequestId,
              downloadState: "downloaded",
              showUploadAI: true,
              scanState: "success",
              scanErrorType: null,
              aiResult,
              uploadedFileName:
                fileToSubmit.name,
              uploadedDocumentId:
                uploadedDocument?.id ??
                null,
            },
          }
        );
      } catch (draftError) {
        console.error(
          "Không thể lưu trạng thái hoàn tất Học tiếp:",
          draftError
        );
      }
    } catch (error: unknown) {
      console.error(
        "Lỗi nộp hồ sơ Học tiếp:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi nộp hồ sơ."
      );
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const completedCourseCount = courses.filter(
    (course) =>
      course.code.trim() !== "" &&
      course.name.trim() !== "" &&
      course.credits.trim() !== ""
  ).length;
  const totalCredits = courses.reduce(
    (sum, course) =>
      sum + (parseInt(course.credits) || 0),
    0
  );

  const resumeSignatureItems = [
    {
      key: "parent_guardian",
      label: "Phụ huynh / Người giám hộ",
    },
    {
      key: "applicant",
      label: "Người làm đơn",
    },
  ] as const;

  if (!isDraftLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <span className="w-9 h-9 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">
            Đang khôi phục thủ tục học tiếp...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ChatInterface
        title="Học tiếp"
        description="Đăng ký học tiếp"
        Icon={PlayCircle}
        welcomeMessage={
          <>Chào bạn, hệ thống Trường Đại học Kinh tế ghi nhận bạn đang chọn thủ tục <strong>xin trở lại học tập</strong>. Bạn có muốn bắt đầu tạo hồ sơ không?</>
        }
        welcomePrimaryLabel="Bắt đầu làm thủ tục"
        welcomeSecondaryLabel="Không, quay lại"
        onStart={handleStart}
        onCancel={handleCancel}
        isStarted={isStarted}
      >
        {isStarted && (
          <div className="flex flex-col gap-8 mt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ================= BƯỚC 1: KIỂM TRA THÔNG TIN ================= */}
            {currentStep >= 1 && (
              <>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Hệ thống ghi nhận thời hạn nghỉ học tạm thời của bạn sắp kết thúc. Mình đã tổng hợp thông tin cá nhân và hồ sơ bảo lưu trước đó của bạn dưới đây. Hãy kiểm tra lại nhé.</p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-[#0070F4] flex items-center gap-2">
                        <span className="bg-[#0070F4] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><Check size={14} strokeWidth={3} /></span>
                        Thông tin sinh viên & Hồ sơ bảo lưu
                      </h3>
                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">Chỉ đọc</span>
                    </div>

                    <div className="p-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8 text-gray-500">Đang tải dữ liệu...</div>
                      ) : profile ? (
                        <>
                          <div className="mb-8">
                            <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Thông tin định danh</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                              <div><p className="text-gray-400 text-xs mb-1">Họ và tên</p><p className="font-semibold text-gray-800 text-sm">{profile.fullName}</p></div>
                              <div><p className="text-gray-400 text-xs mb-1">Ngày sinh</p><p className="font-semibold text-gray-800 text-sm">{profile.dob}</p></div>
                              <div><p className="text-gray-400 text-xs mb-1">Sinh viên lớp</p><p className="font-semibold text-gray-800 text-sm">{profile.classId}</p></div>
                              <div><p className="text-gray-400 text-xs mb-1">Mã số sinh viên</p><p className="font-semibold text-gray-800 text-sm">{profile.studentId}</p></div>
                              <div><p className="text-gray-400 text-xs mb-1">Số điện thoại</p><p className="font-semibold text-gray-800 text-sm">{profile.phone}</p></div>
                              <div><p className="text-gray-400 text-xs mb-1">Email</p><p className="font-semibold text-gray-800 text-sm">{profile.email}</p></div>
                            </div>
                          </div>
                          <div className="border-t border-dashed border-gray-200 mb-6 w-full"></div>
                          <div className="mb-6">
                            <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Thông tin hồ sơ bảo lưu</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                              <div><p className="text-gray-400 text-xs mb-1">Quyết định nghỉ học số</p><p className="font-semibold text-[#0070F4] text-sm">{profile.reservedDecisionNo}</p></div>
                              <div><p className="text-gray-400 text-xs mb-1">Ngày ban hành</p><p className="font-semibold text-gray-800 text-sm">{profile.reservedDate}</p></div>
                            </div>
                          </div>
                          <button onClick={handleConfirmProfile} disabled={currentStep > 1} className={`w-full py-3 rounded-md font-medium transition flex justify-center items-center gap-2 mt-4 ${currentStep === 1 ? 'bg-[#0070F4] text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-default'}`}>
                            Xác nhận thông tin & Tiếp tục {currentStep === 1 && <ChevronRight size={18} />}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= BƯỚC 2: NHẬP HỌC PHẦN DỰ KIẾN ================= */}
            {currentStep >= 2 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Thông tin quyết định bảo lưu đã được xác nhận. Tiếp theo, bạn vui lòng nhập danh sách các <strong>học phần dự kiến đăng ký</strong> trong học kỳ mới để Phòng Đào tạo có cơ sở xếp lớp nhé.</p>
                  </div>
                </div>

                <div className="ml-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h4 className="font-bold text-gray-800">Danh sách học phần dự kiến</h4>
                    <span className="text-xs text-gray-400">{completedCourseCount} học phần</span>
                  </div>

                  <div className="space-y-4">
                    <div className="hidden md:grid grid-cols-[1.5fr_2fr_0.5fr_40px] gap-4 px-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mã học phần</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên học phần</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Số TC</span>
                      <span></span>
                    </div>

                    {courses.map((course) => (
                      <div key={course.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_0.5fr_40px] gap-4 items-start md:items-center bg-gray-50/50 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none border border-gray-100 md:border-none">
                        <div className="md:hidden text-xs font-semibold text-gray-400 uppercase mb-1">Mã học phần</div>
                        <select 
                          value={course.code} 
                          onChange={(e) => handleChangeCourse(course.id, 'code', e.target.value)} 
                          disabled={currentStep === 5} 
                          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50"
                        >
                          <option value="" disabled>Chọn mã học phần...</option>
                          {MOCK_COURSES.filter(c => c.code).map(mock => (
                            <option key={mock.code} value={mock.code}>{mock.code}</option>
                          ))}
                        </select>
                        
                        <div className="md:hidden text-xs font-semibold text-gray-400 uppercase mt-2 mb-1">Tên học phần</div>
                        <input type="text" placeholder="VD: Giải tích 1" value={course.name} onChange={(e) => handleChangeCourse(course.id, 'name', e.target.value)} disabled={currentStep === 5} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50" />
                        
                        <div className="md:hidden text-xs font-semibold text-gray-400 uppercase mt-2 mb-1">Số TC</div>
                        <div className="flex items-center gap-4">
                          <input type="number" min="1" max="5" placeholder="3" value={course.credits} onChange={(e) => handleChangeCourse(course.id, 'credits', e.target.value)} disabled={currentStep === 5} className="w-full text-center border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50" />
                          {courses.length > 1 && currentStep < 5 && (
                            <button onClick={() => handleRemoveCourse(course.id)} className="text-red-400 hover:text-red-600 transition-colors p-2"><Trash2 size={18} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentStep < 5 && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
                      <button onClick={handleAddCourse} className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"><Plus size={16} /> Thêm học phần</button>

                      {currentStep === 2 && (
                        <button onClick={handleSubmitCourses} className="w-full md:w-auto px-6 py-2.5 bg-[#0070F4] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                          Lưu danh sách & Khởi tạo đơn <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ================= BƯỚC 3: TẢI ĐƠN & UPLOAD ================= */}
            {currentStep >= 3 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Tuyệt vời! Hệ thống đã ráp toàn bộ thông tin của bạn vào <strong>Đơn xin trở lại học tập</strong>. Để hoàn tất, bạn vui lòng tải file Word này về, ký tại mục Phụ huynh / Người giám hộ và Người làm đơn, sau đó lưu lại để tải lên hệ thống nhé.</p>
                  </div>
                </div>

                <div className="ml-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                    <h4 className="font-semibold text-gray-800 mb-5 text-sm">Hướng dẫn ký file</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                      <div className="hidden md:block absolute top-4 left-[10%] right-[10%] h-[1px] bg-gray-200 z-0"></div>
                      <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">1</span>
                        <p className="text-xs text-gray-600 font-medium">Tải file Word xuống máy tính của bạn</p>
                      </div>
                      <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">2</span>
                        <p className="text-xs text-gray-600 font-medium">Mở bằng Microsoft Word</p>
                      </div>
                      <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Xin đủ 2 chữ ký xác nhận</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Phụ huynh / Người giám hộ và Người làm đơn
                          </p>
                        </div>
                      </div>
                      <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">4</span>
                        <p className="text-xs text-gray-600 font-medium">Lưu lại file rồi tải lên ở bước tiếp theo</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownloadDoc} 
                    disabled={downloadState !== 'idle'}
                    className={`w-full py-3 rounded-md font-medium transition flex justify-center items-center gap-2 ${
                      downloadState === 'idle' 
                        ? 'bg-[#0070F4] text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-400 cursor-default'
                    }`}
                  >
                    {downloadState === 'downloading' ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></span> 
                        Đang tải xuống...
                      </span>
                    ) : (
                      <><Download size={18} /> Tải xuống Đơn xin trở lại học tập (.docx)</>
                    )}
                  </button>

                  {downloadState === 'downloaded' && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-md py-3 px-4 flex items-center gap-2 text-sm font-medium animate-in fade-in">
                      <CheckCircle2 size={18} className="text-green-600" /> Don_xin_tro_lai_hoc_tap.docx đã tải xuống
                    </div>
                  )}
                </div>

                {showUploadAI && (
                  <>
                    <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 mt-2">
                      <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0">
                        <Bot size={24} />
                      </div>

                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                        <p className="text-gray-700 font-medium text-sm mb-1">
                          Trợ lý AI
                        </p>

                        <p className="text-gray-600 text-sm">
                          Sau khi xin đủ 2 chữ ký, hãy lưu đơn thành PDF
                          hoặc chụp/scan rõ nét rồi tải lên để hệ thống kiểm tra.
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                      {/* Input luôn tồn tại để tải lại file được */}
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={currentStep > 3}
                      />

                      {scanState === "idle" && currentStep === 3 && (
                        <div
                          onClick={triggerFileInput}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition bg-white"
                        >
                          <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3">
                            <UploadCloud size={24} />
                          </div>

                          <p className="font-semibold text-gray-800 text-sm mb-1">
                            Tải lên Đơn xin trở lại học tập đã ký
                          </p>

                          <p className="text-xs text-gray-400 mb-4">
                            Chấp nhận PDF, JPG, JPEG hoặc PNG
                          </p>

                          <button
                            type="button"
                            className="bg-white border border-gray-200 rounded-md px-5 py-2 text-sm font-medium text-gray-600 shadow-sm"
                          >
                            Chọn file
                          </button>
                        </div>
                      )}

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

                      {scanState === "error" &&
                        scanErrorType === "document" && (
                          <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                            <div className="flex gap-3 items-start">
                              <div className="bg-red-500 text-white rounded-full p-1">
                                <X size={20} strokeWidth={3} />
                              </div>

                              <div>
                                <h4 className="font-bold text-red-700">
                                  Tài liệu không hợp lệ!
                                </h4>

                                <p className="text-sm text-red-600 mt-1">
                                  {aiResult?.validation_reason ||
                                    aiResult?.error_message ||
                                    "File tải lên không phải Đơn xin trở lại học tập."}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRetryUpload}
                              className="w-full mt-5 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                              Thử tải lại file khác
                            </button>
                          </div>
                        )}

                      {scanState === "error" &&
                        scanErrorType === "signature" &&
                        aiResult && (
                          <div className="border border-red-200 bg-red-50/50 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="bg-red-500 text-white rounded-full p-2">
                                <X size={20} strokeWidth={3} />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {resumeSignatureItems.map((item) => {
                                const check =
                                  aiResult.signature_checks[item.key];

                                return (
                                  <div
                                    key={item.key}
                                    className={`rounded-lg border p-4 flex flex-col items-center justify-center gap-2 ${
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
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={handleRetryUpload}
                              className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                              Thử tải lại file khác
                            </button>
                          </div>
                        )}

                      {scanState === "success" && aiResult && (
                        <>
                          <div className="border border-green-200 bg-green-50/80 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-green-500 text-white rounded-full p-2">
                                  <Check size={20} strokeWidth={3} />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {resumeSignatureItems.map((item) => (
                                <div
                                  key={item.key}
                                  className="bg-green-100/60 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                                >
                                  <span className="text-xs font-semibold text-green-800 text-center">
                                    {item.label}
                                  </span>

                                  <Check
                                    size={17}
                                    className="text-green-600"
                                  />
                                </div>
                              ))}
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
              </>
            )}

            {/* ================= BƯỚC 4: PREVIEW BỘ HỒ SƠ ================= */}
            {currentStep >= 4 && (
              <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="p-5 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800">Bộ hồ sơ chuẩn bị nộp</h4>
                </div>
                
                <div className="p-5 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={handleOpenUploadedApplication}
                    className="w-full flex items-center justify-between gap-4 bg-green-50/50 border border-green-200 p-4 rounded-lg text-left cursor-pointer hover:bg-green-50 hover:border-green-300 transition"
                    title="Nhấn để mở file đã ký trong tab mới"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={20} className="text-green-600 shrink-0" />

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          Đơn xin trở lại học tập (File sinh viên vừa tải lên)
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      AI xác nhận đủ 2 chữ ký <Check size={14} />
                    </span>
                  </button>

                  <div className="border border-blue-100 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between bg-blue-50/50 p-4 border-b border-blue-100">
                      <div className="flex items-center gap-3">
                        <LayoutList size={20} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-800">Danh sách học phần dự kiến</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Tự động</span>
                    </div>
                    
                    <div className="p-4">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                          <tr>
                            <th className="pb-2 font-medium">Mã HP</th>
                            <th className="pb-2 font-medium">Tên học phần</th>
                            <th className="pb-2 font-medium text-center">Số TC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((c, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-none">
                              <td className="py-3 text-gray-700">{c.code || '-'}</td>
                              <td className="py-3 text-gray-700">{c.name || '-'}</td>
                              <td className="py-3 text-gray-700 text-center">{c.credits || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t border-gray-200">
                          <tr>
                            <td colSpan={2} className="py-3 text-right font-medium text-gray-600">Tổng số tín chỉ:</td>
                            <td className="py-3 text-center font-bold text-gray-900">{totalCredits}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {currentStep === 4 && (
                    <button onClick={handleSubmitFinal} disabled={isSubmitting} className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-2 shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed">
                      {isSubmitting ? "Đang nộp..." : <><>Nộp hồ sơ về Phòng Đào tạo</> <ChevronRight size={18} /></>}
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
                    <p className="text-gray-600 text-sm">Hồ sơ xin trở lại học tập của bạn đã được gửi thành công đến hệ thống tiếp nhận của Phòng Đào tạo! Bạn có thể xem lại hoặc theo dõi tiến trình xử lý tại trang chi tiết hồ sơ.</p>
                  </div>
                </div>

                {/* Banner */}
                <div className="ml-12 border border-green-200 bg-green-50 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 text-white rounded-full p-2"><Check size={24} /></div>
                    <div>
                      <h3 className="font-bold text-green-700 text-base">Nộp hồ sơ thành công!</h3>
                      <p className="text-green-600 text-xs mt-0.5">Quyết định tiếp nhận học tiếp sẽ được cấp sau khi Ban Giám hiệu phê duyệt.</p>
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
                        Chờ tiếp nhận
                      </span>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-6"></div>

                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">THÔNG TIN SINH VIÊN & NỘI DUNG HỌC TIẾP</h5>
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
                          <p className="text-xs text-gray-400 mb-1">Số lượng học phần đăng ký</p>
                          <p className="font-semibold text-gray-800 text-sm">{completedCourseCount} học phần</p>
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
                            <p className="text-sm font-medium text-gray-800">Đơn xin trở lại học tập (Bản scan/ảnh chụp)</p>
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