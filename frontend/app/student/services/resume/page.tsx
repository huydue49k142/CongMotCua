"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { PlayCircle } from 'lucide-react';

export default function ResumePage() {
  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Học tiếp" 
        description="Đăng ký quay trở lại học tập" 
        Icon={PlayCircle} 
      />
    </div>
  );
}