"use client";

import React, { useState } from 'react';
import { LogOut, User, GraduationCap, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutConfirmDialog from '@/components/student/LogoutConfirmDialog';
import { authService } from '@/services/auth.service';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleOpenLogout = () => setIsLogoutOpen(true);
  const handleCloseLogout = () => setIsLogoutOpen(false);
  const handleConfirmLogout = () => {
    setIsLogoutOpen(false);
    authService.logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-transparent">
            <img src="/Logo_DUE.jpg" alt="Logo DUE" className="w-10 h-10 object-contain rounded-md mr-3 bg-white" />
            <div>
              <div className="font-bold text-[#18538E] text-lg leading-tight uppercase">Cổng Dịch Vụ</div>
              <div className="text-xs text-slate-500">Phòng Đào tạo</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 mt-2">
            <Link href="/staff" className="flex items-center gap-3 px-4 py-3 bg-slate-200 text-slate-700 rounded-md font-medium text-sm border border-slate-300 shadow-sm">
              <FileText className="h-4 w-4" />
              Quản lý hồ sơ học vụ
            </Link>
          </nav>
        </div>

        {/* Bottom User Area */}
        <div>
          <button 
            type="button"
            onClick={handleOpenLogout}
            className="flex items-center gap-3 px-8 py-4 text-slate-600 hover:text-slate-800 text-sm font-medium w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
          <div className="border-t border-slate-200 p-4 bg-slate-100/50 flex items-center gap-3">
            <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-800 truncate">Phòng Đào Tạo</div>
              <div className="text-xs text-slate-500 truncate">admin@university.edu.vn</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#18538E] flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 max-w-xl">
            {/* Search input removed */}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition cursor-pointer px-4 py-1.5 rounded-full">
              <div className="bg-white/20 p-1 rounded-full text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-white">Phòng Đào Tạo</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-white p-6">
          {children}
        </div>
      </main>

      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={handleCloseLogout}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
