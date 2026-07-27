"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Calendar, AlertCircle, CheckCircle, XCircle, Clock, Edit3 } from 'lucide-react';
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
      return { label: 'Đã duyệt', icon: <CheckCircle className="h-4 w-4 mr-1.5" />, color: 'bg-green-100 text-green-600', border: 'border-green-500' };
    case 'REJECTED':
    case 'CANCELLED':
      return { label: status === 'REJECTED' ? 'Từ chối' : 'Đã hủy', icon: <XCircle className="h-4 w-4 mr-1.5" />, color: 'bg-red-100 text-red-600', border: 'border-red-500' };
    case 'ADDITIONAL_INFO_REQUIRED':
      return { label: 'Yêu cầu bổ sung', icon: <AlertCircle className="h-4 w-4 mr-1.5" />, color: 'bg-orange-100 text-orange-600', border: 'border-orange-500' };
    case 'DRAFT':
      return { label: 'Bản nháp', icon: <Edit3 className="h-4 w-4 mr-1.5" />, color: 'bg-gray-100 text-gray-600', border: 'border-gray-500' };
    case 'PENDING_REVIEW':
    case 'IN_PROGRESS':
    default:
      return { label: status === 'PENDING_REVIEW' ? 'Chờ tiếp nhận' : 'Đang xử lý', icon: <Clock className="h-4 w-4 mr-1.5" />, color: 'bg-blue-100 text-blue-600', border: 'border-blue-500' };
  }
};

const RequestCard = ({ submission }: { submission: ProcedureRequest }) => {
  const statusConfig = getStatusConfig(submission.status);
  const typeLabel = getRequestTypeLabel(submission.request_type);
  const dateStr = new Date(submission.created_at).toLocaleDateString('vi-VN');

  return (
    <div className={`bg-white rounded-lg border shadow-sm mb-4 p-5 ${statusConfig.border}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">{typeLabel}</h3>
      <span className={`flex items-center text-xs font-semibold px-3 py-1 rounded-full ${statusConfig.color}`}>
        {statusConfig.icon}
        {statusConfig.label}
      </span>
    </div>
    <div className="mt-4 flex items-center justify-between text-sm">
      <div className="flex items-center text-slate-500">
        <Calendar className="h-4 w-4 mr-2" />
        <span>Ngày gửi: {dateStr}</span>
      </div>
      <Link href={`/student/submissions/${submission.id}`}>
        <span className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors font-medium">
          Xem chi tiết
        </span>
      </Link>
    </div>
  </div>
  );
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ProcedureRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <FileText className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-slate-800 ml-3">Hồ sơ đã gửi</h1>
      </div>
      <div>
        {loading ? (
          <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-slate-200">
            Bạn chưa có hồ sơ nào đã gửi.
          </div>
        ) : (
          submissions.map((submission) => (
            <RequestCard key={submission.id} submission={submission} />
          ))
        )}
      </div>
    </div>
  );
}