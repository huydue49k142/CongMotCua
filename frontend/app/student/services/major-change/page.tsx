"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { ArrowRightLeft } from 'lucide-react';

export default function MajorChangePage() {
  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Chuyển ngành" 
        description="Đăng ký chuyển sang ngành học khác" 
        Icon={ArrowRightLeft} 
      />
    </div>
  );
}