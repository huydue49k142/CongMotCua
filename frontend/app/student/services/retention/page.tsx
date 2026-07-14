"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { Archive } from 'lucide-react';

export default function RetentionPage() {
  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Bảo lưu" 
        description="Đăng ký bảo lưu kết quả học tập" 
        Icon={Archive} 
      />
    </div>
  );
}