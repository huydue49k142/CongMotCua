"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DropoutServicePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/student/procedures/dropout');
  };

  const handleCancel = () => {
    router.push('/student/dashboard');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Thôi học" 
        description="Thôi học tự nguyện" 
        Icon={LogOut}
        onStart={handleStart}
        onCancel={handleCancel}
      />
    </div>
  );
}
