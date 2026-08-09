"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import {
  ArrowLeftRight,
  Bot,
  CheckCircle2,
  Upload,
  Check,
  FileText,
  X,
  Download,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getMajorChangeProfile,
  MajorChangeProfile,
  getMajors,
  Major,
} from '@/services/major-change.service';
import { usePersistentProcedureDraft } from '@/hooks/usePersistentProcedureDraft';
import {
  fetchProcedureDraftDocumentAsFile,
  listProcedureDraftDocuments,
  openProcedureDraftDocument,
  ProcedureDraftDocument,
  saveProcedureDraft,
  uploadProcedureDraftDocument,
} from '@/services/procedure-draft.service';
import axios from 'axios';
import DocxPreview from '@/components/DocxPreview';

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


type SubmissionStatus =
  | "DRAFT"
  | "PENDING"
  | "PENDING_REVIEW"
  | "ADDITIONAL_INFO_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "DELETED";

type RequestHistoryItem = {
  status?: string;
  notes?: string;
  timestamp?: string;
};

type MajorChangeDraftData = {
  formData: MajorChangeProfile | null;
  studentName: string;

  file1Status: 'idle' | 'uploading' | 'done' | 'error';
  file2Status: 'idle' | 'uploading' | 'done' | 'error';
  file1Result: OCRVerifyResult | null;
  file2Result: OCRVerifyResult | null;
  file1Error: string;
  file2Error: string;

  academicChecked: boolean;
  targetMajor: string;
  hasDownloadedExcel: boolean;
  isQualified: boolean | null;
  admissionMethod: string;
  admissionScores: {
    combo: string;
    score: string;
    priority: string;
    threshold: string;
  };
  additionalInfo: {
    dob: string;
    pob: string;
    phone: string;
    cccd: string;
    issueDate: string;
    issuePlace: string;
  };
  reason: string;

  signedScanState: SignedScanState;
  signedScanErrorType: SignedScanErrorType;
  signedApplicationResult: OCRVerifyResult | null;
  downloadState: 'idle' | 'downloading' | 'downloaded';

  admissionLetterDocumentId: string | null;
  admissionLetterFileName: string | null;
  graduationCertificateDocumentId: string | null;
  graduationCertificateFileName: string | null;
  signedApplicationDocumentId: string | null;
  signedApplicationFileName: string | null;

  trackingCode: string;
  requestId: string;
  submittedAt: string;
  submissionStatus: SubmissionStatus;
  supplementNote: string;
  activeTab: 'details' | 'tracking';
};

const getSubmissionStatusMeta = (status: SubmissionStatus) => {
  switch (status) {
    case "APPROVED":
      return {
        label: "Đã duyệt",
        badgeClass: "bg-green-100 text-green-700",
        panelClass: "border-green-200 bg-green-50",
      };
    case "REJECTED":
      return {
        label: "Từ chối",
        badgeClass: "bg-red-100 text-red-700",
        panelClass: "border-red-200 bg-red-50",
      };
    case "DELETED":
      return {
        label: "Đã hủy",
        badgeClass: "bg-gray-100 text-gray-700",
        panelClass: "border-gray-200 bg-gray-50",
      };
    case "ADDITIONAL_INFO_REQUIRED":
      return {
        label: "Yêu cầu bổ sung",
        badgeClass: "bg-orange-100 text-orange-700",
        panelClass: "border-orange-200 bg-orange-50",
      };
    case "DRAFT":
      return {
        label: "Bản nháp",
        badgeClass: "bg-gray-100 text-gray-700",
        panelClass: "border-gray-200 bg-gray-50",
      };
    case "PENDING":
    default:
      return {
        label: "Chờ tiếp nhận",
        badgeClass: "bg-yellow-100 text-yellow-800",
        panelClass: "border-yellow-200 bg-yellow-50",
      };
  }
};

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
  const [officialStudentId, setOfficialStudentId] = useState<string>("");

  // Trạng thái kiểm tra học vụ (Bước 3)
  const [academicChecked, setAcademicChecked] = useState(false)
    ;

  // Trạng thái Bước 4 & 5 (Form điền thêm)
  const [majorsList, setMajorsList] = useState<Major[]>([]);
  const [targetMajor, setTargetMajor] = useState('');
  const [hasDownloadedExcel, setHasDownloadedExcel] = useState(false);
  const [targetMajorObj, setTargetMajorObj] = useState<Major | null>(null);
  const [isQualified, setIsQualified] = useState<boolean | null>(null);
  const [admissionMethod, setAdmissionMethod] = useState('Xét điểm THPT');

  const [admissionScores, setAdmissionScores] = useState({ combo: '', score: '', priority: '', threshold: '' });
  const [additionalInfo, setAdditionalInfo] = useState({ dob: '', pob: '', phone: '', cccd: '', issueDate: '', issuePlace: '' });
  const [reason, setReason] = useState('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Trạng thái nộp cuối cùng
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Giữ lại đúng các file đã qua OCR để gửi lên backend khi nộp hồ sơ.
  const [admissionLetterFile, setAdmissionLetterFile] =
    useState<File | null>(null);
  const [graduationCertificateFile, setGraduationCertificateFile] =
    useState<File | null>(null);
  const [signedApplicationFile, setSignedApplicationFile] =
    useState<File | null>(null);

  const [
    admissionLetterDocument,
    setAdmissionLetterDocument,
  ] = useState<ProcedureDraftDocument | null>(null);

  const [
    graduationCertificateDocument,
    setGraduationCertificateDocument,
  ] = useState<ProcedureDraftDocument | null>(null);

  const [
    signedApplicationDocument,
    setSignedApplicationDocument,
  ] = useState<ProcedureDraftDocument | null>(null);

  const [trackingCode, setTrackingCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("PENDING");
  const [supplementNote, setSupplementNote] = useState("");
  const [supplementFile, setSupplementFile] =
    useState<File | null>(null);
  const [isLoadingSubmission, setIsLoadingSubmission] =
    useState(false);
  const [isResubmitting, setIsResubmitting] =
    useState(false);

  const submitLockRef = useRef(false);
  // Ngăn React Strict Mode / re-render gọi API khôi phục preview nhiều lần.
  const previewRestoreAttemptedRef = useRef(false);
  const signedApplicationInputRef =
    useRef<HTMLInputElement>(null);
  const supplementInputRef =
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

  const restoreMajorChangeDraft = useCallback(
    (draft: {
      is_started: boolean;
      current_step: number;
      draft_data?: Partial<MajorChangeDraftData>;
    }) => {
      const savedData = draft.draft_data ?? {};

      setIsStarted(draft.is_started === true);
      setFormData(savedData.formData ?? null);
      setStudentName(
        savedData.studentName ||
          savedData.formData?.fullName ||
          'bạn'
      );

      setAcademicChecked(
        savedData.academicChecked ?? false
      );
      setTargetMajor(savedData.targetMajor ?? '');
      setHasDownloadedExcel(
        savedData.hasDownloadedExcel ?? false
      );
      setIsQualified(savedData.isQualified ?? null);
      setAdmissionMethod(
        savedData.admissionMethod ??
          'Xét điểm THPT'
      );
      setAdmissionScores(
        savedData.admissionScores ?? {
          combo: '',
          score: '',
          priority: '',
          threshold: '',
        }
      );
      setAdditionalInfo(
        savedData.additionalInfo ?? {
          dob: '',
          pob: '',
          phone: '',
          cccd: '',
          issueDate: '',
          issuePlace: '',
        }
      );
      setReason(savedData.reason ?? '');

      setTrackingCode(savedData.trackingCode ?? '');
      setRequestId(savedData.requestId ?? '');
      setSubmittedAt(savedData.submittedAt ?? '');
      setSubmissionStatus(
        savedData.submissionStatus ??
          'PENDING_REVIEW'
      );
      setSupplementNote(
        savedData.supplementNote ?? ''
      );
      setActiveTab(
        savedData.activeTab ?? 'details'
      );

      const normalizedStep = Math.min(
        Math.max(
          Number(draft.current_step) || 1,
          1
        ),
        7
      ) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

      /*
       * File của trình duyệt không thể lưu trong JSONField.
       * Metadata và nội dung file thật sẽ được tải lại từ
       * ProcedureDraftDocument sau khi bản nháp khôi phục.
       */
      setAdmissionLetterFile(null);
      setGraduationCertificateFile(null);
      setSignedApplicationFile(null);
      setSupplementFile(null);

      // previewUrl/previewBlob chỉ sống trong RAM của tab hiện tại,
      // nên khi khôi phục draft phải tạo lại preview từ backend.
      setPreviewUrl(null);
      setPreviewBlob(null);
      previewRestoreAttemptedRef.current = false;

      setCurrentStep(normalizedStep);

      setFile1Result(
        savedData.file1Result ?? null
      );
      setFile2Result(
        savedData.file2Result ?? null
      );
      setFile1Error(
        savedData.file1Error ?? ''
      );
      setFile2Error(
        savedData.file2Error ?? ''
      );

      setFile1Status(
        savedData.file1Status === 'uploading'
          ? 'idle'
          : savedData.file1Status ??
              (normalizedStep >= 2
                ? 'done'
                : 'idle')
      );

      setFile2Status(
        savedData.file2Status === 'uploading'
          ? 'idle'
          : savedData.file2Status ??
              (normalizedStep >= 2
                ? 'done'
                : 'idle')
      );

      const restoredSignedState =
        savedData.signedScanState ===
        'scanning'
          ? 'idle'
          : savedData.signedScanState ??
            (normalizedStep >= 7
              ? 'success'
              : 'idle');

      setSignedScanState(restoredSignedState);
      setSignedScanErrorType(
        restoredSignedState === 'success'
          ? null
          : savedData.signedScanErrorType ??
              null
      );
      setSignedApplicationResult(
        savedData.signedApplicationResult ??
          null
      );

      setDownloadState(
        normalizedStep >= 7
          ? 'downloaded'
          : savedData.downloadState ===
              'downloading'
            ? 'idle'
            : savedData.downloadState ??
              'idle'
      );
    },
    []
  );

  const majorChangeDraftData = useMemo<MajorChangeDraftData>(
    () => ({
      formData,
      studentName,

      file1Status,
      file2Status,
      file1Result,
      file2Result,
      file1Error,
      file2Error,

      academicChecked,
      targetMajor,
      hasDownloadedExcel,
      isQualified,
      admissionMethod,
      admissionScores,
      additionalInfo,
      reason,

      signedScanState,
      signedScanErrorType,
      signedApplicationResult,
      downloadState,

      admissionLetterDocumentId:
        admissionLetterDocument?.id ?? null,
      admissionLetterFileName:
        admissionLetterFile?.name ??
        admissionLetterDocument?.original_name ??
        null,
      graduationCertificateDocumentId:
        graduationCertificateDocument?.id ?? null,
      graduationCertificateFileName:
        graduationCertificateFile?.name ??
        graduationCertificateDocument?.original_name ??
        null,
      signedApplicationDocumentId:
        signedApplicationDocument?.id ?? null,
      signedApplicationFileName:
        signedApplicationFile?.name ??
        signedApplicationDocument?.original_name ??
        null,

      trackingCode,
      requestId,
      submittedAt,
      submissionStatus,
      supplementNote,
      activeTab,
    }),
    [
      formData,
      studentName,
      file1Status,
      file2Status,
      file1Result,
      file2Result,
      file1Error,
      file2Error,
      academicChecked,
      targetMajor,
      hasDownloadedExcel,
      isQualified,
      admissionMethod,
      admissionScores,
      additionalInfo,
      reason,
      signedScanState,
      signedScanErrorType,
      signedApplicationResult,
      downloadState,
      admissionLetterFile,
      admissionLetterDocument,
      graduationCertificateFile,
      graduationCertificateDocument,
      signedApplicationFile,
      signedApplicationDocument,
      trackingCode,
      requestId,
      submittedAt,
      submissionStatus,
      supplementNote,
      activeTab,
    ]
  );

  const { isDraftLoaded } =
    usePersistentProcedureDraft<MajorChangeDraftData>({
      requestType: 'MAJOR_CHANGE',
      isStarted,
      currentStep,
      draftData: majorChangeDraftData,
      restore: restoreMajorChangeDraft,
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
            'MAJOR_CHANGE'
          );

        if (cancelled) {
          return;
        }

        const admissionDocument =
          documents.find(
            (document) =>
              document.document_key ===
              'MAJOR_CHANGE_ADMISSION_LETTER'
          ) ?? null;

        const graduationDocument =
          documents.find(
            (document) =>
              document.document_key ===
              'MAJOR_CHANGE_GRADUATION_CERTIFICATE'
          ) ?? null;

        const signedDocument =
          documents.find(
            (document) =>
              document.document_key ===
              'MAJOR_CHANGE_SIGNED_APPLICATION'
          ) ?? null;

        setAdmissionLetterDocument(
          admissionDocument
        );
        setGraduationCertificateDocument(
          graduationDocument
        );
        setSignedApplicationDocument(
          signedDocument
        );

        if (admissionDocument) {
          setFile1Status('done');
          setFile1Error('');
        }

        if (graduationDocument) {
          setFile2Status('done');
          setFile2Error('');
        }

        if (signedDocument) {
          setSignedScanState('success');
          setSignedScanErrorType(null);

          setSignedApplicationResult(
            (previous) =>
              previous ?? {
                format_valid: true,
                is_match: true,
                accepted: true,
                detected_document_type:
                  'MAJOR_CHANGE_SIGNED_APPLICATION',
                signature_checks: {
                  applicant: {
                    present: true,
                  },
                },
              }
          );
        }
      } catch (error) {
        console.error(
          'Không thể tải tài liệu chuyển ngành:',
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
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, currentStep, file1Status, file2Status, isExtracting, academicChecked, isQualified, isSubmitting, targetMajorObj]);




  useEffect(() => {
    if (!isStarted) return;

    getMajorChangeProfile()
      .then((data) => {
        setStudentName(data.fullName || "bạn");
        setOfficialStudentId(
          String(data.studentId || "").trim()
        );
      })
      .catch((error) => {
        console.error(
          "Lỗi khi lấy tên sinh viên:",
          error
        );

        setStudentName("bạn");
      });

    getMajors()
      .then((majors) => {
        setMajorsList(majors);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách ngành:", err);
      });
  }, [isStarted]);

  const handleStart = () => setIsStarted(true);
  const handleCancel = () => router.push('/student/dashboard');

  const normalizeStudentId = (value: unknown): string => {
    return String(value ?? "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase();
  };

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
    setAdmissionLetterFile(null);

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

      const savedDocument =
        await uploadProcedureDraftDocument(
          'MAJOR_CHANGE',
          'MAJOR_CHANGE_ADMISSION_LETTER',
          file
        );

      setFile1Result(result);
      setAdmissionLetterFile(file);
      setAdmissionLetterDocument(
        savedDocument
      );
      setFile1Status("done");

      try {
        await saveProcedureDraft<MajorChangeDraftData>(
          'MAJOR_CHANGE',
          {
            isStarted: true,
            currentStep,
            draftData: {
              ...majorChangeDraftData,
              file1Status: 'done',
              file1Result: result,
              file1Error: '',
              admissionLetterDocumentId:
                savedDocument.id,
              admissionLetterFileName:
                savedDocument.original_name,
            },
          }
        );
      } catch (draftError) {
        console.error(
          'Không thể lưu Giấy báo trúng tuyển:',
          draftError
        );
      }
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
    setGraduationCertificateFile(null);

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

      const savedDocument =
        await uploadProcedureDraftDocument(
          'MAJOR_CHANGE',
          'MAJOR_CHANGE_GRADUATION_CERTIFICATE',
          file
        );

      setFile2Result(result);
      setGraduationCertificateFile(file);
      setGraduationCertificateDocument(
        savedDocument
      );
      setFile2Status("done");

      try {
        await saveProcedureDraft<MajorChangeDraftData>(
          'MAJOR_CHANGE',
          {
            isStarted: true,
            currentStep,
            draftData: {
              ...majorChangeDraftData,
              file2Status: 'done',
              file2Result: result,
              file2Error: '',
              graduationCertificateDocumentId:
                savedDocument.id,
              graduationCertificateFileName:
                savedDocument.original_name,
            },
          }
        );
      } catch (draftError) {
        console.error(
          'Không thể lưu Giấy chứng nhận tốt nghiệp:',
          draftError
        );
      }
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
        const expectedStudentId =
          normalizeStudentId(profile.studentId);

        const admissionStudentId =
          normalizeStudentId(
            admissionFields.student_id
          );

        /*
         * Nếu Giấy báo trúng tuyển có OCR được MSSV,
         * phải khớp với MSSV trong CSDL của tài khoản đăng nhập.
         * Không dùng MSSV OCR để ghi đè MSSV chính chủ.
         */
        if (
          admissionStudentId &&
          expectedStudentId &&
          admissionStudentId !== expectedStudentId
        ) {
          setFile1Status("error");
          setFile1Error(
            `Mã số sinh viên trên Giấy báo trúng tuyển (${admissionStudentId}) ` +
            `không khớp với tài khoản đang đăng nhập (${expectedStudentId}).`
          );

          alert(
            `Mã số sinh viên trên Giấy báo trúng tuyển (${admissionStudentId}) ` +
            `không khớp với mã số sinh viên của bạn (${expectedStudentId}).`
          );

          return;
        }

        setOfficialStudentId(
          String(profile.studentId || "").trim()
        );

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
    setCurrentStep(4);
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
    setSignedApplicationFile(null);

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

      /*
       * Đối chiếu MSSV trên Đơn xin chuyển ngành đã ký
       * với MSSV chính chủ lấy từ CSDL.
       */
      const extractedStudentId =
        normalizeStudentId(
          result.extracted_fields?.student_id
        );

      let expectedStudentId =
        normalizeStudentId(officialStudentId);

      // Trường hợp state chưa kịp có MSSV, lấy lại trực tiếp từ backend.
      if (!expectedStudentId) {
        const profile = await getMajorChangeProfile();

        expectedStudentId =
          normalizeStudentId(profile.studentId);

        setOfficialStudentId(
          String(profile.studentId || "").trim()
        );
      }

      if (!expectedStudentId) {
        setSignedApplicationResult(result);
        setSignedScanErrorType("document");
        setSignedScanState("error");

        alert(
          "Không xác định được mã số sinh viên của tài khoản đang đăng nhập. " +
          "Vui lòng tải lại trang hoặc đăng nhập lại."
        );

        return;
      }

      if (!extractedStudentId) {
        setSignedApplicationResult(result);
        setSignedScanErrorType("document");
        setSignedScanState("error");

        alert(
          "Không đọc được mã số sinh viên trên Đơn xin chuyển ngành. " +
          "Vui lòng kiểm tra file rõ nét và tải lại."
        );

        return;
      }

      if (extractedStudentId !== expectedStudentId) {
        setSignedApplicationResult(result);
        setSignedScanErrorType("document");
        setSignedScanState("error");

        alert(
          `Mã số sinh viên trên đơn (${extractedStudentId}) ` +
          `không khớp với mã số sinh viên của tài khoản ` +
          `đang đăng nhập (${expectedStudentId}).`
        );

        return;
      }

      if (!applicantSigned) {
        setSignedApplicationResult(result);
        setSignedScanErrorType("signature");
        setSignedScanState("error");
        return;
      }

      const savedDocument =
        await uploadProcedureDraftDocument(
          'MAJOR_CHANGE',
          'MAJOR_CHANGE_SIGNED_APPLICATION',
          file
        );

      setSignedApplicationResult(result);
      setSignedApplicationFile(file);
      setSignedApplicationDocument(
        savedDocument
      );
      setSignedScanErrorType(null);
      setSignedScanState("success");

      try {
        await saveProcedureDraft<MajorChangeDraftData>(
          'MAJOR_CHANGE',
          {
            isStarted: true,
            currentStep: 6,
            draftData: {
              ...majorChangeDraftData,
              signedScanState: 'success',
              signedScanErrorType: null,
              signedApplicationResult: result,
              signedApplicationDocumentId:
                savedDocument.id,
              signedApplicationFileName:
                savedDocument.original_name,
              downloadState: 'downloaded',
            },
          }
        );
      } catch (draftError) {
        console.error(
          'Không thể lưu Đơn chuyển ngành đã ký:',
          draftError
        );
      }
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


  const handleOpenMajorChangeDocument = async (
    document: ProcedureDraftDocument | null,
    localFile: File | null,
    label: string
  ) => {
    if (localFile) {
      const previewUrl =
        window.URL.createObjectURL(
          localFile
        );

      const previewWindow = window.open(
        previewUrl,
        '_blank',
        'noopener,noreferrer'
      );

      if (!previewWindow) {
        window.location.href = previewUrl;
        return;
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          previewUrl
        );
      }, 60_000);

      return;
    }

    if (!document) {
      alert(
        `Không tìm thấy ${label} trên hệ thống.`
      );
      return;
    }

    try {
      await openProcedureDraftDocument(
        document
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : `Không thể mở ${label}.`
      );
    }
  };


  const handleRetrySignedApplication = () => {
    setSignedApplicationResult(null);
    setSignedApplicationFile(null);
    setSignedScanState("idle");
    setSignedScanErrorType(null);

    setTimeout(() => {
      signedApplicationInputRef.current?.click();
    }, 0);
  };

  const handleFinalSubmit = async () => {
    if (!formData || !isForm5Valid) {
      alert(
        'Vui lòng kiểm tra và nhập đầy đủ thông tin hồ sơ.'
      );
      return;
    }

    if (
      isSubmitting ||
      submitLockRef.current
    ) {
      return;
    }

    const accessToken =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access');

    if (!accessToken) {
      alert(
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      );
      router.push('/login');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      let admissionDocument =
        admissionLetterDocument;
      let graduationDocument =
        graduationCertificateDocument;
      let signedDocument =
        signedApplicationDocument;

      if (
        (!admissionLetterFile &&
          !admissionDocument) ||
        (!graduationCertificateFile &&
          !graduationDocument) ||
        (!signedApplicationFile &&
          !signedDocument)
      ) {
        const documents =
          await listProcedureDraftDocuments(
            'MAJOR_CHANGE'
          );

        admissionDocument =
          admissionDocument ??
          documents.find(
            (document) =>
              document.document_key ===
              'MAJOR_CHANGE_ADMISSION_LETTER'
          ) ??
          null;

        graduationDocument =
          graduationDocument ??
          documents.find(
            (document) =>
              document.document_key ===
              'MAJOR_CHANGE_GRADUATION_CERTIFICATE'
          ) ??
          null;

        signedDocument =
          signedDocument ??
          documents.find(
            (document) =>
              document.document_key ===
              'MAJOR_CHANGE_SIGNED_APPLICATION'
          ) ??
          null;

        setAdmissionLetterDocument(
          admissionDocument
        );
        setGraduationCertificateDocument(
          graduationDocument
        );
        setSignedApplicationDocument(
          signedDocument
        );
      }

      const applicantSigned =
        signedApplicationResult
          ?.signature_checks
          ?.applicant
          ?.present === true ||
        Boolean(signedDocument);

      if (
        !applicantSigned ||
        (!signedApplicationFile &&
          !signedDocument)
      ) {
        alert(
          'Vui lòng tải lên Đơn xin chuyển ngành ' +
          'có chữ ký của Người làm đơn.'
        );
        return;
      }

      if (
        (!admissionLetterFile &&
          !admissionDocument) ||
        (!graduationCertificateFile &&
          !graduationDocument)
      ) {
        alert(
          'Không tìm thấy đầy đủ Giấy báo trúng tuyển ' +
          'và Giấy chứng nhận tốt nghiệp THPT.'
        );
        return;
      }

      const signedFileToSubmit =
        signedApplicationFile ??
        await fetchProcedureDraftDocumentAsFile(
          signedDocument as ProcedureDraftDocument
        );

      const admissionFileToSubmit =
        admissionLetterFile ??
        await fetchProcedureDraftDocumentAsFile(
          admissionDocument as ProcedureDraftDocument
        );

      const graduationFileToSubmit =
        graduationCertificateFile ??
        await fetchProcedureDraftDocumentAsFile(
          graduationDocument as ProcedureDraftDocument
        );

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        'http://127.0.0.1:8000/api'
      ).replace(/\/$/, '');

      const submitData = new FormData();

      submitData.append(
        'file',
        signedFileToSubmit
      );
      submitData.append(
        'admission_letter',
        admissionFileToSubmit
      );
      submitData.append(
        'graduation_certificate',
        graduationFileToSubmit
      );

      const payload =
        buildMajorChangePayload();

      Object.entries(payload).forEach(
        ([key, value]) => {
          if (
            value !== null &&
            value !== undefined
          ) {
            submitData.append(
              key,
              String(value)
            );
          }
        }
      );

      const response = await axios.post(
        `${apiBase}/thoi-hoc/submit-major-change/`,
        submitData,
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

      if (
        response.data?.success !== true
      ) {
        throw new Error(
          response.data?.error ||
          response.data?.detail ||
          response.data?.message ||
          'Backend không thể tạo hồ sơ chuyển ngành.'
        );
      }

      const newRequestId = String(
        response.data?.requestId ||
        response.data?.request_id ||
        ''
      );

      const newTrackingCode = String(
        response.data?.trackingCode ||
        response.data?.tracking_code ||
        response.data?.requestCode ||
        newRequestId ||
        ''
      );

      const newSubmissionStatus = (
        response.data?.status ||
        'PENDING_REVIEW'
      ) as SubmissionStatus;

      const newSubmittedAt =
        new Date().toISOString();

      setRequestId(newRequestId);
      setTrackingCode(
        newTrackingCode
      );
      setSubmissionStatus(
        (response.data?.status ||
          "PENDING_REVIEW") as SubmissionStatus
      );
      setSubmittedAt(newSubmittedAt);
      setActiveTab('details');
      setCurrentStep(7);

      try {
        await saveProcedureDraft<MajorChangeDraftData>(
          'MAJOR_CHANGE',
          {
            isStarted: true,
            currentStep: 7,
            draftData: {
              ...majorChangeDraftData,
              requestId: newRequestId,
              trackingCode:
                newTrackingCode,
              submittedAt:
                newSubmittedAt,
              submissionStatus:
                newSubmissionStatus,
              activeTab: 'details',
              downloadState:
                'downloaded',
              signedScanState:
                'success',
              signedScanErrorType:
                null,
              admissionLetterDocumentId:
                admissionDocument?.id ??
                null,
              admissionLetterFileName:
                admissionFileToSubmit.name,
              graduationCertificateDocumentId:
                graduationDocument?.id ??
                null,
              graduationCertificateFileName:
                graduationFileToSubmit.name,
              signedApplicationDocumentId:
                signedDocument?.id ??
                null,
              signedApplicationFileName:
                signedFileToSubmit.name,
            },
          }
        );
      } catch (draftError) {
        console.error(
          'Không thể lưu trạng thái hoàn tất chuyển ngành:',
          draftError
        );
      }
    } catch (error: unknown) {
      console.error(
        'Lỗi nộp hồ sơ chuyển ngành:',
        error
      );

      let message =
        'Có lỗi xảy ra khi nộp hồ sơ chuyển ngành. ' +
        'Vui lòng thử lại.';

      if (axios.isAxiosError(error)) {
        const statusCode =
          error.response?.status;
        const errorData =
          error.response?.data;

        if (statusCode === 401) {
          localStorage.removeItem(
            'access'
          );
          localStorage.removeItem(
            'access_token'
          );
          alert(
            'Phiên đăng nhập đã hết hạn. ' +
            'Vui lòng đăng nhập lại.'
          );
          router.push('/login');
          return;
        }

        message =
          errorData?.error ||
          errorData?.detail ||
          errorData?.message ||
          errorData
            ?.non_field_errors?.[0] ||
          (statusCode === 409
            ? 'Bạn đang có một hồ sơ học vụ đang được xử lý.'
            : message);
      } else if (
        error instanceof Error
      ) {
        message = error.message;
      }

      alert(message);
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
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

  /**
   * Gọi backend để tạo lại bản xem trước từ dữ liệu hiện có.
   * Hàm này CHỈ tạo preview, không thay đổi currentStep và không lưu draft.
   * Nhờ vậy có thể dùng lại khi khôi phục bước 6/7 mà không làm hồ sơ
   * đang ở bước 7 bị quay ngược về bước 6.
   */
  const generatePreviewDocument = async (
    options: { silent?: boolean } = {}
  ): Promise<boolean> => {
    const { silent = false } = options;

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      if (!silent) {
        alert(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      }
      return false;
    }

    if (!formData) {
      if (!silent) {
        alert("Chưa có thông tin sinh viên.");
      }
      return false;
    }

    if (!isForm5Valid) {
      if (!silent) {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      }
      return false;
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

      if (contentType.includes("application/json")) {
        const responseText = await response.text();
        throw new Error(
          responseText || "Lỗi từ Backend."
        );
      }

      const fileBlob = await response.blob();

      if (contentType.includes("application/pdf")) {
        const fileUrl = URL.createObjectURL(fileBlob);

        setPreviewUrl((oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          return fileUrl;
        });
        setPreviewBlob(null);
      } else {
        // DOC/DOCX được DocxPreview đọc trực tiếp từ Blob.
        setPreviewBlob(fileBlob);
        setPreviewUrl((oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          return null;
        });
      }

      return true;
    } catch (error) {
      console.error(
        "Lỗi xem trước đơn chuyển ngành:",
        error
      );

      if (!silent) {
        alert(
          error instanceof Error
            ? error.message
            : "Không thể tạo bản xem trước đơn chuyển ngành."
        );
      }

      return false;
    } finally {
      setIsPreviewLoading(false);
    }
  };

  /**
   * Người dùng chủ động bấm từ bước 5 -> tạo preview rồi mới chuyển sang bước 6.
   */
  const handlePreviewDocument = async () => {
    const success = await generatePreviewDocument();

    if (!success) {
      return;
    }

    setCurrentStep(6);

    try {
      await saveProcedureDraft<MajorChangeDraftData>(
        'MAJOR_CHANGE',
        {
          isStarted: true,
          currentStep: 6,
          draftData: {
            ...majorChangeDraftData,
            downloadState:
              downloadState === 'downloading'
                ? 'idle'
                : downloadState,
          },
        }
      );
    } catch (draftError) {
      console.error(
        'Không thể lưu bước xem trước chuyển ngành:',
        draftError
      );
    }
  };

  /**
   * Khi refresh / rời trang rồi quay lại ở bước 6 hoặc 7:
   * draft chỉ khôi phục dữ liệu JSON, còn Blob/Object URL của preview đã mất.
   * Tự gọi lại API preview để dựng lại bản xem trước mà KHÔNG đổi currentStep.
   */
  useEffect(() => {
    if (
      !isDraftLoaded ||
      !isStarted ||
      currentStep < 6 ||
      !formData ||
      !isForm5Valid ||
      previewUrl ||
      previewBlob ||
      isPreviewLoading ||
      previewRestoreAttemptedRef.current
    ) {
      return;
    }

    previewRestoreAttemptedRef.current = true;

    void generatePreviewDocument({ silent: true });

    // generatePreviewDocument cố ý không đưa vào dependency array:
    // hàm sử dụng state của render hiện tại và ref phía trên chặn gọi lặp.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDraftLoaded,
    isStarted,
    currentStep,
    formData,
    isForm5Valid,
    previewUrl,
    previewBlob,
    isPreviewLoading,
  ]);

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

  const formatSubmittedAt = (value: string) => {
    if (!value) return "Vừa gửi";

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsedDate);
  };

  const loadSubmittedRequest = async () => {
    if (!requestId) return;

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) return;

    try {
      setIsLoadingSubmission(true);

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000/api"
      ).replace(/\/$/, "");

      const response = await axios.get(
        `${apiBase}/requests/${requestId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data || {};
      const nextStatus = String(
        data.status || data.request_status || "PENDING"
      ) as SubmissionStatus;

      setSubmissionStatus(nextStatus);

      if (data.submitted_at) {
        setSubmittedAt(String(data.submitted_at));
      }

      const history: RequestHistoryItem[] = Array.isArray(data.history)
        ? data.history
        : Array.isArray(data.request_history)
          ? data.request_history
          : [];

      const latestSupplementRequest = history.find(
        (item) =>
          item.status === "ADDITIONAL_INFO_REQUIRED" &&
          Boolean(item.notes)
      );

      setSupplementNote(
        String(
          latestSupplementRequest?.notes ||
          data.additional_info_note ||
          data.supplement_note ||
          ""
        )
      );
    } catch (error) {
      console.error("Không thể tải trạng thái hồ sơ chuyển ngành:", error);
    } finally {
      setIsLoadingSubmission(false);
    }
  };

  const handleSupplementFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSupplementFile(event.target.files?.[0] || null);
  };

  const handleResubmit = async () => {
    if (!requestId) {
      alert("Không tìm thấy mã hồ sơ.");
      return;
    }

    if (!supplementFile) {
      alert("Vui lòng chọn tài liệu bổ sung.");
      return;
    }

    const accessToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!accessToken) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      router.push("/login");
      return;
    }

    try {
      setIsResubmitting(true);

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000/api"
      ).replace(/\/$/, "");

      const data = new FormData();
      data.append("file", supplementFile);

      const response = await axios.post(
        `${apiBase}/requests/${requestId}/resubmit/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.error ||
          response.data?.detail ||
          "Không thể nộp tài liệu bổ sung."
        );
      }

      setSupplementFile(null);
      setSupplementNote("");
      setSubmissionStatus(
        (response.data?.status ||
          "PENDING") as SubmissionStatus
      );

      if (supplementInputRef.current) {
        supplementInputRef.current.value = "";
      }

      alert("Đã nộp tài liệu bổ sung thành công.");
      await loadSubmittedRequest();
    } catch (error: unknown) {
      console.error("Lỗi nộp tài liệu bổ sung:", error);

      let message = "Không thể nộp tài liệu bổ sung.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.response?.data?.message ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      alert(message);
    } finally {
      setIsResubmitting(false);
    }
  };

  useEffect(() => {
    if (
      currentStep >= 7 &&
      activeTab === "tracking" &&
      requestId
    ) {
      void loadSubmittedRequest();
    }
  }, [activeTab, currentStep, requestId]);

  /**
   * Cho phép chỉnh sửa dữ liệu ở mọi bước trước khi nộp.
   * Nếu người dùng sửa sau khi đã tạo bản xem trước/đơn,
   * các tài liệu sinh ra từ dữ liệu cũ sẽ bị vô hiệu hóa
   * và quy trình quay về bước 5 để tạo lại đơn.
   */
  const invalidateGeneratedApplicationAfterEdit = () => {
    if (currentStep === 7) {
      return;
    }

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }
      return null;
    });
    setPreviewBlob(null);
    previewRestoreAttemptedRef.current = false;

    setDownloadState("idle");

    setSignedApplicationFile(null);
    setSignedApplicationDocument(null);
    setSignedApplicationResult(null);
    setSignedScanState("idle");
    setSignedScanErrorType(null);

    if (currentStep >= 6) {
      setCurrentStep(5);
    }
  };


  const updateFormData = (
    field: keyof MajorChangeProfile,
    value: string
  ) => {
    invalidateGeneratedApplicationAfterEdit();
    setFormData((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        [field]: value,
      };
    });
  };

  if (!isDraftLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <span className="w-9 h-9 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">
            Đang khôi phục thủ tục chuyển ngành...
          </p>
        </div>
      </div>
    );
  }

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
                          <p className={`text-xs ${file1Status === 'done' ? 'text-green-600' : 'text-gray-400'}`}>{file1Status === 'done'
                              ? admissionLetterFile?.name ||
                                admissionLetterDocument?.original_name ||
                                'Đã tải lên thành công ✓'
                              : 'Giay_Bao_Trung_Tuyen.pdf'}</p>
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
                          <p className={`text-xs ${file2Status === 'done' ? 'text-green-600' : 'text-gray-400'}`}>{file2Status === 'done'
                              ? graduationCertificateFile?.name ||
                                graduationCertificateDocument?.original_name ||
                                'Đã tải lên thành công ✓'
                              : 'Giay_Chung_Nhan_TN_THPT.pdf'}</p>
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
                  <h3 className="font-semibold text-black flex items-center gap-2 text-sm"><div className="bg-[#1E293B] text-white rounded-full p-0.5"><Check size={14} /></div> Đối chiếu dữ liệu — Có thể chỉnh sửa</h3>
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
                        disabled={currentStep === 7}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none text-black"
                      />
                    </div>

                    {/* Mã số sinh viên */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                        Mã số sinh viên
                      </label>

                      <input
                        type="text"
                        value={
                          officialStudentId ||
                          formData.studentId ||
                          ""
                        }
                        readOnly
                        className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none text-gray-700"
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
                        disabled={currentStep === 7}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none text-black"
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
                        disabled={currentStep === 7}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none text-black"
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
                        disabled={currentStep === 7}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none text-black"
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
                        disabled={currentStep === 7}
                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm outline-none text-black"
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
                    <label className="text-xs font-bold text-black uppercase block mb-2">Ngành muốn chuyển đến</label>
                    <select
                      value={targetMajorObj?.major_id || ''}
                      onChange={(e) => {
                        invalidateGeneratedApplicationAfterEdit();

                        const majorId = e.target.value;
                        const selectedMajor = majorsList.find(m => m.major_id === majorId);
                        setTargetMajorObj(selectedMajor || null);
                        setTargetMajor(selectedMajor?.name || '');
                        
                        if (selectedMajor) {
                          const studentScore = formData?.admissionScore || 0;
                          if (studentScore >= selectedMajor.admission_threshold) {
                            handleConfirmQualification(true);
                            setAdmissionScores({
                              combo: '', 
                              score: studentScore.toString(),
                              priority: '0',
                              threshold: selectedMajor.admission_threshold.toString()
                            });
                          } else {
                            handleConfirmQualification(false);
                          }
                        } else {
                          setIsQualified(null);
                        }
                      }}
                      disabled={currentStep === 7}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white text-black"
                    >
                      <option value="">-- Chọn ngành muốn chuyển đến --</option>
                      {majorsList.map(major => (
                        <option key={major.major_id} value={major.major_id}>
                          {major.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {targetMajorObj && (
                    <div className="flex flex-col gap-4 animate-in fade-in">
                      <div className="bg-[#F0F7FF] border border-[#D9EAFD] p-4 rounded-lg flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-[#D9EAFD] pb-3">
                          <span className="text-sm text-slate-600 font-medium">Điểm nhập học của bạn:</span>
                          <span className="text-lg font-bold text-[#18538E]">{formData?.admissionScore || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 font-medium">Điểm chuẩn ngành {targetMajorObj.name}:</span>
                          <span className="text-lg font-bold text-slate-700">{targetMajorObj.admission_threshold}</span>
                        </div>
                      </div>

                      {isQualified === false && (
                        <div className="border border-red-300 bg-red-50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
                          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-red-700 text-sm">Không đủ điều kiện</h4>
                            <p className="text-xs text-red-600 mt-1 leading-relaxed">
                              Điểm nhập học của bạn thấp hơn điểm chuẩn của ngành muốn chuyển đến. Vui lòng chọn ngành khác.
                            </p>
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
                          <button
                            key={method}
                            onClick={() => {
                              invalidateGeneratedApplicationAfterEdit();
                              setAdmissionMethod(method);
                            }}
                            disabled={currentStep === 7} className={`px-4 py-2 border rounded-md text-sm font-medium transition ${admissionMethod === method ? 'bg-[#0070F4] text-white border-[#0070F4]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                            {method}
                          </button>
                        ))}
                      </div>

                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Điểm tuyển sinh</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Tổ hợp môn xét tuyển</label><input type="text" placeholder="VD: A00, A01, D01" value={admissionScores.combo} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdmissionScores({ ...admissionScores, combo: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Điểm xét tuyển</label><input type="text" value={admissionScores.score} disabled className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50 text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Điểm ưu tiên (nếu có)</label><input type="text" value={admissionScores.priority} disabled className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50 text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Ngưỡng đầu vào (nếu có)</label><input type="text" value={admissionScores.threshold} disabled className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50 text-black" /></div>
                      </div>

                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Thông tin cá nhân bổ sung</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Ngày sinh</label><input type="text" value={additionalInfo.dob} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdditionalInfo({ ...additionalInfo, dob: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50 text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Nơi sinh</label><input type="text" placeholder="VD: TP. Hồ Chí Minh" value={additionalInfo.pob} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdditionalInfo({ ...additionalInfo, pob: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Số điện thoại</label><input type="text" value={additionalInfo.phone} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdditionalInfo({ ...additionalInfo, phone: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50 text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Số CCCD</label><input type="text" value={additionalInfo.cccd} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdditionalInfo({ ...additionalInfo, cccd: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none bg-gray-50 text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Ngày cấp CCCD</label><input type="text" placeholder="VD: 15/06/2021" value={additionalInfo.issueDate} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdditionalInfo({ ...additionalInfo, issueDate: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none text-black" /></div>
                        <div><label className="text-xs text-gray-500 mb-1.5 block">Nơi cấp</label><input type="text" placeholder="VD: Cục CS QLHC" value={additionalInfo.issuePlace} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setAdditionalInfo({ ...additionalInfo, issuePlace: e.target.value });
                        }} disabled={currentStep === 7} className="w-full border rounded-lg p-2.5 text-sm outline-none text-black" /></div>
                      </div>

                      <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Lý do xin chuyển ngành</label>
                        <textarea rows={3} placeholder="Trình bày lý do bạn muốn chuyển ngành" value={reason} onChange={e => {
                          invalidateGeneratedApplicationAfterEdit();
                          setReason(e.target.value);
                        }} disabled={currentStep === 7} className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none resize-none text-black"></textarea>
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
                    ) : previewBlob ? (
                      <div className="w-full h-[1000px] bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <DocxPreview blob={previewBlob} />
                      </div>
                    ) : isPreviewLoading ? (
                      <div className="h-[500px] flex flex-col items-center justify-center gap-3 text-gray-500">
                        <span className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        <span>Đang khôi phục bản xem trước...</span>
                      </div>
                    ) : (
                      <div className="h-[500px] flex flex-col items-center justify-center gap-4 text-gray-500">
                        <span>Chưa có bản xem trước</span>
                        <button
                          type="button"
                          onClick={() => {
                            previewRestoreAttemptedRef.current = true;
                            void generatePreviewDocument();
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Tạo lại bản xem trước
                        </button>
                      </div>
                    )}
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

                              <button
                                type="button"
                                onClick={() =>
                                  void handleOpenMajorChangeDocument(
                                    signedApplicationDocument,
                                    signedApplicationFile,
                                    'Đơn xin chuyển ngành đã ký'
                                  )
                                }
                                className="mt-4 w-full border border-green-200 bg-white rounded-lg p-4 flex items-center justify-between hover:bg-green-50 transition text-left"
                                title="Nhấn để mở đơn đã ký"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-800">
                                    Đơn xin chuyển ngành đã ký
                                  </p>

                                  <p className="text-xs text-blue-600 mt-1 truncate">
                                    {signedApplicationFile?.name ||
                                      signedApplicationDocument?.original_name ||
                                      'Nhấn để xem file đã ký'}
                                  </p>
                                </div>

                                <CheckCircle2
                                  size={22}
                                  className="text-green-600 shrink-0"
                                />
                              </button>
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
            {currentStep >= 7 && (() => {
              const statusMeta = getSubmissionStatusMeta(submissionStatus);

              return (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 mt-6">
                  {/* Banner Thành công */}
                  <div className="ml-12 bg-green-50 border border-green-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-green-500 text-white rounded-full p-2 mb-4">
                      <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="font-bold text-green-700 text-lg mb-1">
                      Hồ sơ đã được nộp thành công!
                    </h3>
                    <p className="text-green-600 text-sm mb-3">
                      Phòng Đào tạo sẽ xem xét và phản hồi trong vòng{" "}
                      <strong>
                        07 - 10 ngày làm việc kể từ khi nhận đủ hồ sơ
                      </strong>.
                    </p>
                    <p className="text-xs text-gray-500">
                      Mã hồ sơ:{" "}
                      <strong>{trackingCode || requestId || "Đang cập nhật"}</strong>
                    </p>
                  </div>

                  {/* Tracking Dashboard */}
                  <div className="ml-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex border-b border-gray-200 text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => setActiveTab("details")}
                        className={`flex-1 py-4 transition-colors ${
                          activeTab === "details"
                            ? "text-[#0070F4] border-b-2 border-[#0070F4]"
                            : "text-gray-500 hover:text-gray-700 bg-gray-50"
                        }`}
                      >
                        Xem chi tiết hồ sơ
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("tracking")}
                        className={`flex-1 py-4 transition-colors ${
                          activeTab === "tracking"
                            ? "text-[#0070F4] border-b-2 border-[#0070F4]"
                            : "text-gray-500 hover:text-gray-700 bg-gray-50"
                        }`}
                      >
                        Theo dõi trạng thái
                      </button>
                    </div>

                    {activeTab === "details" && (
                      <div className="animate-in fade-in">
                        <div className="bg-[#1E3A5F] text-white p-6 flex flex-col gap-5 md:flex-row md:justify-between md:items-start">
                          <div>
                            <p className="text-xs text-blue-300 font-semibold mb-1 uppercase tracking-wider">
                              Biên nhận kỹ thuật số
                            </p>
                            <h4 className="font-bold text-2xl mb-6">
                              Đơn xin chuyển ngành
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-5 sm:gap-12">
                              <div>
                                <p className="text-xs text-blue-300 mb-1">
                                  Mã hồ sơ
                                </p>
                                <p className="font-semibold">
                                  {trackingCode || requestId || "Đang cập nhật"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-300 mb-1">
                                  Thời gian nộp
                                </p>
                                <p className="font-semibold flex items-center gap-1.5">
                                  <Clock size={14} />
                                  {formatSubmittedAt(submittedAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <span className={`${statusMeta.badgeClass} text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="p-6">
                          <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
                            Thông tin cá nhân & Nguyện vọng
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <p className="text-xs text-gray-400 mb-1">Họ và tên</p>
                              <p className="font-semibold text-gray-800">{formData?.fullName}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <p className="text-xs text-gray-400 mb-1">Mã số sinh viên</p>
                              <p className="font-semibold text-gray-800">{officialStudentId || formData?.studentId}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <p className="text-xs text-gray-400 mb-1">Ngày sinh</p>
                              <p className="font-semibold text-gray-800">{additionalInfo.dob}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <p className="text-xs text-gray-400 mb-1">Số CCCD</p>
                              <p className="font-semibold text-gray-800">{additionalInfo.cccd}</p>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mb-8">
                            <div className="text-center flex-1">
                              <p className="text-xs text-gray-500 mb-1">Chuyển từ</p>
                              <p className="font-bold text-slate-800">{formData?.currentMajor}</p>
                            </div>
                            <div className="px-4 text-blue-400">
                              <ArrowLeftRight size={24} />
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-xs text-gray-500 mb-1">Chuyển đến</p>
                              <p className="font-bold text-[#0070F4]">{targetMajor}</p>
                            </div>
                          </div>

                          <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
                            Cơ sở xét duyệt
                          </h5>
                          <div className="flex flex-wrap gap-3 mb-8">
                            <span className="bg-[#1E293B] text-white px-4 py-2 rounded-lg text-sm font-semibold">
                              {admissionMethod}
                            </span>
                            <span className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                              Điểm xét tuyển: <strong>{admissionScores.score || "Không có"}</strong>
                            </span>
                            <span className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                              Ngưỡng đầu vào: <strong>{admissionScores.threshold || "Không có"}</strong>
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
                            Danh sách tài liệu đã nộp
                          </h5>
                          <div className="space-y-3">
                            {[
                              {
                                name: "Đơn xin chuyển ngành",
                                desc:
                                  signedApplicationFile?.name ||
                                  signedApplicationDocument?.original_name ||
                                  "Đơn đã ký",
                                icon: <FileText className="text-blue-500" />,
                                bg: "bg-blue-50",
                                document:
                                  signedApplicationDocument,
                                localFile:
                                  signedApplicationFile,
                              },
                              {
                                name: "Giấy báo trúng tuyển",
                                desc:
                                  admissionLetterFile?.name ||
                                  admissionLetterDocument?.original_name ||
                                  "Tài liệu đã xác thực",
                                icon: <FileText className="text-red-400" />,
                                bg: "bg-red-50",
                                document:
                                  admissionLetterDocument,
                                localFile:
                                  admissionLetterFile,
                              },
                              {
                                name: "Giấy chứng nhận Tốt nghiệp THPT",
                                desc:
                                  graduationCertificateFile?.name ||
                                  graduationCertificateDocument?.original_name ||
                                  "Tài liệu đã xác thực",
                                icon: <FileText className="text-green-500" />,
                                bg: "bg-green-50",
                                document:
                                  graduationCertificateDocument,
                                localFile:
                                  graduationCertificateFile,
                              },
                            ].map((file) => (
                              <button
                                type="button"
                                key={file.name}
                                onClick={() =>
                                  void handleOpenMajorChangeDocument(
                                    file.document,
                                    file.localFile,
                                    file.name
                                  )
                                }
                                className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-blue-200 transition text-left"
                                title="Nhấn để mở tài liệu"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`${file.bg} p-2 rounded-lg shrink-0`}>
                                    {file.icon}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                      {file.desc}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                                  Đã nộp
                                </span>
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                requestId
                                  ? `/student/submissions/${requestId}`
                                  : "/student/submissions"
                              )
                            }
                            className="w-full mt-6 bg-[#0070F4] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Xem hồ sơ trong danh sách đã nộp
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "tracking" && (
                      <div className="p-6 animate-in fade-in">
                        <div className={`border rounded-xl p-5 ${statusMeta.panelClass}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">
                                Trạng thái hiện tại
                              </p>
                              <h4 className="font-bold text-gray-800 mt-1">
                                {statusMeta.label}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => void loadSubmittedRequest()}
                              disabled={isLoadingSubmission}
                              className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              {isLoadingSubmission
                                ? "Đang cập nhật..."
                                : "Cập nhật trạng thái"}
                            </button>
                          </div>
                        </div>

                        {submissionStatus === "PENDING" && (
                          <div className="mt-4 border border-yellow-200 bg-yellow-50 rounded-xl p-5">
                            <p className="font-semibold text-yellow-800">
                              Hồ sơ đang chờ Phòng Đào tạo tiếp nhận
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Khi hồ sơ được duyệt, từ chối hoặc yêu cầu bổ sung,
                              trạng thái sẽ hiển thị tại đây.
                            </p>
                          </div>
                        )}

                        {false && (
                          <div className="mt-4 border border-blue-200 bg-blue-50 rounded-xl p-5">
                            <p className="font-semibold text-blue-800">
                              Phòng Đào tạo đang xử lý hồ sơ
                            </p>
                          </div>
                        )}

                        {submissionStatus === "APPROVED" && (
                          <div className="mt-4 border border-green-200 bg-green-50 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="text-green-600 shrink-0" />
                              <div>
                                <p className="font-semibold text-green-800">
                                  Hồ sơ chuyển ngành đã được phê duyệt
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                  Bạn có thể mở trang chi tiết hồ sơ để xem toàn bộ lịch sử xử lý.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {submissionStatus === "REJECTED" && (
                          <div className="mt-4 border border-red-200 bg-red-50 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                              <X className="text-red-600 shrink-0" />
                              <div>
                                <p className="font-semibold text-red-800">
                                  Hồ sơ đã bị từ chối
                                </p>
                                {supplementNote && (
                                  <p className="text-sm text-red-700 mt-1">
                                    {supplementNote}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {submissionStatus === "ADDITIONAL_INFO_REQUIRED" && (
                          <div className="mt-4 border border-orange-200 bg-orange-50 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="text-orange-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-orange-800">
                                  Phòng Đào tạo yêu cầu bổ sung hồ sơ
                                </p>
                                <p className="text-sm text-orange-700 mt-2">
                                  {supplementNote ||
                                    "Vui lòng bổ sung tài liệu theo yêu cầu của Phòng Đào tạo."}
                                </p>

                                <input
                                  ref={supplementInputRef}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={handleSupplementFileChange}
                                  className="hidden"
                                />

                                <button
                                  type="button"
                                  onClick={() => supplementInputRef.current?.click()}
                                  className="w-full mt-4 border-2 border-dashed border-orange-300 bg-white rounded-xl p-5 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition"
                                >
                                  <Upload size={22} className="inline mr-2" />
                                  {supplementFile
                                    ? supplementFile.name
                                    : "Chọn tài liệu bổ sung"}
                                </button>

                                <button
                                  type="button"
                                  onClick={handleResubmit}
                                  disabled={!supplementFile || isResubmitting}
                                  className="w-full mt-3 bg-[#0070F4] text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                                >
                                  {isResubmitting
                                    ? "Đang nộp bổ sung..."
                                    : "Nộp tài liệu bổ sung"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              requestId
                                ? `/student/submissions/${requestId}`
                                : "/student/submissions"
                            )
                          }
                          className="w-full mt-5 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                          Mở trang chi tiết hồ sơ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div ref={chatEndRef} />
          </div>
        )}
      </ChatInterface>
    </div>
  );
}