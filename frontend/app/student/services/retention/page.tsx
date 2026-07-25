"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RetentionPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/student/procedures/retention');
  };

  const handleCancel = () => {
    router.push('/student/dashboard');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Bảo lưu" 
        description="Đăng ký bảo lưu kết quả học tập" 
        Icon={Archive}
        onStart={handleStart}
        onCancel={handleCancel}
      />
    </div>
  );
}
