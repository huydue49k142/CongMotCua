"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, 
  FileText, Paperclip, Ban, Edit3, Loader2, Download,
  Info, Send, History
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
      return { label: 'TRẠNG THÁI: CHỜ XỬ LÝ', color: 'bg-[#0070F4] text-white' };
  }
};

const COMMON_ADDITIONAL_INFO_REASONS = [
  'Thiếu bảng điểm gốc',
  'Minh chứng không hợp lệ',
  'Cần chữ ký xác nhận',
  'Ảnh chân dung mờ/sai quy chuẩn',
  'CCCD hết hạn/mờ số',
  'Khác...',
];

export default function StaffRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<DetailedRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionModal, setActionModal] = useState<{isOpen: boolean; action: 'REJECT' | 'REQUEST_INFO' | null}>({isOpen: false, action: null});
  const [notes, setNotes] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
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

  const openActionModal = (
    action: 'REJECT' | 'REQUEST_INFO'
  ) => {
    setNotes('');
    setSelectedReasons([]);
    setActionModal({
      isOpen: true,
      action,
    });
  };

  const closeActionModal = () => {
    if (submitting) return;

    setActionModal({
      isOpen: false,
      action: null,
    });
    setNotes('');
    setSelectedReasons([]);
  };

  const toggleAdditionalReason = (
    reason: string
  ) => {
    setSelectedReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  };

  const submitAction = async (
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO'
  ) => {
    const trimmedNotes = notes.trim();

    if (
      action === 'REJECT' &&
      !trimmedNotes
    ) {
      return;
    }

    if (
      action === 'REQUEST_INFO' &&
      selectedReasons.length === 0 &&
      !trimmedNotes
    ) {
      return;
    }

    const requestInfoNotes =
      action === 'REQUEST_INFO'
        ? [
            selectedReasons.length > 0
              ? `Lý do bổ sung: ${selectedReasons.join('; ')}`
              : '',
            trimmedNotes
              ? `Nội dung yêu cầu chi tiết: ${trimmedNotes}`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : trimmedNotes;

    setSubmitting(true);

    try {
      await requestService.updateRequestStatus(
        id,
        action,
        requestInfoNotes
      );

      setActionModal({
        isOpen: false,
        action: null,
      });
      setNotes('');
      setSelectedReasons([]);

      await fetchData();
    } catch (error) {
      console.error(
        'Lỗi khi xử lý hồ sơ:',
        error
      );
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
  
  const canAction = ['PENDING'].includes(request.status);

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
                onClick={() => openActionModal('REJECT')}
                className="bg-[#C5221F] text-white hover:bg-red-800 px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition"
              >
                <Ban size={16} /> Từ chối
              </button>
              <button 
                onClick={() => openActionModal('REQUEST_INFO')}
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
      {actionModal.isOpen &&
        actionModal.action === 'REQUEST_INFO' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-6 backdrop-blur-[2px]">
            <div className="flex max-h-[94vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-[#F5F7FA] shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-50 text-[#0878BE]">
                    <Info size={21} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold leading-tight text-slate-900">
                      Yêu cầu bổ sung hồ sơ
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Mã hồ sơ: #{shortId} • Sinh viên: {request.student_name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={submitting}
                  aria-label="Đóng"
                  className="rounded p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={21} />
                </button>
              </div>

              {/* Nội dung có thể cuộn */}
              <div className="overflow-y-auto px-5 py-5">
                <div className="flex items-start gap-3 rounded border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-slate-700">
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-[#0878BE]"
                  />

                  <p>
                    Vui lòng chỉ rõ các thành phần hoặc thông tin cần sinh viên
                    cập nhật thêm. Hệ thống sẽ tạm dừng quy trình xét duyệt cho
                    đến khi nhận được phản hồi.
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Lý do bổ sung phổ biến
                  </p>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    {COMMON_ADDITIONAL_INFO_REASONS.map(
                      (reason) => {
                        const checked =
                          selectedReasons.includes(
                            reason
                          );

                        return (
                          <label
                            key={reason}
                            className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-800"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleAdditionalReason(
                                  reason
                                )
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-400 accent-[#0878BE]"
                            />

                            <span>{reason}</span>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  <AlertCircle
                    size={17}
                    className="shrink-0 text-red-600"
                  />

                  <p>
                    <strong>Lưu ý:</strong> Trạng thái hồ sơ sẽ chuyển sang{' '}
                    <span className="rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">
                      Yêu cầu bổ sung
                    </span>
                  </p>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="additional-info-notes"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    Nội dung yêu cầu chi tiết
                  </label>

                  <textarea
                    id="additional-info-notes"
                    rows={5}
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    placeholder="Ví dụ: Vui lòng tải bảng điểm học kì 1 (2023–2024)"
                    className="w-full resize-none rounded border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0878BE] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeActionModal}
                    disabled={submitting}
                    className="rounded px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      submitAction(
                        'REQUEST_INFO'
                      )
                    }
                    disabled={
                      submitting ||
                      (
                        selectedReasons.length ===
                          0 &&
                        !notes.trim()
                      )
                    }
                    className="inline-flex items-center gap-2 rounded bg-[#0878BE] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#06689F] disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {submitting ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={17} />
                    )}

                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {actionModal.isOpen &&
        actionModal.action === 'REJECT' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="relative flex items-center justify-between border-b border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-red-50 p-2 text-red-500">
                    <AlertCircle size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Xác nhận từ chối hồ sơ
                    </h3>

                    <p className="text-sm text-slate-500">
                      Vui lòng nhập lý do từ chối để thông báo cho sinh viên.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={submitting}
                  className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="bg-slate-50/50 p-6">
                <label
                  htmlFor="reject-notes"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  LÝ DO TỪ CHỐI{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="reject-notes"
                  rows={5}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Nhập lý do chi tiết..."
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <div className="mt-4 flex items-start gap-3 rounded-r-md border-l-4 border-red-500 bg-red-50 p-4">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-xs leading-relaxed text-red-700">
                    <strong>
                      Hành động này không thể hoàn tác.
                    </strong>{' '}
                    Hồ sơ sẽ chuyển sang trạng thái Từ chối và sinh viên sẽ nhận
                    được thông báo ngay lập tức.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={submitting}
                  className="rounded-md px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  disabled={
                    !notes.trim() ||
                    submitting
                  }
                  onClick={() =>
                    submitAction('REJECT')
                  }
                  className="flex items-center gap-2 rounded-md bg-[#C5221F] px-5 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {submitting ? (
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />
                  ) : (
                    <Ban size={16} />
                  )}

                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}