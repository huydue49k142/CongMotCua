"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { LogOut, Bot, AlertTriangle, Download, CheckCircle2, ChevronRight, UploadCloud, Scan, Check, FileText, X, ScanSearch, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStudentProfile, StudentProfile, DropoutFormData } from '@/services/dropout.service';
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

const DROPOUT_REASON_LABELS: Record<string, string> = {
  ca_nhan: "Lý do cá nhân",
  kinh_te: "Lý do kinh tế / gia đình",
  suc_khoe: "Lý do sức khỏe",
  chuyen_truong: "Chuyển sang trường khác",
  khac: "Lý do khác",
};

const getDropoutReasonLabel = (reason: string): string => {
  const normalizedReason = reason.trim();

  return (
    DROPOUT_REASON_LABELS[normalizedReason] ||
    normalizedReason ||
    "Chưa khai báo"
  );
};

type SignatureCheck = {
  present: boolean;
  confidence?: number;
  evidence?: string;
};

type DropoutOCRResult = {
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

type DropoutDraftData = {
  isAgreed: boolean;
  isDownloaded: boolean;
  uploadState: "idle" | "analyzing" | "success" | "error";
  uploadErrorType: "document" | "signature" | null;
  aiResult: DropoutOCRResult | null;
  formData: DropoutFormData;
  requestId: string | null;
  trackingCode: string;
  hasSavedDraft: boolean;
  uploadedFileName: string | null;
  signedApplicationDocumentId: string | null;
};

type StudentRequestListItem = {
  id: string;
  request_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value.trim());

export default function DropoutPage() {
  const router = useRouter();
    
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isAgreed, setIsAgreed] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [signedApplicationFile, setSignedApplicationFile] = useState<File | null>(null);
  const [
    signedApplicationDocument,
    setSignedApplicationDocument,
  ] = useState<ProcedureDraftDocument | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "analyzing" | "success" | "error"
  >("idle");
  const [aiResult, setAiResult] = useState<DropoutOCRResult | null>(null);
  const [uploadErrorType, setUploadErrorType] = useState<
    "document" | "signature" | null
  >(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isOpeningDetail, setIsOpeningDetail] = useState(false);
  
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<DropoutFormData>({
    reason: '',
    expectedDate: '',
    contactAddress: '',
    notes: ''
  });

  const dropoutReasonLabel = getDropoutReasonLabel(
    formData.reason
  );

  const restoreDropoutDraft = useCallback(
    (draft: {
      is_started: boolean;
      current_step: number;
      draft_data?: Partial<DropoutDraftData>;
    }) => {
      const savedData = draft.draft_data || {};

      setIsStarted(draft.is_started === true);
      setIsAgreed(savedData.isAgreed ?? false);
      setIsDownloaded(
        savedData.isDownloaded ??
          Number(draft.current_step) >= 3
      );
      setFormData(
        savedData.formData ?? {
          reason: "",
          expectedDate: "",
          contactAddress: "",
          notes: "",
        }
      );
      setRequestId(savedData.requestId ?? null);
      setTrackingCode(savedData.trackingCode ?? "");
      setHasSavedDraft(savedData.hasSavedDraft ?? false);

      const normalizedStep = Math.min(
        Math.max(Number(draft.current_step) || 1, 1),
        6
      ) as 1 | 2 | 3 | 4 | 5 | 6;

      /*
       * Đối tượng File của trình duyệt không thể lưu trong JSON.
       * Nội dung file thật sẽ được lấy lại từ ProcedureDraftDocument.
       */
      setSignedApplicationFile(null);
      setCurrentStep(normalizedStep);

      if (
        normalizedStep >= 5 ||
        savedData.uploadState === "success"
      ) {
        setUploadState("success");
        setUploadErrorType(null);
        setAiResult(savedData.aiResult ?? null);
        return;
      }

      setUploadState(
        savedData.uploadState === "analyzing"
          ? "idle"
          : savedData.uploadState ?? "idle"
      );
      setUploadErrorType(
        savedData.uploadErrorType ?? null
      );
      setAiResult(savedData.aiResult ?? null);
    },
    []
  );

  const dropoutDraftData = useMemo<DropoutDraftData>(
    () => ({
      isAgreed,
      isDownloaded,
      uploadState,
      uploadErrorType,
      aiResult,
      formData,
      requestId,
      trackingCode,
      hasSavedDraft,
      uploadedFileName:
        signedApplicationFile?.name ??
        signedApplicationDocument?.original_name ??
        null,
      signedApplicationDocumentId:
        signedApplicationDocument?.id ?? null,
    }),
    [
      isAgreed,
      isDownloaded,
      uploadState,
      uploadErrorType,
      aiResult,
      formData,
      requestId,
      trackingCode,
      hasSavedDraft,
      signedApplicationFile,
      signedApplicationDocument,
    ]
  );

  const { isDraftLoaded } =
    usePersistentProcedureDraft<DropoutDraftData>({
      requestType: "DROPOUT",
      isStarted,
      currentStep,
      draftData: dropoutDraftData,
      restore: restoreDropoutDraft,
    });

  useEffect(() => {
    if (!isDraftLoaded || !isStarted) {
      return;
    }

    let cancelled = false;

    const loadDraftDocuments = async () => {
      try {
        const documents =
          await listProcedureDraftDocuments(
            "DROPOUT"
          );

        if (cancelled) {
          return;
        }

        const savedSignedApplication =
          documents.find(
            (document) =>
              document.document_key ===
              "DROPOUT_SIGNED_APPLICATION"
          ) ?? null;

        setSignedApplicationDocument(
          savedSignedApplication
        );
      } catch (error) {
        console.error(
          "Không thể tải tài liệu thôi học:",
          error
        );
      }
    };

    void loadDraftDocuments();

    return () => {
      cancelled = true;
    };
  }, [
    isDraftLoaded,
    isStarted,
  ]);

  useEffect(() => {
    if (isStarted) {
      setIsLoading(true);
      getStudentProfile()
        .then((data: StudentProfile) => {
          setStudentProfile(data);
        })
        .catch((error: any) => {
          console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isStarted]);


  // Cuộn xuống cuối mỗi khi chuyển sang bước mới
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep]);

  const handleStart = () => setIsStarted(true);
  const handleCancel = () => router.push('/student/dashboard');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: DropoutFormData) => ({ ...prev, [name]: value }));
  };




  const handleSaveDraft = async () => {
    if (isSavingDraft) return;

    try {
      setIsSavingDraft(true);

      await saveProcedureDraft<DropoutDraftData>(
        "DROPOUT",
        {
          isStarted: true,
          currentStep: 3,
          draftData: {
            ...dropoutDraftData,
            hasSavedDraft: true,
          },
        }
      );

      setHasSavedDraft(true);
      setToastMessage({
        type: "success",
        text:
          "Đã lưu bản nháp thành công. Bạn có thể đăng xuất và quay lại tiếp tục sau.",
      });
    } catch (error: unknown) {
      console.error(
        "Lỗi lưu bản nháp thôi học:",
        error
      );

      let message =
        "Có lỗi xảy ra khi lưu bản nháp.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setToastMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsSavingDraft(false);

      window.setTimeout(
        () => setToastMessage(null),
        3500
      );
    }
  };

  const handleContinueDraft = () => {
    setHasSavedDraft(false);
    setUploadState("idle");
    setCurrentStep(4);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleConfirmTerms = () => {
    if (!isAgreed) return;
    setCurrentStep(3);
  };

 const handleDownloadDoc = async () => {
  try {
    setIsLoading(true);
    setIsDownloaded(false);

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      throw new Error(
        "Phiên đăng nhập không tồn tại. Vui lòng đăng nhập lại."
      );
    }

    // formData lưu mã như "kinh_te"; khi hiển thị và tạo đơn
    // phải chuyển sang nhãn tiếng Việt.
    const reasonCode = formData.reason.trim();

    if (!reasonCode) {
      throw new Error(
        "Vui lòng nhập lý do thôi học trước khi tải đơn."
      );
    }

    const reasonLabel = getDropoutReasonLabel(
      reasonCode
    );

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const response = await fetch(
      `${apiUrl}/api/documents/dropout/download/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reasonLabel,
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
          `Thiếu thông tin: ${missingFields.join(", ")}`
        );
      }

      let errorMessage =
        errorData?.message ||
        errorData?.detail ||
        "Không thể tạo đơn xin thôi học.";

      if (errorData?.reason) {
        errorMessage = Array.isArray(errorData.reason)
          ? errorData.reason.join(", ")
          : errorData.reason;
      }

      throw new Error(errorMessage);
    }

    const fileBlob = await response.blob();
    const downloadUrl =
      window.URL.createObjectURL(fileBlob);

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = studentProfile?.studentId
      ? `Don_xin_thoi_hoc_${studentProfile.studentId}.docx`
      : "Don_xin_thoi_hoc.docx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    setIsDownloaded(true);
  } catch (error) {
    console.error(
      "Lỗi tải đơn xin thôi học:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Không thể tải đơn xin thôi học."
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleNextToUpload = () => {
    setCurrentStep(4);
    setUploadState('idle');
  };

  const triggerFileInput = () => {
    if (currentStep > 4) return; // Không cho click lại nếu đã qua bước này
    fileInputRef.current?.click();
  };

  const handleRetryUpload = () => {
    setAiResult(null);
    setUploadErrorType(null);
    setUploadState("idle");
    setSignedApplicationFile(null);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadState("analyzing");
    setUploadErrorType(null);
    setAiResult(null);
    setSignedApplicationFile(null);

    const emptySignatureChecks = {
      parent_guardian: { present: false },
      applicant: { present: false },
      faculty_leader: { present: false },
    };

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];

    // Kiểm tra định dạng chạy ngầm. Chỉ hiện thông báo khi sai.
    if (!allowedExtensions.includes(extension)) {
      setAiResult({
        format_valid: false,
        is_match: false,
        accepted: false,
        validation_reason:
          "Định dạng file không hợp lệ. Chỉ chấp nhận PDF, JPG, JPEG hoặc PNG.",
        signature_checks: emptySignatureChecks,
      });
      setUploadErrorType("document");
      setUploadState("error");
      return;
    }

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      setUploadState("idle");
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      router.push("/login");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("uploaded_file", file);
    uploadData.append(
      "document_type",
      "DROPOUT_SIGNED_APPLICATION"
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

      console.log("Kết quả OCR thôi học:", data);

      // Kiểm tra loại tài liệu chạy ngầm.
      const correctDocument =
        data.is_match === true &&
        data.detected_document_type ===
          "DROPOUT_SIGNED_APPLICATION";

      if (!correctDocument) {
        setAiResult({
          format_valid: true,
          is_match: false,
          accepted: false,
          detected_document_type:
            data.detected_document_type,
          validation_reason:
            data.validation_reason ||
            "File tải lên không phải Đơn xin thôi học.",
          error_message: data.error_message,
          signature_checks: emptySignatureChecks,
        });
        setUploadErrorType("document");
        setUploadState("error");
        return;
      }

      const signatureChecks = {
  parent_guardian: {
    present:
      data.signature_checks?.parent_guardian
        ?.present === true,
    confidence:
      data.signature_checks?.parent_guardian
        ?.confidence,
    evidence:
      data.signature_checks?.parent_guardian
        ?.evidence,
  },

  applicant: {
    present:
      data.signature_checks?.applicant
        ?.present === true,
    confidence:
      data.signature_checks?.applicant
        ?.confidence,
    evidence:
      data.signature_checks?.applicant
        ?.evidence,
  },

  faculty_leader: {
    present: false,
    confidence: 0,
    evidence:
      "Đơn thôi học không yêu cầu chữ ký Lãnh đạo Khoa.",
  },
};

      const allSignaturesPresent =
        signatureChecks.parent_guardian.present &&
        signatureChecks.applicant.present;

      const normalizedResult: DropoutOCRResult = {
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
        signature_checks: signatureChecks,
      };

      setAiResult(normalizedResult);

      if (!allSignaturesPresent) {
        setUploadErrorType("signature");
        setUploadState("error");
        return;
      }

      const savedDocument =
        await uploadProcedureDraftDocument(
          "DROPOUT",
          "DROPOUT_SIGNED_APPLICATION",
          file
        );

      setSignedApplicationFile(file);
      setSignedApplicationDocument(
        savedDocument
      );
      setUploadErrorType(null);
      setUploadState("success");

      try {
        await saveProcedureDraft<DropoutDraftData>(
          "DROPOUT",
          {
            isStarted: true,
            currentStep: 4,
            draftData: {
              ...dropoutDraftData,
              uploadState: "success",
              uploadErrorType: null,
              aiResult: normalizedResult,
              uploadedFileName:
                savedDocument.original_name,
              signedApplicationDocumentId:
                savedDocument.id,
            },
          }
        );
      } catch (draftError) {
        console.error(
          "Không thể lưu bước tải đơn thôi học:",
          draftError
        );
      }
    } catch (error) {
      console.error("Lỗi kiểm tra OCR:", error);

      let message = "Không thể xử lý tài liệu.";

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        if (statusCode === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh");
          localStorage.removeItem("refresh_token");

          alert(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
          router.push("/login");
          return;
        }

        console.error(
          "OCR backend response:",
          errorData
        );

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
        signature_checks: emptySignatureChecks,
      });
      setUploadErrorType("document");
      setUploadState("error");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenSignedApplication = async () => {
    if (signedApplicationFile) {
      const previewUrl =
        window.URL.createObjectURL(
          signedApplicationFile
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

    if (!signedApplicationDocument) {
      alert(
        "Không tìm thấy Đơn xin thôi học đã ký trên hệ thống. " +
        "Vui lòng quay lại bước tải file và chọn lại tài liệu."
      );
      return;
    }

    try {
      await openProcedureDraftDocument(
        signedApplicationDocument
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Không thể mở đơn thôi học đã ký."
      );
    }
  };

  const handlePreviewBeforeSubmit = async () => {
    if (
      !signedApplicationFile &&
      !signedApplicationDocument
    ) {
      alert(
        "Không tìm thấy Đơn xin thôi học đã ký. " +
        "Vui lòng tải lại tài liệu."
      );
      return;
    }

    const nextDraftData: DropoutDraftData = {
      ...dropoutDraftData,
      uploadState: "success",
      uploadErrorType: null,
      uploadedFileName:
        signedApplicationFile?.name ??
        signedApplicationDocument?.original_name ??
        null,
      signedApplicationDocumentId:
        signedApplicationDocument?.id ?? null,
    };

    try {
      await saveProcedureDraft<DropoutDraftData>(
        "DROPOUT",
        {
          isStarted: true,
          currentStep: 5,
          draftData: nextDraftData,
        }
      );
    } catch (error) {
      console.error(
        "Không thể lưu bước xem trước thôi học:",
        error
      );
    }

    setCurrentStep(5);
  };

  const getApiBase = () => {
    const configuredApi = (
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000/api"
    ).replace(/\/$/, "");

    return configuredApi.endsWith("/api")
      ? configuredApi
      : `${configuredApi}/api`;
  };

  const getAccessToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("access");

  const findLatestSubmittedDropoutRequestId = async (): Promise<
    string | null
  > => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      return null;
    }

    const response = await fetch(`${getApiBase()}/requests/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.detail ||
          errorData?.error ||
          "Không thể tìm hồ sơ Thôi học đã nộp."
      );
    }

    const payload = await response.json();
    const items: StudentRequestListItem[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : [];

    const dropoutRequest = items.find(
      (item) =>
        item.request_type === "DROPOUT" &&
        item.status !== "DRAFT" &&
        isUuid(item.id)
    );

    return dropoutRequest?.id ?? null;
  };

  const isValidDropoutRequestId = async (
    candidate: unknown
  ): Promise<boolean> => {
    if (!isUuid(candidate)) {
      return false;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch(
        `${getApiBase()}/requests/${candidate.trim()}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      return data?.request_type === "DROPOUT";
    } catch (error) {
      console.error(
        "Không thể kiểm tra requestId Thôi học:",
        error
      );

      return false;
    }
  };

  const resolveDropoutRequestId = async (
    responseData?: any
  ): Promise<string | null> => {
    const candidates = [
      responseData?.requestId,
      responseData?.request_id,
      responseData?.request?.id,
      responseData?.data?.requestId,
      responseData?.data?.request_id,
      responseData?.data?.request?.id,
      requestId,
    ];

    /*
     * Không chỉ kiểm tra đúng định dạng UUID.
     * UUID cũ trong bản nháp có thể đã bị xóa,
     * thuộc hồ sơ cũ hoặc không thuộc tài khoản hiện tại.
     */
    for (const candidate of candidates) {
      if (await isValidDropoutRequestId(candidate)) {
        return String(candidate).trim();
      }
    }

    /*
     * Không có ID hợp lệ thì lấy hồ sơ Thôi học
     * mới nhất trong danh sách hồ sơ của sinh viên.
     */
    return findLatestSubmittedDropoutRequestId();
  };

  const handleOpenRequestDetail = async () => {
    if (isOpeningDetail) {
      return;
    }

    try {
      setIsOpeningDetail(true);

      const resolvedRequestId = await resolveDropoutRequestId();

      if (!resolvedRequestId) {
        setToastMessage({
          type: "error",
          text:
            "Không tìm thấy hồ sơ Thôi học đã nộp. Vui lòng kiểm tra trong mục Hồ sơ đã gửi.",
        });
        return;
      }

      if (resolvedRequestId !== requestId) {
        setRequestId(resolvedRequestId);

        try {
          await saveProcedureDraft<DropoutDraftData>(
            "DROPOUT",
            {
              isStarted: true,
              currentStep: 6,
              draftData: {
                ...dropoutDraftData,
                requestId: resolvedRequestId,
                trackingCode,
                hasSavedDraft: true,
              },
            }
          );
        } catch (draftError) {
          console.error(
            "Không thể cập nhật requestId trong bản nháp:",
            draftError
          );
        }
      }

      router.push(`/student/submissions/${resolvedRequestId}`);
    } catch (error) {
      console.error("Lỗi mở chi tiết hồ sơ Thôi học:", error);

      setToastMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể mở chi tiết hồ sơ Thôi học.",
      });
    } finally {
      setIsOpeningDetail(false);
    }
  };

  const handleSubmitFinal = async () => {
    if (
      !signedApplicationFile &&
      !signedApplicationDocument
    ) {
      alert(
        "Vui lòng tải lên Đơn xin thôi học đã ký " +
        "và chờ AI xác nhận hợp lệ."
      );
      return;
    }

    try {
      setIsLoading(true);

      const accessToken = getAccessToken();

      if (!accessToken) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        router.push("/login");
        return;
      }

      const apiBase = getApiBase();

      let documentToSubmit =
        signedApplicationDocument;

      if (
        !signedApplicationFile &&
        !documentToSubmit
      ) {
        const documents =
          await listProcedureDraftDocuments(
            "DROPOUT"
          );

        documentToSubmit =
          documents.find(
            (document) =>
              document.document_key ===
              "DROPOUT_SIGNED_APPLICATION"
          ) ?? null;

        setSignedApplicationDocument(
          documentToSubmit
        );
      }

      const fileToSubmit =
        signedApplicationFile ??
        (
          documentToSubmit
            ? await fetchProcedureDraftDocumentAsFile(
                documentToSubmit
              )
            : null
        );

      if (!fileToSubmit) {
        alert(
          "Không tìm thấy Đơn xin thôi học đã ký để nộp."
        );
        return;
      }

      const submitData = new FormData();

      submitData.append(
        "file",
        fileToSubmit
      );

      submitData.append(
        "reason",
        formData.reason
      );

      submitData.append(
        "expectedDate",
        formData.expectedDate || ""
      );

      submitData.append(
        "contactAddress",
        formData.contactAddress || ""
      );

      submitData.append(
        "notes",
        formData.notes || ""
      );

      const response = await fetch(
        `${apiBase}/thoi-hoc/submit-dropout/`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
          body: submitData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        alert(data?.error || data?.detail || "Có lỗi xảy ra khi nộp hồ sơ.");
        return;
      }

      const returnedRequestId = await resolveDropoutRequestId(data);
      const returnedTrackingCode =
        data.trackingCode ||
        data.requestCode ||
        data.request_code ||
        data.data?.trackingCode ||
        data.data?.requestCode ||
        data.data?.request_code ||
        "";

      setRequestId(returnedRequestId);
      setTrackingCode(returnedTrackingCode);
      setCurrentStep(6);

      /*
       * Giữ lại màn hình hoàn tất sau khi đổi tab,
       * tải lại trang hoặc đăng nhập lại.
       */
      try {
        await saveProcedureDraft<DropoutDraftData>(
          "DROPOUT",
          {
            isStarted: true,
            currentStep: 6,
            draftData: {
              ...dropoutDraftData,
              requestId: returnedRequestId,
              trackingCode: returnedTrackingCode,
              hasSavedDraft: true,
              uploadState: "success",
              uploadErrorType: null,
              aiResult,
              uploadedFileName:
                signedApplicationFile?.name ??
                signedApplicationDocument?.original_name ??
                null,
              signedApplicationDocumentId:
                signedApplicationDocument?.id ?? null,
            },
          }
        );
      } catch (draftError) {
        console.error(
          "Không thể lưu trạng thái hoàn tất:",
          draftError
        );
      }
    } catch (error) {
      console.error("Lỗi khi nộp hồ sơ:", error);
      alert("Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const signatureItems = [
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
            Đang khôi phục thủ tục thôi học...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ChatInterface
        title="Thôi học"
        description="Thôi học tự nguyện"
        Icon={LogOut}
        welcomeMessage={
          <>Chào bạn, hệ thống Trường Đại học Kinh tế ghi nhận bạn đang chọn thủ tục <strong>Xin thôi học</strong>. Bạn có muốn bắt đầu tạo hồ sơ không?</>
        } 
        welcomePrimaryLabel="Bắt đầu làm thủ tục"
        welcomeSecondaryLabel="Không, quay lại"
        onStart={handleStart}
        onCancel={handleCancel}
        isStarted={isStarted}
      >
        {isStarted && (
          <div className="flex flex-col gap-8 mt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- BƯỚC 1: NHẬP FORM --- */}
            {currentStep >= 1 && (
              <>
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                    <Bot size={24} />
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">
                      Hệ thống đã tự động trích xuất thông tin cá nhân của bạn. Vui lòng bổ sung lý do và thông tin cần thiết để hệ thống khởi tạo đơn.
                    </p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-6">
                  <form onSubmit={handleSubmitForm} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                        Thông tin sinh viên
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Tự động điền</span>
                    </div>

                    <div className="p-5">
                      {isLoading ? (
                        <div className="flex justify-center py-8 text-gray-500">Đang tải dữ liệu...</div>
                      ) : studentProfile ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Họ và tên</label><input type="text" readOnly value={studentProfile.fullName} className="w-full bg-slate-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Ngày sinh</label><input type="text" readOnly value={studentProfile.dob} className="w-full bg-slate-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Mã số sinh viên</label><input type="text" readOnly value={studentProfile.studentId} className="w-full bg-slate-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Sinh viên lớp</label><input type="text" readOnly value={studentProfile.classId} className="w-full bg-slate-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Ngành học</label><input type="text" readOnly value={studentProfile.major} className="w-full bg-slate-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1.5">Khóa tuyển</label><input type="text" readOnly value={studentProfile.batch} className="w-full bg-slate-50 border border-gray-200 rounded-md p-2.5 text-sm text-gray-700 outline-none" /></div>
                          </div>

                          <div className="h-px bg-gray-200 mb-6 w-full"></div>

                          <div>
                            <h4 className="font-semibold text-gray-700 text-sm mb-4">THÔNG TIN KHAI BÁO</h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do xin thôi học <span className="text-red-500">*</span></label>
                                {currentStep === 1 ? (
                                  <select name="reason" required className="w-full border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" value={formData.reason} onChange={handleInputChange}>
                                    <option value="">-- Chọn lý do --</option>
                                    <option value="ca_nhan">Lý do cá nhân</option>
                                    <option value="kinh_te">Lý do kinh tế / gia đình</option>
                                    <option value="suc_khoe">Lý do sức khỏe</option>
                                    <option value="chuyen_truong">Chuyển sang trường khác</option>
                                    <option value="khac">Lý do khác</option>
                                  </select>
                                ) : (
                                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800">{dropoutReasonLabel}</div>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày dự kiến thôi học <span className="text-red-500">*</span></label>
                                {currentStep === 1 ? (
                                  <input type="date" name="expectedDate" required className="w-full border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" value={formData.expectedDate} onChange={handleInputChange} />
                                ) : (
                                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800">{formData.expectedDate}</div>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ liên hệ sau khi thôi học <span className="text-red-500">*</span></label>
                                {currentStep === 1 ? (
                                  <input type="text" name="contactAddress" required placeholder="VD: 123 Nguyễn Văn Linh, Đà Nẵng" className="w-full border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" value={formData.contactAddress} onChange={handleInputChange} />
                                ) : (
                                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800">{formData.contactAddress}</div>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú thêm (nếu có)</label>
                                {currentStep === 1 ? (
                                  <textarea name="notes" rows={3} placeholder="VD: Đề nghị xem xét hoàn trả học phí học kỳ hiện tại..." className="w-full border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white" value={formData.notes} onChange={handleInputChange} />
                                ) : (
                                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800 min-h-[80px]">{formData.notes || 'Không có ghi chú'}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {currentStep === 1 && (
                            <button type="submit" className="w-full mt-6 bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center">
                              Lưu thông tin và Tiếp tục
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* --- BƯỚC 2: XÁC NHẬN ĐIỀU KHOẢN --- */}
            {currentStep >= 2 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                    <Bot size={24} />
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">
                      Trước khi khởi tạo đơn, hệ thống cần bạn xác nhận đã hiểu rõ các điều khoản liên quan đến thủ tục thôi học.
                    </p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                    <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center gap-2">
                      <AlertTriangle className="text-red-500" size={18} />
                      <h3 className="font-semibold text-red-600 text-sm">Điều khoản cần xác nhận</h3>
                    </div>
                    
                    <div className="p-5 space-y-4 text-sm text-gray-700">
                      <div className="flex gap-3 items-start"><span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-xs shrink-0">1</span><p>Quyết định thôi học có hiệu lực pháp lý và không thể thu hồi sau khi Ban Giám hiệu phê duyệt.</p></div>
                      <div className="flex gap-3 items-start"><span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-xs shrink-0">2</span><p>Mọi kết quả học tập, điểm số và tín chỉ tích lũy sẽ không được bảo lưu sau khi thôi học.</p></div>
                      <div className="flex gap-3 items-start"><span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-xs shrink-0">3</span><p>Học phí đã đóng cho học kỳ hiện tại sẽ được xem xét hoàn trả theo quy định của Nhà trường.</p></div>
                      <div className="flex gap-3 items-start"><span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-xs shrink-0">4</span><p>Sinh viên có trách nhiệm hoàn thành các nghĩa vụ tài chính (nếu còn nợ học phí) trước khi nộp đơn.</p></div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" disabled={currentStep > 2} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                          <span className={`font-medium ${currentStep > 2 ? 'text-gray-400' : ''}`}>Tôi đã đọc, hiểu rõ và đồng ý với các điều khoản trên. Tôi xác nhận muốn tiến hành thủ tục xin thôi học.</span>
                        </label>
                      </div>
                    </div>

                    {currentStep === 2 && (
                      <div className="p-5 bg-gray-50 border-t border-gray-100">
                        <button onClick={handleConfirmTerms} disabled={!isAgreed} className={`w-full py-3 rounded-md font-medium transition flex justify-center items-center gap-2 ${isAgreed ? 'bg-[#0070F4] text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                          Xác nhận & Khởi tạo đơn <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* --- BƯỚC 3: TẢI ĐƠN VÀ HƯỚNG DẪN --- */}
            {currentStep >= 3 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                    <Bot size={24} />
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">
                      Hệ thống đã tạo xong <strong>Đơn xin thôi học</strong> với đầy đủ thông tin của bạn. Vui lòng tải về, ký tên và xin chữ ký xác nhận theo hướng dẫn bên dưới nhé.
                    </p>
                  </div>
                </div>

                <div className="ml-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-800 mb-4">Hướng dẫn hoàn thiện đơn</h4>
                    <div className="space-y-4">
                      <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-xs shrink-0">1</span><div><p className="font-medium text-sm text-gray-800">Tải và kiểm tra</p><p className="text-xs text-gray-500 mt-0.5">Tải file Word bên dưới. Thông tin cá nhân, lý do và ngày thôi học đã được điền sẵn.</p></div></div>
                      <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-xs shrink-0">2</span><div><p className="font-medium text-sm text-gray-800">Ký tên sinh viên</p><p className="text-xs text-gray-500 mt-0.5">Ký và ghi rõ họ tên tại mục "Người làm đơn".</p></div></div>
                      <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-xs shrink-0">3</span><div><p className="font-medium text-sm text-gray-800">Ý kiến phụ huynh</p><p className="text-xs text-gray-500 mt-0.5">Xin chữ ký xác nhận của Phụ huynh / Người giám hộ tại mục tương ứng.</p></div></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Luôn cho phép tải đơn bất kể bước nào */}
                    <button onClick={handleDownloadDoc} className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2">
                      <Download size={18} /> Tải xuống Đơn xin thôi học (.docx)
                    </button>

                    {isDownloaded && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col gap-5 mt-2">
                        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md py-3 px-4 flex items-center gap-2 text-sm font-medium">
                          <CheckCircle2 size={18} className="text-green-600" /> Don_xin_thoi_hoc.docx đã tải xuống
                        </div>

                        {currentStep === 3 && (
                          hasSavedDraft ? (
                            <button
                              type="button"
                              onClick={handleContinueDraft}
                              className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
                            >
                              Tiếp tục
                              <ChevronRight size={18} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={handleNextToUpload}
                                className="flex-1 bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
                              >
                                Tiếp tục tải lên hồ sơ đã ký
                                <ChevronRight size={18} />
                              </button>

                              <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={isSavingDraft}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap px-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSavingDraft
                                  ? "Đang lưu..."
                                  : "Lưu nháp và tạm dừng"}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* --- BƯỚC 4: TẢI LÊN & AI OCR --- */}
            {currentStep >= 4 && (
              <>
                <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                    <Bot size={24} />
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">
                      Trợ lý AI
                    </p>
                    <p className="text-gray-600 text-sm">
                      Bạn đã xin đủ chữ ký? Tuyệt vời! Hãy tải lên bản scan hoặc
                      chụp ảnh rõ nét của đơn để hệ thống kiểm tra nhé.
                    </p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {/* Input luôn tồn tại để nút "Thử tải lại" có thể mở lại hộp chọn file. */}
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={currentStep > 4}
                  />

                  {uploadState === "idle" && (
                    <div
                      onClick={triggerFileInput}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition ${
                        currentStep === 4
                          ? "border-blue-300 bg-blue-50/50 cursor-pointer hover:bg-blue-50"
                          : "border-gray-200 bg-gray-50 opacity-60 cursor-default"
                      }`}
                    >
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3">
                        <UploadCloud size={24} />
                      </div>

                      <p className="font-semibold text-gray-800 text-sm">
                        Tải lên file Đơn xin thôi học đã ký đủ hai bên
                      </p>

                      <p className="text-xs text-gray-500 mt-1.5 mb-4">
                        Kéo thả hoặc click để chọn file (.pdf, .jpg, .jpeg hoặc
                        .png)
                      </p>

                      <button
                        type="button"
                        disabled={currentStep > 4}
                        className="bg-white border border-gray-300 rounded-md px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
                      >
                        Chọn file
                      </button>
                    </div>
                  )}

                  {uploadState === "analyzing" && (
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 text-blue-700 font-semibold text-sm mb-3">
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
                          Quét vùng chữ ký Phụ huynh / Người giám hộ
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#0070F4]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Quét vùng chữ ký Người làm đơn
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sai định dạng hoặc sai loại đơn: chỉ hiển thị thông báo. */}
                  {uploadState === "error" &&
                    uploadErrorType === "document" && (
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
                                "File tải lên không phải Đơn xin thôi học."}
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

                  {/* Đúng đơn nhưng thiếu chữ ký: hiển thị hai vùng chữ ký. */}
                  {uploadState === "error" &&
                    uploadErrorType === "signature" &&
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
                              Vui lòng bổ sung các chữ ký còn thiếu và tải lại
                              đơn.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {signatureItems.map((item) => {
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

                  {/* Thành công: chỉ hiển thị hai vùng chữ ký. */}
                  {uploadState === "success" && aiResult && (
                    <>
                      <div className="border border-green-200 bg-green-50/80 rounded-xl p-5 shadow-sm animate-in fade-in">
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
                            <Scan size={15} />
                            AI Vision
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {signatureItems.map((item) => (
                            <div
                              key={item.key}
                              className="bg-green-100/60 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                            >
                              <span className="text-xs font-semibold text-green-800 text-center">
                                {item.label}
                              </span>
                              <Check
                                className="text-green-600"
                                size={17}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {currentStep === 4 && (
                        <button
                          type="button"
                          onClick={handlePreviewBeforeSubmit}
                          className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-2"
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

            {/* --- BƯỚC 5: PREVIEW --- */}
            {currentStep >= 5 && studentProfile && (
              <div className="ml-12 border border-gray-200 rounded-xl p-5 bg-white mt-2 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <h4 className="font-semibold text-gray-800">Bộ hồ sơ chuẩn bị nộp</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${currentStep === 6 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {currentStep === 6 ? 'Đã nộp' : 'Chờ xác nhận'}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={
                    handleOpenSignedApplication
                  }
                  className="w-full flex items-center justify-between gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200 mb-5 text-left hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer"
                  title="Nhấn để mở bản scan đã ký trong tab mới"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText
                      size={18}
                      className="text-blue-500 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700">
                        Đơn xin thôi học
                        (Bản scan đã ký đủ 2 bên)
                      </p>

                      <p className="text-xs text-blue-600 mt-1 truncate">
                        {signedApplicationFile?.name ||
                          signedApplicationDocument?.original_name ||
                          "Nhấn để xem file đã ký"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                    AI xác nhận
                    <Check size={14} />
                  </span>
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                  <div className="flex justify-between md:flex-col md:gap-1 border-b md:border-none border-gray-100 pb-2 md:pb-0"><span className="text-gray-500">Sinh viên:</span> <span className="font-semibold text-gray-800">{studentProfile.fullName}</span></div>
                  <div className="flex justify-between md:flex-col md:gap-1 border-b md:border-none border-gray-100 pb-2 md:pb-0"><span className="text-gray-500">MSSV:</span> <span className="font-semibold text-gray-800">{studentProfile.studentId}</span></div>
                  <div className="flex justify-between md:flex-col md:gap-1 border-b md:border-none border-gray-100 pb-2 md:pb-0"><span className="text-gray-500">Lý do:</span> <span className="font-semibold text-gray-800">{dropoutReasonLabel}</span></div>
                  <div className="flex justify-between md:flex-col md:gap-1"><span className="text-gray-500">Ngày dự kiến:</span> <span className="font-semibold text-gray-800">{formData.expectedDate}</span></div>
                </div>

                {currentStep === 5 && (
                  <button onClick={handleSubmitFinal} className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-sm">
                    <CheckCircle2 size={18} /> Nộp toàn bộ hồ sơ
                  </button>
                )}
              </div>
            )}

            {/* --- BƯỚC 6: SUCCESS & ĐIỀU HƯỚNG --- */}
            {currentStep >= 6 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0">
                    <Bot size={24} />
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">
                      Trợ lý AI
                    </p>
                    <p className="text-gray-600 text-sm">
                      Hồ sơ xin thôi học của bạn đã được gửi thành công đến hệ thống tiếp nhận của Phòng Đào tạo. Bạn có thể xem chi tiết và theo dõi tiến trình xử lý tại trang hồ sơ.
                    </p>
                  </div>
                </div>

                {/* Banner */}
                <div className="ml-12 border border-green-200 bg-green-50 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 text-white rounded-full p-2"><Check size={24} /></div>
                    <div>
                      <h3 className="font-bold text-green-700 text-base">Nộp hồ sơ thành công!</h3>
                      <p className="text-green-600 text-xs mt-0.5">Quyết định thôi học sẽ được cấp sau khi Ban Giám hiệu phê duyệt.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Mã hồ sơ</p>
                    <p className="text-green-800 font-bold text-base">{trackingCode || requestId || 'Đang cập nhật'}</p>
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
                        <p className="font-bold text-gray-800 text-lg">{trackingCode || requestId || 'Đang cập nhật'}</p>
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
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">THÔNG TIN SINH VIÊN & NỘI DUNG THÔI HỌC</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Người làm đơn</p>
                          <p className="font-semibold text-gray-800 text-sm">{studentProfile?.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Mã số sinh viên</p>
                          <p className="font-semibold text-gray-800 text-sm">{studentProfile?.studentId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Lớp sinh viên</p>
                          <p className="font-semibold text-gray-800 text-sm">{studentProfile?.classId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Lý do thôi học</p>
                          <p className="font-semibold text-gray-800 text-sm">{dropoutReasonLabel}</p>
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
                            <p className="text-sm font-medium text-gray-800">Đơn xin thôi học (Bản scan/ảnh chụp)</p>
                            <p className="text-xs text-green-600 font-medium mt-1">AI đã kiểm duyệt đủ chữ ký: Phụ huynh / Người giám hộ và Người làm đơn</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={handleOpenRequestDetail}
                        disabled={isOpeningDetail}
                        className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isOpeningDetail ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Đang mở hồ sơ...
                          </>
                        ) : (
                          <>
                            <FileText size={18} />
                            Xem chi tiết và Theo dõi trạng thái
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Div dùng để cuộn màn hình xuống cuối tự động */}
            <div ref={chatEndRef} />
          </div>
        )}
      </ChatInterface>

      {toastMessage && (
        <div
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300"
          style={{
            backgroundColor:
              toastMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${
              toastMessage.type === 'success' ? '#10B981' : '#EF4444'
            }`,
          }}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          ) : (
            <AlertCircle className="h-5 w-5 text-[#EF4444]" />
          )}

          <span
            className={`text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'text-[#065F46]'
                : 'text-[#991B1B]'
            }`}
          >
            {toastMessage.text}
          </span>

          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className={`ml-4 ${
              toastMessage.type === 'success'
                ? 'text-[#065F46]'
                : 'text-[#991B1B]'
            } hover:opacity-70 transition-opacity`}
          >
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}