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
  { href: '/student/services/dropout', label: 'Thôi học', icon: LogOut, description: 'Thôi học tự nguyện' },
  { href: '/student/services/retention', label: 'Bảo lưu', icon: Archive, description: 'Bảo lưu kết quả' },
  { href: '/student/services/resume', label: 'Học tiếp', icon: PlayCircle, description: 'Đăng ký học tiếp' },
  { href: '/student/submissions', label: 'Hồ sơ đã gửi', icon: FileText, description: 'Theo dõi hồ sơ đã gửi' },
];


const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
          <h2 className="px-3 mb-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
            Chọn thủ tục
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-slate-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.description && (
                      <span className={`text-[11px] font-normal leading-tight ${isActive ? 'text-primary/80' : 'text-slate-500'}`}>
                        {item.description}
                      </span>
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-slate-600 hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="px-6 pb-4 mt-auto">
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