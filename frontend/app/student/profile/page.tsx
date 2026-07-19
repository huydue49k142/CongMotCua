"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRightLeft, 
  BookCopy, 
  Archive, 
  PlayCircle,
  ChevronRight,
  FileSearch
} from 'lucide-react';

const services = [
  { 
    href: '/student/procedures/major-change', 
    label: 'Chuyển ngành', 
    icon: ArrowRightLeft,
  },
  { 
    href: '/student/procedures/dropout', 
    label: 'Thôi học', 
    icon: BookCopy,
  },
  { 
    href: '/student/procedures/retention', 
    label: 'Bảo lưu', 
    icon: Archive,
  },
  { 
    href: '/student/procedures/resume', 
    label: 'Học tiếp', 
    icon: PlayCircle,
  },
];

export default function ProfilePage() {
  return (
    <div className="h-full w-full flex flex-col p-6 sm:p-8 md:p-10 bg-gray-50/50">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/student/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-slate-700">Xem thông tin thủ tục</span>
      </nav>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <FileSearch className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Vui lòng chọn một thủ tục</h1>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          {services.map((service) => (
            <Link
              key={service.label}
              href={service.href}
              className="group flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-gray-200 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-4 bg-gray-100 rounded-full transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                <service.icon className="h-7 w-7 text-slate-600 transition-colors duration-200 group-hover:text-white" />
              </div>
              <span className="text-base font-semibold mt-4 text-slate-700">{service.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
