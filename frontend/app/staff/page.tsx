"use client";

import React, { useEffect, useState } from 'react';
import { Search, Filter, ClipboardList, AlertCircle, Ban, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { requestService } from '@/services/request.service';

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({ pending: 0, warning: 0, rejected: 0, completed: 0 });
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, requestsData] = await Promise.all([
          requestService.getStaffStats(),
          requestService.getStaffRequests()
        ]);
        setStats(statsData);
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">Chờ tiếp nhận</span>;
      case 'ADDITIONAL_INFO_REQUIRED':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">Yêu cầu bổ sung</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">Đã duyệt</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">Đã hủy/Từ chối</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">Đang xử lý</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">{status}</span>;
    }
  };

  const getRequestTypeName = (type: string) => {
    const types: Record<string, string> = {
      'MAJOR_CHANGE': 'Chuyển ngành',
      'ACADEMIC_LEAVE': 'Bảo lưu',
      'RESUME_STUDIES': 'Xin học tiếp',
      'DROPOUT': 'Thôi học'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-[#18538E] mb-6">Danh sách hồ sơ học vụ</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-y border-r border-l-4 border-l-[#0070F4] border-gray-200 rounded-md p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="bg-blue-50 p-2 rounded-md text-[#0070F4]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Cần xử lý</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#0070F4] leading-none mb-1">{stats.pending}</div>
            <div className="text-xs text-slate-500 font-medium">Chờ tiếp nhận</div>
          </div>
        </div>

        <div className="bg-white border-y border-r border-l-4 border-l-red-500 border-gray-200 rounded-md p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="bg-red-50 p-2 rounded-md text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Cảnh báo</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-500 leading-none mb-1">{stats.warning}</div>
            <div className="text-xs text-slate-500 font-medium">Yêu cầu bổ sung</div>
          </div>
        </div>

        <div className="bg-white border-y border-r border-l-4 border-l-red-300 border-gray-200 rounded-md p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="bg-red-50 p-2 rounded-md text-red-400">
              <Ban className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Từ chối</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-800 leading-none mb-1">{stats.rejected < 10 && stats.rejected > 0 ? `0${stats.rejected}` : (stats.rejected === 0 ? '00' : stats.rejected)}</div>
            <div className="text-xs text-slate-500 font-medium">Đã hủy</div>
          </div>
        </div>

        <div className="bg-white border-y border-r border-l-4 border-l-emerald-500 border-gray-200 rounded-md p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-50 p-2 rounded-md text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Đã hoàn tất</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 leading-none mb-1">{stats.completed}</div>
            <div className="text-xs text-slate-500 font-medium">Đã duyệt</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-md p-4 mb-6 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm tên SV, MSSV hoặc Mã hồ sơ..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-md py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="w-48 relative">
          <select className="w-full bg-slate-50 border border-gray-200 rounded-md py-2.5 px-4 text-sm text-slate-700 appearance-none focus:outline-none focus:border-blue-500">
            <option>Tất cả thủ tục</option>
            <option>Chuyển ngành</option>
            <option>Thôi học</option>
            <option>Bảo lưu</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
        <button className="bg-[#18538E] hover:bg-blue-800 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
          <Filter className="h-4 w-4" />
          Lọc dữ liệu
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EBF1F9] text-slate-700 font-semibold text-xs border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 font-semibold">Mã hồ sơ</th>
              <th className="py-4 px-6 font-semibold">Họ và tên</th>
              <th className="py-4 px-6 font-semibold">MSSV</th>
              <th className="py-4 px-6 font-semibold">Loại thủ tục</th>
              <th className="py-4 px-6 font-semibold">Ngày gửi</th>
              <th className="py-4 px-6 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">Không có hồ sơ nào</td>
              </tr>
            ) : (
              requests.map((request, index) => (
                <tr 
                  key={request.id} 
                  onClick={() => window.location.href = `/staff/requests/${request.id}`}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${index % 2 !== 0 ? 'bg-[#F4F9FE]/30' : ''}`}
                >
                  <td className="py-4 px-6 font-medium text-[#0070F4]">
                    HS{String(index + 1).padStart(6, '0')}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">{request.student_name}</td>
                  <td className="py-4 px-6 text-slate-700">{request.student_code}</td>
                  <td className="py-4 px-6 text-slate-700">{getRequestTypeName(request.request_type)}</td>
                  <td className="py-4 px-6 text-slate-600">{formatDate(request.submitted_at || request.created_at)}</td>
                  <td className="py-4 px-6">
                    {getStatusBadge(request.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && requests.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị {requests.length} hồ sơ
            </div>
            <div className="flex items-center gap-1">
              <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-slate-500 hover:bg-slate-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 flex items-center justify-center border border-transparent bg-[#18538E] text-white rounded-md text-sm font-medium">
                1
              </button>
              <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-slate-500 hover:bg-slate-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
