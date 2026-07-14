"use client";

import React from 'react';
import ChatInterface from '@/components/student/ChatInterface';
import { LogOut } from 'lucide-react';

export default function DropoutPage() {
  return (
    <div className="h-full w-full flex flex-col">
      <ChatInterface 
        title="Thôi học" 
        description="Đăng ký thôi học tại trường" 
        Icon={LogOut} 
      />
    </div>
  );
}