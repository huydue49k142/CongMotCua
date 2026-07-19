import React from 'react';
import { FileText, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data based on the image
const submissions = [
  {
    id: 1,
    type: 'Chuyển ngành',
    date: '15/10/2023',
    status: 'Yêu cầu bổ sung',
    status_icon: <AlertCircle className="h-4 w-4 mr-1.5" />,
    status_color: 'bg-orange-100 text-orange-600',
    border_color: 'border-orange-500',
  },
  {
    id: 2,
    type: 'Xin học tiếp',
    date: '12/10/2023',
    status: 'Đã duyệt',
    status_icon: <CheckCircle className="h-4 w-4 mr-1.5" />,
    status_color: 'bg-green-100 text-green-600',
    border_color: 'border-green-500',
  },
  {
    id: 3,
    type: 'Bảo lưu',
    date: '09/10/2023',
    status: 'Từ chối',
    status_icon: <XCircle className="h-4 w-4 mr-1.5" />,
    status_color: 'bg-red-100 text-red-600',
    border_color: 'border-red-500',
  },
];

const RequestCard = ({ submission }: { submission: typeof submissions[0] }) => (
  <div className={`bg-white rounded-lg border shadow-sm mb-4 p-5 ${submission.border_color}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">{submission.type}</h3>
      <span className={`flex items-center text-xs font-semibold px-3 py-1 rounded-full ${submission.status_color}`}>
        {submission.status_icon}
        {submission.status}
      </span>
    </div>
    <div className="mt-4 flex items-center justify-between text-sm">
      <div className="flex items-center text-slate-500">
        <Calendar className="h-4 w-4 mr-2" />
        <span>Ngày gửi: {submission.date}</span>
      </div>
      <Link href={`/student/submissions/${submission.id}`}>
        <span className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors font-medium">
          Xem chi tiết
        </span>
      </Link>
    </div>
  </div>
);

export default function SubmissionsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <FileText className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-slate-800 ml-3">Hồ sơ đã gửi</h1>
      </div>
      <div>
        {submissions.map((submission) => (
          <RequestCard key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}