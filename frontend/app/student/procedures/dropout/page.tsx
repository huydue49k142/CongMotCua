"use client";

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { LogOut, Bot, AlertTriangle, Download, CheckCircle2, ChevronRight, UploadCloud, Loader2, Scan, Check, Clock, CircleDot, FileText, X, ScanSearch, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStudentProfile, StudentProfile, DropoutFormData } from '@/services/dropout.service';
import axios from 'axios';

export default function DropoutPage() {
  const router = useRouter();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isAgreed, setIsAgreed] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [aiResult, setAiResult] = useState<{format_valid?: boolean, title_valid?: boolean, signature_present?: boolean} | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');
  
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<DropoutFormData>({
    reason: '',
    expectedDate: '',
    contactAddress: '',
    notes: ''
  });

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

    // Lấy lý do từ formData hiện tại.
    const reason = formData.reason.trim();

    if (!reason) {
      throw new Error(
        "Vui lòng nhập lý do thôi học trước khi tải đơn."
      );
    }

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
          reason: reason,
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
    link.download = studentProfile?.student_id
      ? `Don_xin_thoi_hoc_${studentProfile.student_id}.docx`
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState('analyzing');
    setAiResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/thoi-hoc/scan-dropout/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAiResult(response.data);
      
      if (response.data.format_valid && response.data.title_valid && response.data.signature_present) {
        setUploadState('success');
      } else {
        setUploadState('error');
      }
    } catch (error) {
      console.error('Lỗi khi quét OCR:', error);
      setUploadState('error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePreviewBeforeSubmit = () => {
    setCurrentStep(5);
  };

  const handleSubmitFinal = async () => {
    setCurrentStep(6);
  };

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
                                  <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800">{formData.reason === 'ca_nhan' ? 'Lý do cá nhân' : formData.reason}</div>
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
                      <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-xs shrink-0">4</span><div><p className="font-medium text-sm text-gray-800">Ý kiến Lãnh đạo Khoa</p><p className="text-xs text-gray-500 mt-0.5">Nộp tại văn phòng Khoa để xin chữ ký xác nhận của Lãnh đạo Khoa.</p></div></div>
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

                        {/* Chỉ hiện nút tiếp tục nếu chưa qua bước 4 */}
                        {currentStep === 3 && (
                          <div className="flex items-center gap-4">
                            <button onClick={handleNextToUpload} className="flex-1 bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2">
                              Tiếp tục tải lên hồ sơ đã ký <ChevronRight size={18} />
                            </button>
                            <button className="text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap px-2 transition-colors">Lưu nháp và tạm dừng</button>
                          </div>
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
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Bạn đã xin đủ chữ ký? Tuyệt vời! Hãy tải lên bản scan hoặc chụp ảnh rõ nét của đơn để hệ thống kiểm tra nhé.</p>
                  </div>
                </div>

                <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {uploadState === 'idle' && (
                    <div onClick={triggerFileInput} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition ${currentStep === 4 ? 'border-blue-300 bg-blue-50/50 cursor-pointer hover:bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-60 cursor-default'}`}>
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3"><UploadCloud size={24} /></div>
                      <p className="font-semibold text-gray-800 text-sm">Tải lên file Đơn xin thôi học đã ký đủ ba bên</p>
                      <p className="text-xs text-gray-500 mt-1.5 mb-4">Kéo thả hoặc click để chọn file (.docx hoặc .pdf hoặc ảnh chụp rõ nét)</p>
                      <button disabled={currentStep > 4} className="bg-white border border-gray-300 rounded-md px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50">Chọn file</button>
                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" disabled={currentStep > 4}/>
                    </div>
                  )}

                  {uploadState === 'analyzing' ? (
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 text-blue-700 font-semibold text-sm mb-3">
                        <ScanSearch size={20} className="animate-pulse" /> AI đang kiểm tra chữ ký...
                      </div>
                      <div className="space-y-3 ml-2">
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Quét vùng: <span className="font-semibold underline underline-offset-2">Xác thực định dạng file</span></div>
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Quét vùng: <span className="font-semibold underline underline-offset-2">Nhận diện Tiêu đề đơn</span></div>
                        <div className="flex items-center gap-2 text-sm text-[#0070F4]"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Quét vùng: <span className="font-semibold underline underline-offset-2">Xác thực chữ ký Người làm đơn</span></div>
                      </div>
                    </div>
                  ) : uploadState === 'error' ? (
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
                      <button onClick={triggerFileInput} className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Thử tải lại file khác</button>
                    </div>
                  ) : uploadState === 'success' ? (
                    <>
                      <div className="border border-green-200 bg-green-50/80 rounded-xl p-5 shadow-sm animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <CheckCircle2 size={20} className="text-green-600"/> Tài liệu hợp lệ!
                          </div>
                          <span className="text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded flex items-center gap-1"><Scan size={14}/> AI Vision</span>
                        </div>
                        <p className="text-sm text-green-700 mb-4 font-medium">Đã phát hiện đủ các tiêu chí xác nhận</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-green-100/50 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5"><FileText className="text-green-600" size={18}/><span className="text-xs font-semibold text-green-800">Định dạng File</span><Check className="text-green-600" size={16} /></div>
                          <div className="bg-green-100/50 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5"><ScanSearch className="text-green-600" size={18}/><span className="text-xs font-semibold text-green-800">Tiêu đề đơn</span><Check className="text-green-600" size={16} /></div>
                          <div className="bg-green-100/50 border border-green-200 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5"><User className="text-green-600" size={18}/><span className="text-xs font-semibold text-green-800">Chữ ký Người làm đơn</span><Check className="text-green-600" size={16} /></div>
                        </div>
                      </div>

                      {currentStep === 4 && (
                        <button onClick={handlePreviewBeforeSubmit} className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-2">
                          Tiếp tục xem trước & Nộp hồ sơ <ChevronRight size={18} />
                        </button>
                      )}
                    </>
                  ) : null}
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
                
                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-lg border border-gray-200 mb-5">
                  <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                    <FileText size={18} className="text-gray-400"/> Đơn xin thôi học (Bản scan đã ký đủ 3 bên)
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                    AI xác nhận <Check size={14}/>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                  <div className="flex justify-between md:flex-col md:gap-1 border-b md:border-none border-gray-100 pb-2 md:pb-0"><span className="text-gray-500">Sinh viên:</span> <span className="font-semibold text-gray-800">{studentProfile.fullName}</span></div>
                  <div className="flex justify-between md:flex-col md:gap-1 border-b md:border-none border-gray-100 pb-2 md:pb-0"><span className="text-gray-500">MSSV:</span> <span className="font-semibold text-gray-800">{studentProfile.studentId}</span></div>
                  <div className="flex justify-between md:flex-col md:gap-1 border-b md:border-none border-gray-100 pb-2 md:pb-0"><span className="text-gray-500">Lý do:</span> <span className="font-semibold text-gray-800">{formData.reason === 'ca_nhan' ? 'Lý do cá nhân' : formData.reason}</span></div>
                  <div className="flex justify-between md:flex-col md:gap-1"><span className="text-gray-500">Ngày dự kiến:</span> <span className="font-semibold text-gray-800">{formData.expectedDate}</span></div>
                </div>

                {currentStep === 5 && (
                  <button onClick={handleSubmitFinal} className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-sm">
                    <CheckCircle2 size={18} /> Nộp toàn bộ hồ sơ
                  </button>
                )}
              </div>
            )}

            {/* --- BƯỚC 6: SUCCESS & TRACKING --- */}
            {currentStep >= 6 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#0070F4] text-white p-4 rounded-xl flex justify-center items-center gap-2 font-medium shadow-sm">
                  <CheckCircle2 size={20} /> Nộp toàn bộ hồ sơ thành công
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Hồ sơ xin thôi học của bạn đã được gửi thành công đến Phòng Đào tạo! Quyết định chính thức sẽ được ban hành sau khi Ban Giám hiệu phê duyệt.</p>
                  </div>
                </div>

                <div className="ml-12 border border-green-200 bg-green-50 rounded-xl p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-green-700 flex items-center gap-2"><CheckCircle2 size={20}/> Nộp hồ sơ thành công!</h3>
                    <p className="text-green-600 text-xs mt-1">Quyết định thôi học sẽ được cấp sau khi Ban Giám hiệu phê duyệt.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Mã hồ sơ</p>
                    <p className="font-bold text-gray-800">TH-2026-1707A</p>
                  </div>
                </div>

                <div className="ml-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  {/* NÚT ĐIỀU HƯỚNG TAB */}
                  <div className="flex border-b border-gray-200 text-sm font-medium">
                    <button 
                      onClick={() => setActiveTab('details')}
                      className={`flex-1 py-3 transition-colors ${activeTab === 'details' ? 'text-[#0070F4] border-b-2 border-[#0070F4]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Xem chi tiết hồ sơ
                    </button>
                    <button 
                      onClick={() => setActiveTab('tracking')}
                      className={`flex-1 py-3 transition-colors ${activeTab === 'tracking' ? 'text-[#0070F4] border-b-2 border-[#0070F4]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Theo dõi trạng thái
                    </button>
                  </div>
                  
                  {/* NỘI DUNG TỪNG TAB */}
                  {activeTab === 'details' && (
                    <div className="p-6 flex flex-col gap-6 animate-in fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mã hồ sơ</p>
                          <h4 className="font-bold text-gray-800 text-lg">TH-2026-1707A</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={12}/> Thời gian nộp: {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} — {new Date().toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">Đang chờ xử lý</span>
                      </div>

                      <div className="border-t border-dashed border-gray-200"></div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Thông tin sinh viên & Nội dung thôi học</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                          <div><p className="text-gray-500 text-xs mb-1">Người làm đơn</p><p className="font-semibold text-gray-800">{studentProfile?.fullName}</p></div>
                          <div><p className="text-gray-500 text-xs mb-1">Mã số sinh viên</p><p className="font-semibold text-gray-800">{studentProfile?.studentId}</p></div>
                          <div><p className="text-gray-500 text-xs mb-1">Lớp sinh viên</p><p className="font-semibold text-gray-800">{studentProfile?.classId}</p></div>
                          <div><p className="text-gray-500 text-xs mb-1">Ngành học</p><p className="font-semibold text-gray-800">{studentProfile?.major}</p></div>
                          <div><p className="text-gray-500 text-xs mb-1">Lý do thôi học</p><p className="font-semibold text-gray-800">{formData.reason === 'ca_nhan' ? 'Lý do cá nhân' : (formData.reason || 'Lý do cá nhân')}</p></div>
                          <div><p className="text-gray-500 text-xs mb-1">Ngày dự kiến thôi học</p><p className="font-semibold text-gray-800">{formData.expectedDate}</p></div>
                          <div className="md:col-span-2"><p className="text-gray-500 text-xs mb-1">Địa chỉ liên hệ</p><p className="font-semibold text-gray-800">{formData.contactAddress}</p></div>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-200"></div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Minh chứng & Dữ liệu đính kèm</h5>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3">
                            <FileText size={20} className="text-gray-400 mt-0.5"/>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Đơn xin thôi học (Bản scan/ảnh chụp)</p>
                              <p className="text-xs text-green-600 font-medium mt-1">AI đã kiểm duyệt: Đủ chữ ký của Người làm đơn, Ý kiến phụ huynh và Ý kiến Lãnh đạo Khoa</p>
                            </div>
                          </div>
                          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
                            <Download size={16} /> Tải về
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tracking' && (
                    <div className="p-6 animate-in fade-in">
                      <h4 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">Trực tuyến trình xử lý</h4>
                      
                      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                        <div className="relative pl-6">
                          <div className="absolute -left-[11px] top-0 bg-green-500 text-white rounded-full p-0.5 border-4 border-white"><Check size={14}/></div>
                          <h5 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            Hệ thống tiếp nhận hồ sơ <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Đã hoàn tất</span>
                          </h5>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock size={12}/> {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} — {new Date().toLocaleDateString('vi-VN')}</p>
                          <p className="text-xs text-gray-500 mt-1">Hệ thống đã ghi nhận Đơn xin thôi học và xác nhận AI kiểm duyệt hợp lệ.</p>
                        </div>

                        <div className="relative pl-6">
                          <div className="absolute -left-[11px] top-0 bg-white text-[#0070F4] rounded-full p-0.5"><CircleDot size={18}/></div>
                          <h5 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            Phòng Đào tạo rà soát hồ sơ <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full">Đang xử lý</span>
                          </h5>
                          <p className="text-xs text-gray-500 mt-1">Chuyên viên đang kiểm tra tính hợp lệ của chữ ký, đối chiếu thông tin sinh viên và xác minh tình trạng học phí.</p>
                        </div>

                        <div className="relative pl-6">
                          <div className="absolute -left-[11px] top-0 bg-white text-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold border-2 border-gray-200">3</div>
                          <h5 className="font-semibold text-gray-400 text-sm">Lãnh đạo Khoa & Ban Giám hiệu xét duyệt</h5>
                          <p className="text-xs text-gray-400 mt-1">Trình Ban Giám hiệu Trường Đại học Kinh tế xem xét và phê duyệt Quyết định thôi học chính thức.</p>
                        </div>
                        
                        <div className="relative pl-6">
                          <div className="absolute -left-[11px] top-0 bg-white text-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold border-2 border-gray-200">4</div>
                          <h5 className="font-semibold text-gray-400 text-sm">Hoàn tất & Cấp Quyết định</h5>
                          <p className="text-xs text-gray-400 mt-1">Phòng Đào tạo cập nhật trạng thái, gửi Quyết định thôi học bản mềm và xử lý các nghĩa vụ tài chính còn lại.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Div dùng để cuộn màn hình xuống cuối tự động */}
            <div ref={chatEndRef} />
          </div>
        )}
      </ChatInterface>
    </div>
  );
}