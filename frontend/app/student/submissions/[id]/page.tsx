"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, 
  FileText, Paperclip, Ban, UploadCloud, Loader2, PlayCircle
} from 'lucide-react';
import { requestService, DetailedRequest } from '@/services/request.service';

const getRequestTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'MAJOR_CHANGE': 'Chuyển ngành',
    'ACADEMIC_LEAVE': 'Bảo lưu',
    'RESUME_STUDIES': 'Xin học tiếp',
    'DROPOUT': 'Thôi học'
  };
  return map[type] || type;
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Đã phê duyệt',
        topBar: 'bg-emerald-600',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-700',
        border: 'border-emerald-200',
        Icon: CheckCircle2,
        description: 'Quyết định phê duyệt đã được lưu trữ vào hệ thống và tự động gửi thông báo xác nhận đến cổng thông tin sinh viên và email cá nhân.'
      };
    case 'REJECTED':
    case 'CANCELLED':
      return {
        label: 'Đã từ chối',
        topBar: 'bg-red-600',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        textColor: 'text-red-600',
        border: 'border-red-200',
        Icon: Ban,
        description: 'Hồ sơ của bạn không đủ điều kiện xét duyệt. Vui lòng kiểm tra lại quy định hoặc liên hệ Phòng Đào tạo để được hướng dẫn thêm.'
      };
    case 'ADDITIONAL_INFO_REQUIRED':
      return {
        label: 'Yêu cầu bổ sung',
        topBar: 'bg-orange-500',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        textColor: 'text-orange-600',
        border: 'border-orange-200',
        Icon: AlertCircle,
        description: 'Hồ sơ của bạn đang thiếu hoặc sai lệch thông tin. Vui lòng nộp lại giấy tờ bị thiếu theo yêu cầu của chuyên viên.'
      };
    case 'PENDING_REVIEW':
    case 'IN_PROGRESS':
    case 'DRAFT':
    default:
      return {
        label: 'Đang chờ xử lý',
        topBar: 'bg-blue-600',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-600',
        border: 'border-blue-200',
        Icon: Clock,
        description: 'Hồ sơ của bạn đã được ghi nhận và đang trong quá trình rà soát bởi Phòng Đào tạo. Vui lòng theo dõi email để nhận thông báo mới nhất.'
      };
  }
};

const getMockFiles = (type: string) => {
  if (type === 'RESUME_STUDIES') return ['Don_xin_tro_lai_hoc_tap.pdf'];
  if (type === 'DROPOUT') return ['Don_xin_thoi_hoc.pdf'];
  if (type === 'MAJOR_CHANGE') return ['Don_xin_chuyen_nganh.pdf', 'Bang_diem_tich_luy.pdf'];
  if (type === 'ACADEMIC_LEAVE') return ['Don_xin_bao_luu.pdf', 'Minh_chung_hoan_canh.pdf'];
  return ['Tai_lieu_dinh_kem.pdf'];
};

export default function StudentRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<DetailedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await requestService.getStudentRequestDetail(id);
      setRequest(data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hồ sơ:', error);
      alert('Không thể tải dữ liệu hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResubmitFile(file);
  };

  const handleResubmit = async () => {
    if (!resubmitFile) return;
    setResubmitting(true);
    try {
      await requestService.resubmitRequestFiles(id, resubmitFile);
      setIsResubmitModalOpen(false);
      setResubmitFile(null);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi tải file bổ sung:', error);
      alert('Có lỗi xảy ra khi nộp file bổ sung.');
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  if (!request) {
    return <div className="p-10 text-center text-gray-500">Không tìm thấy thông tin hồ sơ.</div>;
  }

  const typeLabel = getRequestTypeLabel(request.request_type);
  const shortId = `HS${request.id.split('-')[0].toUpperCase()}`;
  const statusConfig = getStatusConfig(request.status);
  const files = getMockFiles(request.request_type);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-8 pt-8">
        <h1 className="text-xl font-medium text-slate-800 flex items-center">
          <span className="text-xs text-slate-500 font-bold tracking-wider mr-2 uppercase">MÃ HỒ SƠ {shortId}</span>
          <span className="font-bold text-slate-900 text-2xl">Chi tiết hồ sơ {typeLabel}</span>
        </h1>
        
        <div className="flex items-center gap-3">
          {request.status === 'ADDITIONAL_INFO_REQUIRED' && (
            <button 
              onClick={() => setIsResubmitModalOpen(true)}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2 shadow-sm"
            >
              <UploadCloud size={16} /> Bổ sung hồ sơ
            </button>
          )}
          <button 
            onClick={() => router.push('/student/submissions')} 
            className="px-5 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm text-black"
          >
             Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="px-8 pb-12">
        {/* Status Box */}
        <div className={`bg-white rounded-xl shadow-sm border ${statusConfig.border} mb-6 overflow-hidden`}>
          <div className={`h-1.5 w-full ${statusConfig.topBar}`}></div>
          <div className="p-10 flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${statusConfig.iconBg} ${statusConfig.iconColor}`}>
              <statusConfig.Icon size={32} strokeWidth={2.5} />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${statusConfig.textColor}`}>
              Hệ thống đã cập nhật trạng thái: {statusConfig.label}
            </h2>
            <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
              {statusConfig.description}
            </p>
            
            {/* Display Reason if Rejected or Need Info */}
            {['REJECTED', 'CANCELLED', 'ADDITIONAL_INFO_REQUIRED'].includes(request.status) && request.history.length > 0 && (
              <div className="mt-6 w-full max-w-2xl bg-slate-50 p-4 rounded-lg border border-slate-200 text-left relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-400 rounded-l-lg"></div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase ml-2">Phản hồi từ Phòng Đào tạo</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap ml-2 font-medium">{request.history[0]?.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-[#18538E] flex items-center gap-2">
              <FileText size={18} /> Thông tin hồ sơ
            </h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">
              {typeLabel}
            </span>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Mã hồ sơ</p>
                <p className="font-bold text-[#18538E] text-sm">{shortId}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Phòng ban xử lý</p>
                <p className="font-semibold text-slate-800 text-sm">Phòng Đào tạo (P.ĐT)</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Họ và tên sinh viên</p>
                <p className="font-bold text-slate-800 text-sm">{request.student_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Ngày tiếp nhận</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {new Date(request.submitted_at || request.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Mã số sinh viên</p>
                <p className="font-semibold text-slate-800 text-sm">{request.student_code}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 tracking-wide uppercase">Tài liệu đính kèm</p>
                <div className="flex flex-col gap-2">
                  {request.documents && request.documents.length > 0 ? (
                    request.documents.map((doc, i) => (
                      <a 
                        key={i} 
                        href={doc.file} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4F9FE] hover:bg-[#EBF1F9] border border-[#EBF1F9] rounded-md text-xs font-semibold text-[#18538E] w-fit transition-colors"
                      >
                        <Paperclip size={14} /> 
                        {doc.file_name} 
                        {doc.document_type === 'SUPPLEMENTARY' && <span className="text-orange-500 ml-1 font-normal">(Hồ sơ bổ sung)</span>}
                      </a>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">Không có tài liệu đính kèm</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resubmit Modal */}
      {isResubmitModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center relative">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Bổ sung hồ sơ</h3>
                  <p className="text-sm text-slate-500">Vui lòng tải lên tài liệu minh chứng theo yêu cầu.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsResubmitModalOpen(false);
                  setResubmitFile(null);
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex flex-col items-center">
              {!resubmitFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 transition"
                >
                  <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3"><UploadCloud size={24} /></div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">Tải lên file minh chứng</p>
                  <p className="text-xs text-gray-400">Click để chọn file (.pdf, .docx, .jpg)</p>
                </div>
              ) : (
                <div className="w-full bg-white border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center relative">
                  <button 
                    onClick={() => setResubmitFile(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <XCircle size={20} />
                  </button>
                  <div className="bg-green-50 text-green-500 p-3 rounded-full mb-3"><CheckCircle2 size={24} /></div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{resubmitFile.name}</p>
                  <p className="text-xs text-gray-400">Đã chọn file thành công</p>
                </div>
              )}
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.docx,.doc,.jpg,.png" />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsResubmitModalOpen(false);
                  setResubmitFile(null);
                }}
                className="px-5 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-200 transition text-sm"
              >
                Hủy bỏ
              </button>
              <button 
                disabled={!resubmitFile || resubmitting}
                onClick={handleResubmit}
                className={`px-5 py-2 rounded-md font-medium text-white transition text-sm flex items-center gap-2 ${
                  !resubmitFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {resubmitting ? <Loader2 className="animate-spin" size={16} /> : <><UploadCloud size={16}/> Gửi file bổ sung</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
