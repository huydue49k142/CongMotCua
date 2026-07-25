"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MajorChangeServicePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/student/procedures/major-change');
  };

  const handleCancel = () => {
    router.push('/student/dashboard');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Chuyển ngành" 
        description="Đăng ký chuyển sang ngành học khác" 
        Icon={ArrowRightLeft}
        onStart={handleStart}
        onCancel={handleCancel}
      />
    </div>
  );
}
