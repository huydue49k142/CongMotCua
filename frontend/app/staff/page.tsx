"use client";

import React from 'react';
import { Search, Filter, ClipboardList, AlertCircle, Ban, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaffDashboardPage() {
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
            <div className="text-3xl font-bold text-[#0070F4] leading-none mb-1">10</div>
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
            <div className="text-3xl font-bold text-red-500 leading-none mb-1">10</div>
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
            <div className="text-3xl font-bold text-slate-800 leading-none mb-1">00</div>
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
            <div className="text-3xl font-bold text-emerald-600 leading-none mb-1">10</div>
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
            {/* Row 1 */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-[#0070F4]">HS000001</td>
              <td className="py-4 px-6 font-bold text-slate-800">Nguyễn Văn An</td>
              <td className="py-4 px-6 text-slate-700">231121514241</td>
              <td className="py-4 px-6 text-slate-700">Chuyển ngành</td>
              <td className="py-4 px-6 text-slate-600">12/10/2023</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                  Đã bổ sung
                </span>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-[#0070F4]">HS000002</td>
              <td className="py-4 px-6 font-bold text-slate-800">Trần Thị B</td>
              <td className="py-4 px-6 text-slate-700">231121514245</td>
              <td className="py-4 px-6 text-slate-700">Bảo lưu</td>
              <td className="py-4 px-6 text-slate-600">14/10/2023</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
                  Yêu cầu bổ sung
                </span>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 font-medium text-[#0070F4]">HS000003</td>
              <td className="py-4 px-6 font-bold text-slate-800">Lê Văn C</td>
              <td className="py-4 px-6 text-slate-700">231121514247</td>
              <td className="py-4 px-6 text-slate-700">Xin học tiếp</td>
              <td className="py-4 px-6 text-slate-600">15/10/2023</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
                  Đã duyệt
                </span>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="hover:bg-slate-50 transition-colors bg-[#F4F9FE]/30">
              <td className="py-4 px-6 font-medium text-[#0070F4]">HS000004</td>
              <td className="py-4 px-6">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  Phạm Hoàng Long
                  <span className="h-2 w-2 rounded-full bg-[#0070F4]"></span>
                </div>
              </td>
              <td className="py-4 px-6 text-slate-700">231121514246</td>
              <td className="py-4 px-6 text-slate-700">Thôi học</td>
              <td className="py-4 px-6 text-slate-600">Vừa xong</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                  Chờ tiếp nhận
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị 30 hồ sơ
          </div>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-slate-500 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 flex items-center justify-center border border-transparent bg-[#18538E] text-white rounded-md text-sm font-medium">
              1
            </button>
            <button className="h-8 w-8 flex items-center justify-center border border-transparent text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium">
              2
            </button>
            <button className="h-8 w-8 flex items-center justify-center border border-transparent text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium">
              3
            </button>
            <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-slate-500 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
