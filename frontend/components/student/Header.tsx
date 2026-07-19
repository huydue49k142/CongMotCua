"use client";

import React from 'react';
import { Bell, ChevronDown, GraduationCap, Zap } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
  // Mock user data
  const user = {
    name: 'Nguyễn Văn An',
    avatar: '/images/default-avatar.png', // You should have a default avatar image in public/images
  };

  return (
    <header className="flex items-center justify-between px-6 bg-primary text-white" style={{ gridArea: 'header' }}>
      {/* Left side */}
      <div className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-6 w-6" />
          <span>CỔNG DỊCH VỤ SINH VIÊN</span>
      </div>
      <div className='flex-grow'></div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button className="relative hover:bg-white/10 p-2 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
              A
          </div>
          <div className="text-sm font-semibold">{user.name}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;