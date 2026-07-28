"use client";

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import {
  Archive, Bot, Check, ChevronRight, UploadCloud, X, FileText,
  Download, CheckCircle2, ScanSearch, Clock, CircleDot, AlertCircle, User, Users, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRetentionProfile, RetentionProfile } from '@/services/retention.service';
import axios from 'axios';

export default function RetentionPage() {
  const router = useRouter();

  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [draftToRestore, setDraftToRestore] = useState<any | null>(null);

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

  const [aiResult, setAiResult] = useState<{
    format_valid?: boolean;
    title_valid?: boolean;
    signature_present?: boolean;
  } | null>(null);

  // State: Bước 5 - Tab trạng thái
  const [activeTab, setActiveTab] =
    useState<"details" | "tracking">("details");

  const chatEndRef =
    useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, profile, currentStep, downloadState, scanState, activeTab]);

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

// Tự động tải bản nháp nếu có
useEffect(() => {
  if (!isStarted || !profile) return;

  const accessToken = localStorage.getItem("access_token") || localStorage.getItem("access");
  if (!accessToken) return;

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

  axios.get(`${apiBase}/thoi-hoc/draft/retention/get/`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  .then(res => {
    if (res.data.hasDraft && res.data.draft) {
      setDraftToRestore(res.data.draft);
    }
  })
  .catch(err => console.error("Lỗi khi tải bản nháp:", err));
}, [isStarted, profile]);

  const handleRestoreDraft = () => {
    if (!draftToRestore) return;
    setFormData(draftToRestore.formData || { reason: "", duration: "", attachmentNote: "" });
    setCurrentStep(draftToRestore.step || 1);
    if (draftToRestore.step >= 2) {
      setDownloadState("downloaded");
    }
    setDraftToRestore(null);
  };

  const handleIgnoreDraft = () => {
    setDraftToRestore(null);
  };

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

  const handleSaveDraft = async () => {
    try {
      const accessToken = localStorage.getItem("access_token") || localStorage.getItem("access");
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

      const res = await axios.post(`${apiBase}/thoi-hoc/draft/retention/save/`, {
        step: currentStep,
        formData: formData
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (res.data.success) {
        setToastMessage({type: 'success', text: "Đã lưu nháp thành công! Bạn có thể tắt trang này và tiếp tục sau."});
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error: any) {
      setToastMessage({type: 'error', text: error.response?.data?.error || "Có lỗi xảy ra khi lưu nháp."});
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

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
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      setScanState('scanning');
      setAiResult(null);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/thoi-hoc/scan-retention/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setAiResult(response.data);
        
        if (response.data.format_valid && response.data.title_valid && response.data.signature_present) {
          setScanState('success');
        } else {
          setScanState('error');
        }
      } catch (error) {
        console.error('Lỗi khi quét OCR:', error);
        setScanState('error');
      } finally {
        // Reset file input so user can re-upload the same file if needed
        if (docFileRef.current) {
          docFileRef.current.value = '';
        }
      }
    }
  };

  const handleContinueToPreview = () => setCurrentStep(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [requestId, setRequestId] = useState("");

  // --- Handlers Bước 4 ---
  const handleFinalSubmit = async () => {
    if (!docFile || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', docFile);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('attachmentNote', formData.attachmentNote);

      const accessToken = localStorage.getItem("access_token") || localStorage.getItem("access");
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/thoi-hoc/submit-retention/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data.success) {
        setTrackingCode(response.data.trackingCode);
        if (response.data.requestId) {
          setRequestId(response.data.requestId);
        }
        setCurrentStep(5);
      } else {
        alert(response.data.error || 'Có lỗi xảy ra khi nộp hồ sơ.');
      }
    } catch (error: any) {
      console.error('Lỗi khi nộp hồ sơ:', error);
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                                <label className="text-xs font-semibold text-gray-400 mb-2 uppercase block">Thời gian bảo lưu <span className="text-red-500">*</span></label>
                                <select disabled={currentStep > 1} value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white disabled:bg-gray-50">
                                  <option value="">-- Chọn thời gian bảo lưu --</option>
                                  <option value="1 kỳ">1 kỳ</option>
                                  <option value="2 kỳ">2 kỳ</option>
                                  <option value="3 kỳ">3 kỳ</option>
                                  <option value="4 kỳ">4 kỳ</option>
                                </select>
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
                          <p className="text-xs text-gray-500 mt-1">Đi xin đủ chữ ký tại mục "Ý kiến của phụ huynh" và "Ý kiến của Lãnh đạo Khoa".</p>
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
                    <div className="flex items-center gap-3 mt-2 animate-in fade-in slide-in-from-bottom-4">
                      <button onClick={handleContinueToUpload} className="flex-1 bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm shadow-sm">
                        Tiếp tục tải lên hồ sơ đã ký <ChevronRight size={18} />
                      </button>
                      <button onClick={handleSaveDraft} className="px-6 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                        Lưu nháp và tạm dừng
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

                <div className="ml-12 animate-in fade-in slide-in-from-bottom-4">
                  {scanState === 'idle' ? (
                    <div onClick={() => docFileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition bg-white shadow-sm">
                      <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3"><UploadCloud size={24} /></div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">Tải lên file Đơn xin nghỉ học tạm thời đã ký đủ ba bên</p>
                      <p className="text-xs text-gray-400 mb-4">Kéo thả hoặc click để chọn file (.docx hoặc .pdf hoặc ảnh chụp rõ nét)</p>
                      <button className="bg-white border border-gray-200 rounded-md px-5 py-2 text-sm font-medium text-gray-600 shadow-sm">Chọn file</button>
                      <input type="file" className="hidden" ref={docFileRef} onChange={handleDocFileChange} accept=".pdf,.jpg,.png,.jpeg" />
                    </div>
                  ) : scanState === 'scanning' ? (
                    <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 text-[#0070F4] font-bold text-sm mb-4">
                        <ScanSearch size={20} className="animate-pulse" /> AI đang kiểm tra chữ ký...
                      </div>
                      <div className="space-y-3 ml-2">
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Quét vùng: <span className="font-semibold underline underline-offset-2">Xác thực định dạng file</span></div>
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Quét vùng: <span className="font-semibold underline underline-offset-2">Nhận diện Tiêu đề đơn</span></div>
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Quét vùng: <span className="font-semibold underline underline-offset-2">Xác thực chữ ký Người làm đơn</span></div>
                      </div>
                    </div>
                  ) : scanState === 'error' ? (
                    <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                          <div className="bg-red-500 text-white rounded-full p-1"><X size={20} strokeWidth={3} /></div>
                          <div>
                            <h4 className="font-bold text-red-700">Tài liệu không hợp lệ!</h4>
                            <p className="text-xs text-red-600 mt-1">AI phát hiện có lỗi trong hồ sơ của bạn</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`bg-gray-50 border ${aiResult?.format_valid ? 'border-green-200' : 'border-red-200'} rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2`}>
                          <FileText size={20} className={aiResult?.format_valid ? "text-green-600" : "text-red-600"} />
                          <span className={`text-xs font-semibold ${aiResult?.format_valid ? 'text-green-800' : 'text-red-800'}`}>Định dạng File</span>
                          {aiResult?.format_valid ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                        </div>
                        <div className={`bg-gray-50 border ${aiResult?.title_valid ? 'border-green-200' : 'border-red-200'} rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2`}>
                          <ScanSearch size={20} className={aiResult?.title_valid ? "text-green-600" : "text-red-600"} />
                          <span className={`text-xs font-semibold ${aiResult?.title_valid ? 'text-green-800' : 'text-red-800'}`}>Tiêu đề đơn</span>
                          {aiResult?.title_valid ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                        </div>
                        <div className={`bg-gray-50 border ${aiResult?.signature_present ? 'border-green-200' : 'border-red-200'} rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2`}>
                          <User size={20} className={aiResult?.signature_present ? "text-green-600" : "text-red-600"} />
                          <span className={`text-xs font-semibold ${aiResult?.signature_present ? 'text-green-800' : 'text-red-800'}`}>Người làm đơn</span>
                          {aiResult?.signature_present ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                        </div>
                      </div>
                      <button onClick={() => docFileRef.current?.click()} className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Thử tải lại file khác</button>
                    </div>
                  ) : (
                    <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3">
                          <div className="bg-green-500 text-white rounded-full p-1"><Check size={20} strokeWidth={3} /></div>
                          <div>
                            <h4 className="font-bold text-green-700">Tài liệu hợp lệ!</h4>
                            <p className="text-xs text-green-600 mt-1">Đã phát hiện đủ 3 vùng chữ ký xác nhận</p>
                          </div>
                        </div>
                        <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><ScanSearch size={12} /> AI Vision</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2">
                          <FileText size={20} className="text-green-600" />
                          <span className="text-xs font-semibold text-green-800">Định dạng File</span>
                          <Check size={16} className="text-green-500" />
                        </div>
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2">
                          <ScanSearch size={20} className="text-green-600" />
                          <span className="text-xs font-semibold text-green-800">Tiêu đề đơn</span>
                          <Check size={16} className="text-green-500" />
                        </div>
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2">
                          <User size={20} className="text-green-600" />
                          <span className="text-xs font-semibold text-green-800">Chữ ký Người làm đơn</span>
                          <Check size={16} className="text-green-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {scanState === 'success' && currentStep === 3 && (
                    <button onClick={handleContinueToPreview} className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm shadow-sm mt-4">
                      Tiếp tục xem trước & Nộp hồ sơ <ChevronRight size={18} />
                    </button>
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
                      <span className="text-sm font-medium text-gray-800">Đơn xin nghỉ học tạm thời (Bản scan đã ký đủ 3 bên)</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 font-bold">
                      AI xác nhận <Check size={14} strokeWidth={3} />
                    </span>
                  </div>

                  {currentStep === 4 && (
                    <button 
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

            {/* ================= BƯỚC 5: THÀNH CÔNG & ĐIỀU HƯỚNG ================= */}
            {currentStep >= 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Hồ sơ xin nghỉ học tạm thời của bạn đã được gửi thành công đến hệ thống tiếp nhận của Phòng Đào tạo! Bạn có thể xem lại hoặc theo dõi tiến trình xử lý tại trang chi tiết hồ sơ.</p>
                  </div>
                </div>

                <div className="ml-12 border border-green-200 bg-green-50 rounded-xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="bg-green-500 text-white rounded-full p-3 mb-4"><CheckCircle2 size={40} /></div>
                    <h3 className="font-bold text-green-700 text-2xl mb-2">Nộp hồ sơ thành công!</h3>
                    <p className="text-green-600 text-sm mb-1">Mã hồ sơ của bạn là: <strong className="font-semibold text-lg ml-1">{trackingCode}</strong></p>
                    <p className="text-green-600/80 text-sm mb-8">Phòng Đào tạo sẽ rà soát và phản hồi trong vòng 3-5 ngày làm việc.</p>
                    
                    <button 
                      onClick={() => router.push(requestId ? `/student/submissions/${requestId}` : '/student/submissions')} 
                      className="px-6 py-3 bg-[#0070F4] text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                    >
                      <FileText size={18} /> Xem chi tiết và Theo dõi trạng thái
                    </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </ChatInterface>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300" 
             style={{ backgroundColor: toastMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${toastMessage.type === 'success' ? '#10B981' : '#EF4444'}` }}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          ) : (
            <AlertCircle className="h-5 w-5 text-[#EF4444]" />
          )}
          <span className={`text-sm font-medium ${toastMessage.type === 'success' ? 'text-[#065F46]' : 'text-[#991B1B]'}`}>
            {toastMessage.text}
          </span>
          <button onClick={() => setToastMessage(null)} className={`ml-4 ${toastMessage.type === 'success' ? 'text-[#065F46]' : 'text-[#991B1B]'} hover:opacity-70 transition-opacity`}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Restore Draft Confirmation Modal */}
      {draftToRestore && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="text-[#0070F4] h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Khôi phục bản nháp</h3>
            <p className="text-gray-600 mb-8 text-sm">
              Hệ thống tìm thấy một bản nháp bạn đang làm dở. Bạn có muốn khôi phục lại dữ liệu để tiếp tục không?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleIgnoreDraft}
                className="flex-1 py-2.5 border border-gray-400 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Tạo mới
              </button>
              <button 
                onClick={handleRestoreDraft}
                className="flex-1 py-2.5 bg-[#0070F4] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center gap-2"
              >
                <RefreshCw size={18} /> Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}