"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRightLeft, 
  LogOut, 
  Archive, 
  PlayCircle, 
  User,
  Sparkles
} from 'lucide-react';

const services = [
  { 
    href: '/student/services/major-change', 
    label: 'Chuyển ngành', 
    icon: ArrowRightLeft,
    highlighted: true
  },
  { 
    href: '/student/services/dropout', 
    label: 'Thôi học', 
    icon: LogOut,
    highlighted: false
  },
  { 
    href: '/student/services/retention', 
    label: 'Bảo lưu', 
    icon: Archive,
    highlighted: false
  },
  { 
    href: '/student/services/resume', 
    label: 'Học tiếp', 
    icon: PlayCircle,
    highlighted: false
  },
];

export default function ProfilePage() {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Header nhỏ trong Main */}
      <div className="h-16 shrink-0 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Xem thông tin thủ tục</h1>
            <p className="text-xs text-slate-500 leading-tight">Chọn thủ tục để xem chi tiết hồ sơ</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          <span>AI đang hỗ trợ</span>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-3">
          {services.map((service) => (
            <Link
              key={service.label}
              href={service.href}
              className={`flex items-center gap-4 w-full p-5 rounded-xl border transition-all duration-200 ${
                service.highlighted
                  ? 'bg-blue-50 border-primary text-primary shadow-sm'
                  : 'bg-white border-gray-200 text-slate-700 hover:border-primary hover:text-primary hover:shadow-sm hover:bg-blue-50/30'
              }`}
            >
              <div className={`p-3 rounded-lg ${service.highlighted ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white'}`}>
                <service.icon className="h-6 w-6" />
              </div>
              <span className="text-base font-semibold">{service.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}