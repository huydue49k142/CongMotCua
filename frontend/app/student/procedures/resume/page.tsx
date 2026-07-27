"use client";

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { 
  PlayCircle, Bot, Check, ChevronRight, Plus, Trash2, 
  Download, UploadCloud, FileText, CheckCircle2, Clock, CircleDot, AlertCircle, LayoutList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getResumeProfile, ResumeProfile } from '@/services/resume.service';

interface CourseForm {
  id: number;
  code: string;
  name: string;
  credits: string;
}

export default function ResumePage() {
  const router = useRouter();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  
  const [courses, setCourses] = useState<CourseForm[]>([
    { id: 1, code: 'CS101', name: 'Nhập môn Lập trình', credits: '3' },
    { id: 2, code: 'MATH101', name: 'Giải tích 1', credits: '3' },
    { id: 3, code: 'ENG101', name: 'Tiếng Anh 1', credits: '2' },
  ]);

  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'downloaded'>('idle');
  const [showUploadAI, setShowUploadAI] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [isStarted, currentStep, courses.length, downloadState, showUploadAI]);

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

  const handleAddCourse = () => setCourses([...courses, { id: Date.now(), code: '', name: '', credits: '' }]);
  const handleRemoveCourse = (id: number) => {
    if (courses.length > 1) setCourses(courses.filter(course => course.id !== id));
  };
  const handleChangeCourse = (id: number, field: keyof CourseForm, value: string) => {
    setCourses(courses.map(course => course.id === id ? { ...course, [field]: value } : course));
  };

  const handleSubmitCourses = () => setCurrentStep(3);

  // LOGIC ĐÃ SỬA: Tải đơn thật
  const handleDownloadDoc = () => {
    if (downloadState !== 'idle') return;
    
    setDownloadState('downloading');
    
    // Tải file thật
    const fileUrl = '/bieu-mau/don-xin-tro-lai-hoc.docx';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'Don_xin_tro_lai_hoc.docx'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setDownloadState('downloaded');
      setTimeout(() => {
        setShowUploadAI(true);
      }, 1000);
    }, 1500);
  };

  const triggerFileInput = () => {
    if (currentStep > 3) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentStep(4);
  };

  const handleSubmitFinal = () => setCurrentStep(5);

  const totalCredits = courses.reduce((sum, course) => sum + (parseInt(course.credits) || 0), 0);

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
                    <span className="text-xs text-gray-400">{courses.length} học phần</span>
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
                        <input type="text" placeholder="VD: CS101" value={course.code} onChange={(e) => handleChangeCourse(course.id, 'code', e.target.value)} disabled={currentStep > 2} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50" />
                        
                        <div className="md:hidden text-xs font-semibold text-gray-400 uppercase mt-2 mb-1">Tên học phần</div>
                        <input type="text" placeholder="VD: Giải tích 1" value={course.name} onChange={(e) => handleChangeCourse(course.id, 'name', e.target.value)} disabled={currentStep > 2} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50" />
                        
                        <div className="md:hidden text-xs font-semibold text-gray-400 uppercase mt-2 mb-1">Số TC</div>
                        <div className="flex items-center gap-4">
                          <input type="number" min="1" max="5" placeholder="3" value={course.credits} onChange={(e) => handleChangeCourse(course.id, 'credits', e.target.value)} disabled={currentStep > 2} className="w-full text-center border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50" />
                          {courses.length > 1 && currentStep === 2 && (
                            <button onClick={() => handleRemoveCourse(course.id)} className="text-red-400 hover:text-red-600 transition-colors p-2"><Trash2 size={18} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentStep === 2 && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
                      <button onClick={handleAddCourse} className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"><Plus size={16} /> Thêm học phần</button>
                      <button onClick={handleSubmitCourses} className="w-full md:w-auto px-6 py-2.5 bg-[#0070F4] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                        Lưu danh sách & Khởi tạo đơn <ChevronRight size={16} />
                      </button>
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
                    <p className="text-gray-600 text-sm">Tuyệt vời! Hệ thống đã ráp toàn bộ thông tin của bạn vào <strong>Đơn xin trở lại học tập</strong>. Để hoàn tất, bạn vui lòng tải file Word này về, mở lên và chèn chữ ký (hoặc gõ rõ họ tên) trực tiếp vào file nhé.</p>
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
                          <p className="text-xs text-gray-600 font-medium">Ký hoặc ghi rõ họ tên tại mục "Người làm đơn"</p>
                          <p className="text-[10px] text-gray-400 mt-1">(Có thể chèn thêm chữ ký của Phụ huynh nếu cần)</p>
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
                      <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[80%]">
                        <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                        <p className="text-gray-600 text-sm">Sau khi đã ký xong trên file Word, bạn hãy tải file đó lên đây để nộp về <strong>Phòng Đào tạo</strong> nhé.</p>
                      </div>
                    </div>

                    <div className="ml-12 animate-in fade-in slide-in-from-bottom-4">
                      {currentStep === 3 ? (
                        <div onClick={triggerFileInput} className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition bg-white">
                          <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3"><UploadCloud size={24} /></div>
                          <p className="font-semibold text-gray-800 text-sm mb-1">Tải lên file Đơn xin trở lại học tập đã ký</p>
                          <p className="text-xs text-gray-400 mb-4">Kéo thả hoặc click để chọn file (.docx hoặc .pdf)</p>
                          <button className="bg-white border border-gray-200 rounded-md px-5 py-2 text-sm font-medium text-gray-600 shadow-sm">Chọn file</button>
                          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.doc" />
                        </div>
                      ) : null}
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
                  <div className="flex items-center justify-between bg-green-50/50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-800">Đơn xin trở lại học tập (File sinh viên vừa tải lên)</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      Đã ký <Check size={14} />
                    </span>
                  </div>

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
                    <button onClick={handleSubmitFinal} className="w-full bg-[#0070F4] text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-2 shadow-sm text-sm">
                      Nộp hồ sơ về Phòng Đào tạo <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================= BƯỚC 5: SUCCESS & TRACKING ================= */}
            {currentStep >= 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0070F4] p-2 rounded-full text-white shrink-0"><Bot size={24} /></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-[90%]">
                    <p className="text-gray-700 font-medium text-sm mb-1">Trợ lý AI</p>
                    <p className="text-gray-600 text-sm">Hồ sơ xin trở lại học tập của bạn đã được gửi thành công đến hệ thống tiếp nhận của Phòng Đào tạo! Bạn có thể xem lại hoặc theo dõi tiến trình xử lý tại đây.</p>
                  </div>
                </div>

                <div className="ml-12 border border-green-200 bg-green-50 rounded-xl p-5 shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 text-white rounded-full p-1.5"><CheckCircle2 size={24} /></div>
                    <div>
                      <h3 className="font-bold text-green-700">Nộp hồ sơ thành công!</h3>
                      <p className="text-green-600 text-xs mt-0.5">Phòng Đào tạo sẽ xem xét trong vòng <strong className="font-semibold">3-5 ngày làm việc.</strong></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Mã hồ sơ</p>
                    <p className="font-bold text-gray-800">TLHT-2026-1707A</p>
                  </div>
                </div>

                <div className="ml-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex border-b border-gray-200 text-sm font-medium">
                    <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 transition-colors ${activeTab === 'details' ? 'text-[#0070F4] border-b-2 border-[#0070F4]' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}>
                      Xem chi tiết hồ sơ
                    </button>
                    <button onClick={() => setActiveTab('tracking')} className={`flex-1 py-4 transition-colors ${activeTab === 'tracking' ? 'text-[#0070F4] border-b-2 border-[#0070F4]' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}>
                      Theo dõi trạng thái
                    </button>
                  </div>
                  
                  {activeTab === 'details' && (
                    <div className="p-6 flex flex-col gap-6 animate-in fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mã hồ sơ</p>
                          <h4 className="font-bold text-gray-800 text-lg">TLHT-2026-1707A</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={12}/> Thời gian nộp: 22:12 — {new Date().toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">Đang chờ xử lý</span>
                      </div>

                      <div className="border-t border-dashed border-gray-200"></div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Thông tin sinh viên & Dữ liệu tham chiếu</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                          <div><p className="text-gray-400 text-xs mb-1">Người làm đơn</p><p className="font-semibold text-gray-800">{profile?.fullName}</p></div>
                          <div><p className="text-gray-400 text-xs mb-1">Mã số sinh viên</p><p className="font-semibold text-gray-800">{profile?.studentId}</p></div>
                          <div><p className="text-gray-400 text-xs mb-1">Lớp sinh viên</p><p className="font-semibold text-gray-800">{profile?.classId}</p></div>
                          <div className="md:col-span-2"><p className="text-gray-400 text-xs mb-1">Căn cứ trở lại học tập</p><p className="font-semibold text-gray-800">Quyết định số {profile?.reservedDecisionNo}, ban hành ngày {profile?.reservedDate}</p></div>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-200"></div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Minh chứng & Tài liệu đính kèm</h5>
                        
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-gray-400"/>
                            <p className="text-sm font-medium text-gray-700">Đơn xin trở lại học tập (Bản đã ký)</p>
                          </div>
                          <button className="flex items-center gap-1 text-sm font-bold text-[#0070F4] hover:text-blue-700 whitespace-nowrap">
                            <Download size={16} /> Tải về
                          </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="flex items-center gap-3 bg-gray-50 p-4 border-b border-gray-200">
                            <LayoutList size={18} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Danh sách Thời khóa biểu dự kiến</span>
                          </div>
                          <div className="p-4">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <tr>
                                  <th className="pb-2 font-medium">Mã HP</th>
                                  <th className="pb-2 font-medium">Tên học phần</th>
                                  <th className="pb-2 font-medium text-right">Số TC</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courses.map((c, i) => (
                                  <tr key={i} className="border-b border-gray-50 last:border-none">
                                    <td className="py-3 text-gray-700">{c.code || '-'}</td>
                                    <td className="py-3 text-gray-700">{c.name || '-'}</td>
                                    <td className="py-3 text-gray-700 text-right">{c.credits || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="border-t border-gray-200">
                                <tr>
                                  <td colSpan={2} className="py-3 text-right font-medium text-gray-600">Tổng cộng:</td>
                                  <td className="py-3 text-right font-bold text-gray-900">{totalCredits} TC</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {activeTab === 'tracking' && (
                    <div className="p-6 animate-in fade-in">
                      <h4 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">Trực tuyến trình xử lý</h4>
                      
                      <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-8">
                        <div className="relative pl-8">
                          <div className="absolute -left-[17px] top-0 bg-green-500 text-white rounded-full p-1.5 border-4 border-white shadow-sm"><Check size={16} strokeWidth={3}/></div>
                          <h5 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            Hệ thống tiếp nhận hồ sơ <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Đã hoàn tất</span>
                          </h5>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock size={12}/> 02:08 — {new Date().toLocaleDateString('vi-VN')}</p>
                          <p className="text-sm text-gray-600 mt-2">Hệ thống đã ghi nhận Đơn xin trở lại học tập và Danh sách học phần.</p>
                        </div>

                        <div className="relative pl-8">
                          <div className="absolute -left-[17px] top-0 bg-white text-[#0070F4] rounded-full p-0.5 border-4 border-white"><CircleDot size={22} strokeWidth={3}/></div>
                          <h5 className="font-semibold text-[#0070F4] text-sm flex items-center gap-2">
                            Phòng Đào tạo rà soát hồ sơ <span className="bg-blue-50 text-[#0070F4] border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Đang xử lý</span>
                          </h5>
                          <p className="text-sm text-gray-600 mt-2">Chuyên viên đang kiểm tra tính hợp lệ của chữ ký và đối chiếu Quyết định bảo lưu.</p>
                        </div>

                        <div className="relative pl-8">
                          <div className="absolute -left-[17px] top-0 bg-white text-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-gray-200 shadow-sm">3</div>
                          <h5 className="font-semibold text-gray-400 text-sm pt-1.5">Lãnh đạo Khoa & Ban Giám hiệu xét duyệt</h5>
                          <p className="text-sm text-gray-400 mt-2">Phê duyệt yêu cầu trở lại học tập chính thức.</p>
                        </div>
                        
                        <div className="relative pl-8">
                          <div className="absolute -left-[17px] top-0 bg-white text-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-gray-200 shadow-sm">4</div>
                          <h5 className="font-semibold text-gray-400 text-sm pt-1.5">Hoàn tất cập nhật & Xếp lớp</h5>
                          <p className="text-sm text-gray-400 mt-2">Phòng Đào tạo cập nhật tên vào danh sách lớp và mở cổng đăng ký tín chỉ theo thời khóa biểu dự kiến.</p>
                        </div>
                      </div>

                      <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="text-red-600 font-bold text-sm flex items-center gap-2 mb-2"><AlertCircle size={18}/> Thông báo từ Phòng Đào tạo</h5>
                        <p className="text-red-500 text-sm font-medium ml-6">Yêu cầu bổ sung: Chữ ký trên file Word bị lỗi hiển thị, vui lòng ký và tải lại file.</p>
                      </div>
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