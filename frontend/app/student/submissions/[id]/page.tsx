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
    case 'DELETED':
      return {
        label: 'Đã xóa',
        topBar: 'bg-gray-500',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-700',
        border: 'border-gray-200',
        Icon: Ban,
        description: 'Hồ sơ này đã được xóa.'
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
    case 'PENDING':
    case 'DRAFT':
    default:
      return {
        label: 'Đang chờ tiếp nhận',
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

const getStatusBadgeDesign = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return { label: 'TRẠNG THÁI: ĐÃ DUYỆT', color: 'bg-emerald-600 text-white' };
    case 'REJECTED':
      return { label: 'TRẠNG THÁI: TỪ CHỐI', color: 'bg-[#C5221F] text-white' };
    case 'DELETED':
      return { label: 'TRẠNG THÁI: ĐÃ XÓA', color: 'bg-gray-500 text-white' };
    case 'ADDITIONAL_INFO_REQUIRED':
      return { label: 'TRẠNG THÁI: YÊU CẦU BỔ SUNG', color: 'bg-orange-500 text-white' };
    case 'PENDING':
    default:
      return { label: 'TRẠNG THÁI: CHỜ TIẾP NHẬN', color: 'bg-[#0070F4] text-white' };
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



  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  if (!request) {
    return <div className="p-10 text-center text-gray-500">Không tìm thấy thông tin hồ sơ.</div>;
  }

  const typeLabel = getRequestTypeLabel(request.request_type);
  const shortId = `HS${request.id.split('-')[0].toUpperCase()}`;

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
              onClick={() => router.push(`/student/submissions/${id}/resubmit`)}
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
        {/* Information Box */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-[#18538E] uppercase text-sm tracking-wide">
              THÔNG TIN CHI TIẾT HỒ SƠ
            </h3>
            <span className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeDesign(request.status).color}`}>
              {getStatusBadgeDesign(request.status).label}
            </span>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Mã hồ sơ</p>
                <p className="font-bold text-[#18538E] text-sm">{shortId}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">Loại yêu cầu</p>
                <p className="font-semibold text-[#18538E] text-sm">{typeLabel}</p>
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
              
              {['REJECTED', 'DELETED', 'ADDITIONAL_INFO_REQUIRED'].includes(request.status) && request.history.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5 tracking-wide uppercase">
                    {request.status === 'ADDITIONAL_INFO_REQUIRED' ? 'Lý do yêu cầu bổ sung' : 'Lý do từ chối'}
                  </p>
                  <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm italic">
                    "{request.history[0]?.notes}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}