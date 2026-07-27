// frontend/app/student/procedures/major-change/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { 
  ArrowLeftRight, Bot, CheckCircle2, Upload, Check, ChevronRight, FileText, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMajorChangeProfile, MajorChangeProfile } from '@/services/major-change.service';
import axios from 'axios';

export default function MajorChangePage() {
  const router = useRouter();
  
  const [isStarted, setIsStarted] = useState(false);
  
  // Các bước: 1 - Upload | 2 - Form OCR | 3 - Kiểm tra điều kiện | 4 - Chọn ngành | 5 - Hoàn tất
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Trạng thái upload file
  const [file1Status, setFile1Status] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [file2Status, setFile2Status] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  
  const file1InputRef = useRef<HTMLInputElement>(null);
  const file2InputRef = useRef<HTMLInputElement>(null);
  
  // Dữ liệu OCR
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState<MajorChangeProfile | null>(null);

  // Trạng thái kiểm tra học vụ (Bước 3)
  const [isCheckingAcademic, setIsCheckingAcademic] = useState(false);
  const [academicChecked, setAcademicChecked] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, currentStep, file1Status, file2Status, isExtracting, academicChecked]);

  // Lắng nghe: Nếu cả 2 file tải lên xong thì tự động chạy AI OCR
  useEffect(() => {
    if (file1Status === 'done' && file2Status === 'done' && currentStep === 1) {
      setIsExtracting(true);
      getMajorChangeProfile().then((data) => {
        setFormData(data);
        setIsExtracting(false);
        setCurrentStep(2);
      });
    }
  }, [file1Status, file2Status, currentStep]);

  // Hành động các nút
  const handleStart = () => setIsStarted(true);
  const handleCancel = () => router.push('/student/dashboard');

  const handleUploadFile1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile1Status('uploading');
    try {
      const formData = new FormData(); formData.append('file', file);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/thoi-hoc/scan-major-change/`, formData);
      if (response.data.valid) setFile1Status('done');
      else setFile1Status('error');
    } catch {
      setFile1Status('error');
    } finally {
      if (file1InputRef.current) file1InputRef.current.value = '';
    }
  };

  const handleUploadFile2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile2Status('uploading');
    try {
      const formData = new FormData(); formData.append('file', file);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/thoi-hoc/scan-major-change/`, formData);
      if (response.data.valid) setFile2Status('done');
      else setFile2Status('error');
    } catch {
      setFile2Status('error');
    } finally {
      if (file2InputRef.current) file2InputRef.current.value = '';
    }
  };

  const handleConfirmData = () => {
    setCurrentStep(3);
    setIsCheckingAcademic(true);
    // Giả lập hệ thống đồng bộ dữ liệu mất 1.5s
    setTimeout(() => {
      setIsCheckingAcademic(false);
      setAcademicChecked(true);
    }, 1500);
  };

  const handleContinue = () => {
    setCurrentStep(4);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface
        title="Chuyển ngành"
        description="Đăng ký chuyển sang ngành học khác"
        Icon={ArrowLeftRight}
        welcomeMessage={
          <>Chào bạn, hệ thống Trường Đại học Kinh tế ghi nhận bạn đang chọn thủ tục <strong>chuyển ngành</strong>. Bạn có muốn đăng ký chuyển ngành không?</>
        }
        welcomePrimaryLabel="Đăng ký chuyển ngành"
        welcomeSecondaryLabel="Không, quay lại"
        onStart={handleStart}
        onCancel={handleCancel}
        isStarted={isStarted}
        headerBadge={isStarted ? (
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> AI đang hỗ trợ
          </span>
        ) : undefined}
      >
        {isStarted && (
          <div className="flex flex-col gap-8 mt-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ================= BƯỚC 1: YÊU CẦU TÀI LIỆU VÀ TẢI LÊN ================= */}
            {currentStep >= 1 && (
              <>
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Xin chào <strong>Thanh Hải</strong>, hệ thống ghi nhận bạn đang làm thủ tục <strong>xin chuyển ngành</strong>. Vui lòng cung cấp các tài liệu minh chứng đầu vào để hệ thống trích xuất thông tin nhé:
                    </p>
                  </div>
                </div>

                <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden p-5">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Khu vực tải tài liệu</h4>
                  
                  <div className="flex flex-col gap-3">
                    {/* TÀI LIỆU 1 */}
                    <div className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${file1Status === 'done' ? 'bg-green-50/30 border-green-300' : file1Status === 'error' ? 'bg-red-50/30 border-red-300' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                      <div className="flex items-center gap-4">
                        {file1Status === 'done' ? (
                          <div className="bg-green-500 text-white p-1.5 rounded-full"><Check size={16} strokeWidth={3}/></div>
                        ) : file1Status === 'error' ? (
                          <div className="bg-red-500 text-white p-1.5 rounded-full"><X size={16} strokeWidth={3}/></div>
                        ) : (
                          <div className="bg-gray-200 text-gray-500 p-1.5 rounded-full"><Upload size={16} /></div>
                        )}
                        <div>
                          <p className={`font-semibold text-sm ${file1Status === 'done' ? 'text-green-700' : file1Status === 'error' ? 'text-red-700' : 'text-gray-700'}`}>Tải lên Giấy báo trúng tuyển (PDF)</p>
                          <p className={`text-xs ${file1Status === 'done' ? 'text-green-600' : file1Status === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                            {file1Status === 'done' ? 'Đã tải lên thành công ✓' : file1Status === 'error' ? 'Tài liệu không hợp lệ, vui lòng thử lại' : 'Giay_Bao_Trung_Tuyen.pdf'}
                          </p>
                        </div>
                      </div>
                      
                      {(file1Status === 'idle' || file1Status === 'error') && (
                        <>
                          <button onClick={() => file1InputRef.current?.click()} className="text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md transition shadow-sm">
                            Tải lên
                          </button>
                          <input type="file" className="hidden" ref={file1InputRef} onChange={handleUploadFile1} accept=".pdf,.png,.jpg,.jpeg,.docx" />
                        </>
                      )}
                      {file1Status === 'uploading' && <span className="text-sm text-gray-500 animate-pulse font-medium">Đang tải...</span>}
                    </div>

                    {/* TÀI LIỆU 2 */}
                    <div className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${file2Status === 'done' ? 'bg-green-50/30 border-green-300' : file2Status === 'error' ? 'bg-red-50/30 border-red-300' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                      <div className="flex items-center gap-4">
                        {file2Status === 'done' ? (
                          <div className="bg-green-500 text-white p-1.5 rounded-full"><Check size={16} strokeWidth={3}/></div>
                        ) : file2Status === 'error' ? (
                          <div className="bg-red-500 text-white p-1.5 rounded-full"><X size={16} strokeWidth={3}/></div>
                        ) : (
                          <div className="bg-gray-200 text-gray-500 p-1.5 rounded-full"><Upload size={16} /></div>
                        )}
                        <div>
                          <p className={`font-semibold text-sm ${file2Status === 'done' ? 'text-green-700' : file2Status === 'error' ? 'text-red-700' : 'text-gray-700'}`}>Tải lên Bản scan Giấy CN Tốt nghiệp THPT</p>
                          <p className={`text-xs ${file2Status === 'done' ? 'text-green-600' : file2Status === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                            {file2Status === 'done' ? 'Đã tải lên thành công ✓' : file2Status === 'error' ? 'Tài liệu không hợp lệ, vui lòng thử lại' : 'Giay_Chung_Nhan_TN_THPT.pdf'}
                          </p>
                        </div>
                      </div>
                      
                      {(file2Status === 'idle' || file2Status === 'error') && (
                        <>
                          <button onClick={() => file2InputRef.current?.click()} className="text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md transition shadow-sm">
                            Tải lên
                          </button>
                          <input type="file" className="hidden" ref={file2InputRef} onChange={handleUploadFile2} accept=".pdf,.png,.jpg,.jpeg,.docx" />
                        </>
                      )}
                      {file2Status === 'uploading' && <span className="text-sm text-gray-500 animate-pulse font-medium">Đang tải...</span>}
                    </div>
                  </div>

                  {/* LOADING OCR */}
                  {isExtracting && (
                    <div className="mt-6 flex flex-col items-center justify-center p-6 border border-blue-100 bg-blue-50/50 rounded-xl">
                      <span className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></span>
                      <p className="text-sm font-semibold text-blue-700">AI đang quét và trích xuất dữ liệu...</p>
                      <p className="text-xs text-blue-500 mt-1">Vui lòng đợi trong giây lát</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ================= BƯỚC 2: FORM XÁC NHẬN OCR ================= */}
            {currentStep >= 2 && formData && (
              <div className="ml-12 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-[#F8FAFC] px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                    <div className="bg-[#1E293B] text-white rounded-full p-0.5"><Check size={14} /></div>
                    Đối chiếu dữ liệu — Có thể chỉnh sửa nếu AI đọc sai
                  </h3>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">Trích xuất tự động</span>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 mb-6">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Họ và tên</label>
                      <input type="text" defaultValue={formData.fullName} className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Mã số sinh viên</label>
                      <input type="text" defaultValue={formData.studentId} className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Ngày sinh</label>
                      <input type="text" defaultValue={formData.dob} className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Số CCCD/CMND</label>
                      <input type="text" defaultValue={formData.idNumber} className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Năm trúng tuyển</label>
                      <input type="text" defaultValue={formData.enrollmentYear} className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Ngành hiện tại</label>
                      <input type="text" defaultValue={formData.currentMajor} className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>

                  {currentStep === 2 && (
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleConfirmData} className="flex-1 bg-[#0070F4] text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm shadow-sm">
                        <Check size={18} /> Xác nhận thông tin chính xác
                      </button>
                      <button className="px-6 bg-white border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                        Tải lại
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 3: KIỂM TRA ĐIỀU KIỆN & TIẾP TỤC ================= */}
            {currentStep >= 3 && (
              <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 mt-2">
                
                {/* Banner trạng thái xác nhận */}
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 flex items-center gap-3 text-sm font-medium">
                  <div className="bg-green-500 text-white rounded-full p-0.5"><Check size={16} /></div>
                  Thông tin đã xác nhận — Đang kiểm tra tình trạng học vụ...
                </div>

                {/* AI Text check */}
                <div className="flex gap-4 items-start mt-2">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">
                      {isCheckingAcademic 
                        ? "Hệ thống đang đồng bộ dữ liệu với Phòng Đào tạo để kiểm tra tình trạng học vụ của bạn..." 
                        : "Tuyệt vời! Kết quả học vụ của bạn đã đáp ứng yêu cầu chuyển ngành đầu vào."}
                    </p>
                  </div>
                </div>

                {/* Card kết quả check điều kiện */}
                {academicChecked && (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-green-50/50 border border-green-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-green-500 text-white rounded-full p-1"><Check size={14} strokeWidth={3}/></div>
                          <h4 className="font-bold text-green-700 text-sm">Đạt điều kiện</h4>
                        </div>
                        <p className="text-gray-800 text-sm font-medium mb-3">Không thuộc diện bị buộc thôi học</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FileText size={14} /> Giấy XN không bị buộc thôi học
                        </div>
                      </div>

                      <div className="bg-green-50/50 border border-green-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-green-500 text-white rounded-full p-1"><Check size={14} strokeWidth={3}/></div>
                          <h4 className="font-bold text-green-700 text-sm">Đạt điều kiện</h4>
                        </div>
                        <p className="text-gray-800 text-sm font-medium mb-3">Không vi phạm kỷ luật</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FileText size={14} /> Giấy XN không vi phạm kỷ luật
                        </div>
                      </div>
                      
                    </div>

                    {currentStep === 3 && (
                      <button onClick={handleContinue} className="w-full bg-[#0070F4] text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm shadow-sm mt-2">
                        Tiếp tục <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= BƯỚC 4: CHỌN NGÀNH MỚI ================= */}
            {currentStep >= 4 && (
              <div className="ml-12 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 mt-2">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-4">Chọn ngành muốn chuyển đến</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngành đăng ký chuyển <span className="text-red-500">*</span></label>
                      {currentStep === 4 ? (
                        <select className="w-full border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                          <option value="">-- Chọn ngành --</option>
                          <option value="khmt">Khoa học Máy tính</option>
                          <option value="httt">Hệ thống Thông tin</option>
                          <option value="ktpm">Kỹ thuật Phần mềm</option>
                          <option value="mkt">Marketing</option>
                        </select>
                      ) : (
                        <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800">Khoa học Máy tính</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do xin chuyển ngành <span className="text-red-500">*</span></label>
                      {currentStep === 4 ? (
                        <textarea rows={3} className="w-full border border-gray-300 rounded-md p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white" placeholder="VD: Thấy bản thân phù hợp hơn..."></textarea>
                      ) : (
                        <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-sm text-gray-800 min-h-[80px]">Thấy bản thân phù hợp hơn...</div>
                      )}
                    </div>
                  </div>
                  {currentStep === 4 && (
                    <button onClick={() => setCurrentStep(5)} className="w-full bg-[#0070F4] text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-6 shadow-sm">
                      Xác nhận & Khởi tạo Đơn chuyển ngành
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 5: HOÀN TẤT ================= */}
            {currentStep >= 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
                <div className="bg-[#0070F4] text-white p-4 rounded-xl flex justify-center items-center gap-2 font-medium shadow-sm">
                  <CheckCircle2 size={20} /> Khởi tạo hồ sơ xin chuyển ngành thành công
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Hồ sơ xin chuyển ngành của bạn đã được ghi nhận! Hệ thống đã tạo Đơn xin chuyển ngành. Bạn hãy tải đơn về, xin ý kiến Phụ huynh và Lãnh đạo Khoa, sau đó nộp trực tiếp tại Phòng Đào tạo nhé.</p>
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