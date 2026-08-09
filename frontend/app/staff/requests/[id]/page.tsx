"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock,
  FileText, Paperclip, Ban, Edit3, Loader2, Download,
  Info, AlertTriangle, X, Send
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
    case 'DELETED':
      return {
        label: 'Từ chối / Đã xóa',
        topBar: 'bg-red-600',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        textColor: 'text-red-600',
        border: 'border-red-200',
        Icon: Ban,
        description: 'Hồ sơ đã bị từ chối hoặc đã bị xóa.'
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
    case 'PENDING':
    case 'DRAFT':
    default:
      return {
        label: 'Đang chờ tiếp nhận',
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


type SupplementDocumentOption = {
  document_key: string;
  document_name: string;
};

const SUPPLEMENT_DOCUMENTS_BY_REQUEST_TYPE: Record<string, SupplementDocumentOption[]> = {
  MAJOR_CHANGE: [
    {
      document_key: 'MAJOR_CHANGE_SIGNED_APPLICATION',
      document_name: 'Đơn xin chuyển ngành đã ký',
    },
    {
      document_key: 'MAJOR_CHANGE_ADMISSION_LETTER',
      document_name: 'Giấy báo trúng tuyển',
    },
    {
      document_key: 'MAJOR_CHANGE_GRADUATION_CERTIFICATE',
      document_name: 'Giấy chứng nhận tốt nghiệp THPT',
    },
    {
      document_key: 'MAJOR_CHANGE_OTHER_EVIDENCE',
      document_name: 'Minh chứng khác',
    },
  ],
  ACADEMIC_LEAVE: [
    {
      document_key: 'ACADEMIC_LEAVE_SIGNED_APPLICATION',
      document_name: 'Đơn bảo lưu đã ký',
    },
    {
      document_key: 'ACADEMIC_LEAVE_EVIDENCE',
      document_name: 'Minh chứng bảo lưu',
    },
  ],
  RESUME_STUDIES: [
    {
      document_key: 'RESUME_SIGNED_APPLICATION',
      document_name: 'Đơn học tiếp đã ký',
    },
  ],
  DROPOUT: [
    {
      document_key: 'DROPOUT_SIGNED_APPLICATION',
      document_name: 'Đơn thôi học đã ký',
    },
  ],
};

const getSupplementDocumentOptions = (requestType: string) =>
  SUPPLEMENT_DOCUMENTS_BY_REQUEST_TYPE[requestType] || [];

const REJECT_REASON_SUGGESTIONS = [
  'Thiếu minh chứng gốc',
  'Không đủ điều kiện điểm số',
  'Hồ sơ quá hạn',
];

export default function StaffRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<DetailedRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionModal, setActionModal] = useState<{ isOpen: boolean; action: 'REJECT' | 'REQUEST_INFO' | null }>({ isOpen: false, action: null });
  const [notes, setNotes] = useState('');
  const [selectedDocumentKeys, setSelectedDocumentKeys] = useState<string[]>([]);
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

  const openActionModal = (action: 'REJECT' | 'REQUEST_INFO') => {
    setNotes('');
    setSelectedDocumentKeys([]);
    setActionModal({ isOpen: true, action });
  };

  const closeActionModal = () => {
    if (submitting) return;
    setActionModal({ isOpen: false, action: null });
    setNotes('');
    setSelectedDocumentKeys([]);
  };

  const toggleDocument = (documentKey: string) => {
    setSelectedDocumentKeys((current) =>
      current.includes(documentKey)
        ? current.filter((item) => item !== documentKey)
        : [...current, documentKey]
    );
  };

  const handleApprove = async () => {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt hồ sơ này? Hành động này không thể hoàn tác.')) return;
    submitAction('APPROVE');
  };

  const submitAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    const detail = notes.trim();

    if (!request) return;
    if (action === 'REJECT' && !detail) return;
    if (action === 'REQUEST_INFO' && selectedDocumentKeys.length === 0) return;

    const supplementRequirements =
      action === 'REQUEST_INFO'
        ? getSupplementDocumentOptions(request.request_type).filter((item) =>
            selectedDocumentKeys.includes(item.document_key)
          )
        : [];

    setSubmitting(true);
    try {
      await requestService.updateRequestStatus(
        id,
        action,
        detail,
        supplementRequirements
      );
      setActionModal({ isOpen: false, action: null });
      setNotes('');
      setSelectedDocumentKeys([]);
      await fetchData();
    } catch (error: any) {
      console.error('Lỗi khi xử lý hồ sơ:', error);
      alert(
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        'Có lỗi xảy ra khi xử lý.'
      );
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

  const canFinalAction = request.status === 'PENDING';
  const canRequestSupplement = request.status === 'PENDING';

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6 px-8 pt-8">
        <h1 className="text-xl font-medium text-slate-800 flex items-center">
          <span className="text-xs text-slate-500 font-bold tracking-wider mr-2 uppercase">MÃ HỒ SƠ {shortId}</span>
          <span className="font-bold text-slate-900 text-2xl">Chi tiết hồ sơ {typeLabel}</span>
        </h1>

        <div className="flex items-center gap-3">
          {canFinalAction && (
            <button
              onClick={() => openActionModal('REJECT')}
              className="bg-[#C5221F] text-white hover:bg-red-800 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition"
            >
              <Ban size={16} /> Từ chối
            </button>
          )}

          {canRequestSupplement && (
            <button
              onClick={() => openActionModal('REQUEST_INFO')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition shadow-sm"
            >
              <Edit3 size={16} />
              Yêu cầu bổ sung
            </button>
          )}

          {canFinalAction && (
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="bg-[#22C55E] text-white hover:bg-green-600 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Phê duyệt'}
            </button>
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

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.action === 'REJECT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[1px]">
          <div className="w-[460px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header - theo mẫu popup mong muốn */}
            <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <AlertCircle size={20} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold leading-7 text-slate-800">
                    Xác nhận từ chối hồ sơ
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Vui lòng nhập lý do từ chối để thông báo cho sinh viên biết.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeActionModal}
                className="ml-3 rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="bg-[#F6F8FB] px-5 py-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Gợi ý lý do phổ biến
                </p>
                <div className="flex flex-wrap gap-2">
                  {REJECT_REASON_SUGGESTIONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setNotes(reason)}
                      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        notes.trim() === reason
                          ? 'border-slate-500 bg-slate-200 text-slate-800'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Lý do từ chối <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Vui lòng nhập lý do từ chối..."
                  className="h-[135px] w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-sm border-l-[3px] border-red-500 bg-red-100/80 px-3 py-3 text-red-700">
                <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm leading-6">
                  <span className="font-bold">Hành động này không thể hoàn tác.</span>{' '}
                  Hồ sơ sẽ được chuyển sang trạng thái Từ chối và sinh viên sẽ nhận được thông báo ngay lập tức.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-[#EEF4FF] px-5 py-3">
              <button
                type="button"
                onClick={closeActionModal}
                className="px-4 py-2.5 text-sm font-semibold text-[#0066B3] transition hover:text-blue-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submitting || !notes.trim()}
                onClick={() => submitAction('REJECT')}
                className={`flex min-w-[160px] items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition ${
                  submitting || !notes.trim()
                    ? 'cursor-not-allowed bg-red-300'
                    : 'bg-[#C5221F] hover:bg-red-800'
                }`}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Ban size={18} />
                )}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal.isOpen && actionModal.action === 'REQUEST_INFO' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[calc(100vw-32px)] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start relative">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-[#EBF1F9] text-[#18538E]">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    Yêu cầu bổ sung hồ sơ
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Mã hồ sơ: {shortId} • Sinh viên: {request.student_name}
                  </p>
                </div>
              </div>
              <button
                onClick={closeActionModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-[#F8FAFC] flex flex-col gap-5">
              <div className="bg-[#F0F7FF] border border-[#D9EAFD] p-4 rounded-lg flex items-start gap-3">
                <div className="bg-[#18538E] rounded-full p-0.5 mt-0.5 shrink-0">
                  <Info className="text-white" size={14} />
                </div>
                <p className="text-sm text-[#334155] leading-relaxed">
                  Vui lòng chỉ rõ các thành phần hoặc thông tin cần sinh viên cập nhật thêm. Hệ thống sẽ tạm dừng quy trình xét duyệt cho đến khi nhận được phản hồi.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Tài liệu yêu cầu sinh viên bổ sung
                  </p>
                  <span className="text-xs text-slate-400">
                    Chọn ít nhất 1 tài liệu
                  </span>
                </div>

                {getSupplementDocumentOptions(request.request_type).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {getSupplementDocumentOptions(request.request_type).map((document) => (
                      <label
                        key={document.document_key}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer select-none transition ${
                          selectedDocumentKeys.includes(document.document_key)
                            ? 'border-[#18538E] bg-[#F0F7FF] text-slate-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocumentKeys.includes(document.document_key)}
                          onChange={() => toggleDocument(document.document_key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#18538E] cursor-pointer"
                        />
                        <span className="leading-5 font-medium">
                          {document.document_name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    Chưa cấu hình danh mục tài liệu bổ sung cho loại thủ tục này.
                  </div>
                )}
              </div>

              <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="text-red-500 shrink-0" size={16} fill="currentColor" stroke="white" />
                <p className="text-sm text-red-600">
                  <span className="font-semibold">Lưu ý:</span> Trạng thái hồ sơ sẽ chuyển sang <span className="font-semibold bg-red-100 px-1.5 py-0.5 rounded text-red-700">Yêu cầu bổ sung</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                  Nội dung yêu cầu chi tiết
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-sm text-gray-900 bg-white"
                  placeholder="Ví dụ: Tài liệu chưa rõ nội dung, vui lòng tải lại bản đầy đủ và rõ nét."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span className="text-xs font-medium">Lần cập nhật cuối: {new Date(request.updated_at || request.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeActionModal}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={submitting || selectedDocumentKeys.length === 0}
                  onClick={() => submitAction('REQUEST_INFO')}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition text-sm flex items-center gap-2 ${
                    submitting || selectedDocumentKeys.length === 0
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-[#0066B3] hover:bg-blue-700'
                  }`}
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Gửi yêu cầu</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}