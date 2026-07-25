"use client";

import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  LogOut, 
  FileText, 
  Archive, 
  PlayCircle, 
  User, 
  HelpCircle,
  BarChart3,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const navItems = [
  { href: '/student/services/major-change', label: 'Chuyển ngành', icon: ArrowRightLeft, description: 'Chuyển ngành học' },
  { href: '/student/services/dropout', label: 'Thôi học', icon: LogOut, description: 'Thôi học tự nguyện', procedureKey: 'dropout' },
  { href: '/student/services/retention', label: 'Bảo lưu', icon: Archive, description: 'Bảo lưu kết quả', procedureKey: 'retention' },
  { href: '/student/services/resume', label: 'Học tiếp', icon: PlayCircle, description: 'Đăng ký học tiếp', procedureKey: 'resume' },
  { href: '/student/student-procedure-info', label: 'Xem thông tin thủ tục', icon: Info, description: 'Xem thông tin chi tiết' },
  { href: '/student/submissions', label: 'Hồ sơ đã gửi', icon: FileText, description: 'Theo dõi hồ sơ đã gửi' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const procedureFromPath = pathname.split('/')[3];

  const handleOpenLogout = () => setIsLogoutOpen(true);
  const handleCloseLogout = () => setIsLogoutOpen(false);
  const handleConfirmLogout = () => {
    setIsLogoutOpen(false);
    router.push('/login');
  };

  return (
    <aside className="bg-white border-r border-gray-200 flex flex-col" style={{ gridArea: 'sidebar' }}>
      <div className="flex-1 py-6 px-4 space-y-6">
        <div>
          <h2 className="px-3 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Dịch vụ
          </h2>
          {/* This can be a separate component */}
        </div>
        <div>
          <h2 className="px-3 mb-2 text-sm font-bold text-slate-800 uppercase tracking-[0.24em]">
            Chọn thủ tục
          </h2>
          <nav className="space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.procedureKey && `/student/procedures/${item.procedureKey}` === pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div>{item.label}</div>
                    {item.description && (
                      <div className={`text-[11px] leading-tight ${isActive ? 'text-sky-700/80' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleOpenLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-primary pt-0.5">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-primary text-sm mb-1">Hướng dẫn</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chọn loại thủ tục, cung cấp thông tin cho AI kiểm tra điều kiện, rồi nộp hồ sơ và theo dõi tiến trình.
              </p>
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={handleCloseLogout}
        onConfirm={handleConfirmLogout}
      />
    </aside>
  );
};

export default Sidebar;