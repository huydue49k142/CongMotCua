"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, 
  FileText, Paperclip, Ban, Edit3, Loader2, Download
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
        description: 'Hồ sơ không đủ điều kiện xét duyệt. Vui lòng kiểm tra lại quy định hoặc liên hệ Phòng Đào tạo để được hướng dẫn thêm.'
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
        description: 'Hồ sơ đang thiếu hoặc sai lệch thông tin. Yêu cầu sinh viên nộp lại giấy tờ bị thiếu theo ghi chú.'
      };
    case 'PENDING_REVIEW':
    case 'IN_PROGRESS':
    case 'DRAFT':
    default:
      return {
        label: 'Đang chờ xử lý',
        topBar: 'bg-[#0070F4]',
        iconBg: 'bg-blue-50',
        iconColor: 'text-[#0070F4]',
        textColor: 'text-[#0070F4]',
        border: 'border-blue-200',
        Icon: Clock,
        description: 'Hồ sơ đã được ghi nhận và đang trong quá trình rà soát bởi Phòng Đào tạo.'
      };
  }
};

export default function StaffRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<DetailedRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionModal, setActionModal] = useState<{isOpen: boolean; action: 'REJECT' | 'REQUEST_INFO' | null}>({isOpen: false, action: null});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await requestService.getStaffRequestDetail(id);
      setRequest(data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hồ sơ:', error);
      alert('Không thể tải dữ liệu hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt hồ sơ này? Hành động này không thể hoàn tác.')) return;
    submitAction('APPROVE');
  };

  const submitAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    if (action !== 'APPROVE' && !notes.trim()) return;
    setSubmitting(true);
    try {
      await requestService.updateRequestStatus(id, action, notes);
      setActionModal({isOpen: false, action: null});
      setNotes('');
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi xử lý hồ sơ:', error);
      alert('Có lỗi xảy ra khi xử lý.');
    } finally {
      setSubmitting(false);
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
  
  const canAction = ['PENDING_REVIEW', 'IN_PROGRESS'].includes(request.status);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6 px-8 pt-8">
        <h1 className="text-xl font-medium text-slate-800 flex items-center">
          <span className="text-xs text-slate-500 font-bold tracking-wider mr-2 uppercase">MÃ HỒ SƠ {shortId}</span>
          <span className="font-bold text-slate-900 text-2xl">Chi tiết hồ sơ {typeLabel}</span>
        </h1>
        
        <div className="flex items-center gap-3">
          {canAction && (
            <>
              <button 
                onClick={() => setActionModal({isOpen: true, action: 'REJECT'})}
                className="bg-[#C5221F] text-white hover:bg-red-800 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition"
              >
                <Ban size={16} /> Từ chối
              </button>
              <button 
                onClick={() => setActionModal({isOpen: true, action: 'REQUEST_INFO'})}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition shadow-sm"
              >
                <Edit3 size={16} /> Yêu cầu bổ sung
              </button>
              <button 
                onClick={handleApprove}
                disabled={submitting}
                className="bg-[#22C55E] text-white hover:bg-green-600 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Phê duyệt'}
              </button>
            </>
          )}
          <button 
            onClick={() => router.push('/staff')} 
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
          <div className="p-10 flex flex-col items-center text-center relative">
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
              <div className="mt-6 w-full max-w-2xl bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Lý do từ Phòng Đào tạo</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{request.history[0]?.notes}</p>
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

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.action && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center relative">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${actionModal.action === 'REJECT' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {actionModal.action === 'REJECT' ? 'Xác nhận từ chối hồ sơ' : 'Yêu cầu bổ sung hồ sơ'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {actionModal.action === 'REJECT' ? 'Vui lòng nhập lý do từ chối để thông báo cho sinh viên biết.' : 'Nhập thông tin cần bổ sung cho sinh viên.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActionModal({isOpen: false, action: null})}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                LÝ DO {actionModal.action === 'REJECT' ? 'TỪ CHỐI' : 'YÊU CẦU BỔ SUNG'} <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm text-gray-900 bg-white"
                placeholder="Nhập lý do chi tiết..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>

              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />
                <p className="text-xs text-red-700 leading-relaxed">
                  <strong>Hành động này không thể hoàn tác.</strong> Hồ sơ sẽ được chuyển sang trạng thái 
                  {actionModal.action === 'REJECT' ? ' Từ chối ' : ' Yêu cầu bổ sung '} 
                  và sinh viên sẽ nhận được thông báo ngay lập tức.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setActionModal({isOpen: false, action: null})}
                className="px-5 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-200 transition text-sm"
              >
                Hủy bỏ
              </button>
              <button 
                disabled={!notes.trim() || submitting}
                onClick={() => submitAction(actionModal.action!)}
                className={`px-5 py-2 rounded-md font-medium text-white transition text-sm flex items-center gap-2 ${
                  !notes.trim() ? 'bg-gray-400 cursor-not-allowed' : 
                  actionModal.action === 'REJECT' ? 'bg-[#C5221F] hover:bg-red-800' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : 
                 actionModal.action === 'REJECT' ? <><Ban size={16}/> Xác nhận từ chối</> : <><Edit3 size={16}/> Xác nhận yêu cầu</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
