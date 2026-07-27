"use client";

import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { authService } from '@/services/auth.service';

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState<string>("Sinh viên");

  useEffect(() => {
    const user = authService.getUser();
    if (user && (user.full_name || user.name || user.username)) {
      setUserName(user.full_name || user.name || user.username);
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
                <Bot className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Xin chào, {userName}!</h1>
            <p className="text-slate-600 max-w-md">
                Vui lòng chọn một thủ tục từ thanh điều hướng bên trái để bắt đầu.
            </p>
        </div>
    </div>
  );
}
