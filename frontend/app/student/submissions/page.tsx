"use client";

import React, { useEffect, useState } from 'react';
import { List, Calendar, Trash2, CheckCircle, XCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { requestService, ProcedureRequest } from '@/services/request.service';

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
      return { label: 'Đã duyệt', icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />, color: 'bg-[#e6f4ea] text-[#137333]' };
    case 'REJECTED':
    case 'CANCELLED':
      return { label: status === 'REJECTED' ? 'Từ chối' : 'Đã hủy', icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />, color: 'bg-[#FF4D4F] text-white' };
    case 'ADDITIONAL_INFO_REQUIRED':
      return { label: 'Yêu cầu bổ sung', icon: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />, color: 'bg-orange-100 text-orange-700' };
    case 'PENDING_REVIEW':
    case 'IN_PROGRESS':
    default:
      return { label: status === 'PENDING_REVIEW' ? 'Chờ tiếp nhận' : 'Đang xử lý', icon: <Clock className="h-3.5 w-3.5 mr-1.5" />, color: 'bg-[#91D5FF] text-[#003A8C]' };
  }
};

const RequestCard = ({ submission, onDeleteClick }: { submission: ProcedureRequest; onDeleteClick: (id: string, shortId: string) => void }) => {
  const statusConfig = getStatusConfig(submission.status);
  const typeLabel = getRequestTypeLabel(submission.request_type);
  const dateStr = new Date(submission.created_at).toLocaleDateString('vi-VN');
  const canDelete = submission.status === 'PENDING_REVIEW';
  const deleteTooltip = canDelete
    ? 'Hủy hồ sơ'
    : submission.status === 'IN_PROGRESS'
    ? 'Hồ sơ đang được phòng đào tạo xử lý, không thể hủy'
    : submission.status === 'APPROVED'
    ? 'Hồ sơ đã được duyệt, không thể hủy'
    : 'Hồ sơ đã hoàn tất, không thể hủy';
  const shortId = submission.id.split('-')[0].toUpperCase();

  return (
    <div className="bg-white rounded-lg border border-gray-300 mb-4 p-5 flex flex-col gap-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">{typeLabel}</h3>
        <span className={`flex items-center text-xs font-semibold px-4 py-1.5 rounded-full ${statusConfig.color}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600 font-medium">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Ngày gửi: {dateStr}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/student/submissions/${submission.id}`}>
            <span className="px-5 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-semibold">
              Xem chi tiết
            </span>
          </Link>
          <button 
            onClick={() => canDelete && onDeleteClick(submission.id, shortId)}
            disabled={!canDelete}
            className={`p-1.5 rounded-md transition-colors ${
              canDelete 
                ? 'text-gray-700 hover:text-red-500 hover:bg-red-50 cursor-pointer' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={deleteTooltip}
          >
            <Trash2 className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ProcedureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, shortId: string} | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await requestService.getMyRequests();
        setSubmissions(data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await requestService.deleteRequest(deleteConfirm.id);
      setSubmissions(prev => prev.filter(req => req.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Failed to delete request", error);
      alert(error.response?.data?.error || error.response?.data?.detail || "Đã xảy ra lỗi khi hủy hồ sơ. Vui lòng thử lại sau.");
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="bg-[#0070F4] p-1.5 rounded-md mr-3">
          <List className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Hồ sơ đã gửi</h1>
      </div>
      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 min-h-[500px]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200">
            Bạn chưa có hồ sơ nào đã gửi.
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {submissions.map((sub) => (
              <RequestCard key={sub.id} submission={sub} onDeleteClick={(id, shortId) => setDeleteConfirm({id, shortId})} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="text-[#C82323] h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Xác nhận hủy hồ sơ</h3>
            <p className="text-gray-600 mb-8 text-sm">
              Bạn có chắc chắn muốn hủy hồ sơ <strong className="text-gray-900 font-bold">{deleteConfirm.shortId}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-400 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-[#C82323] text-white rounded-lg font-medium hover:bg-[#A81A1A] transition-colors shadow-sm"
              >
                Hủy hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}