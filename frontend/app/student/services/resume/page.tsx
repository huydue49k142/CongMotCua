"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumeServicePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/student/procedures/resume');
  };

  const handleCancel = () => {
    router.push('/student/dashboard');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Học tiếp" 
        description="Đăng ký học tiếp" 
        Icon={PlayCircle}
        onStart={handleStart}
        onCancel={handleCancel}
      />
    </div>
  );
}
