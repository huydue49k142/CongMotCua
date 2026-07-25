"use client";

import React, { useState } from 'react';
import { Bot } from 'lucide-react';

interface ChatInterfaceProps {
  title: string;
  description: string;
  Icon: React.ElementType;
  welcomeMessage?: string;
  welcomePrimaryLabel?: string;
  welcomeSecondaryLabel?: string;
  welcomeSecondaryHref?: string;
  onStart?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  isStarted?: boolean;
}

const ChatInterface = ({
  title,
  description,
  Icon,
  welcomeMessage,
  welcomePrimaryLabel = 'Bắt đầu làm thủ tục',
  welcomeSecondaryLabel = 'Không, quay lại',
  welcomeSecondaryHref,
  onStart,
  onCancel,
  children,
  isStarted = false,
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const finalWelcomeMessage =
    welcomeMessage ||
    `Chào bạn, hệ thống Trường Đại học Kinh tế ghi nhận bạn đang chọn thủ tục ${title}. Bạn có muốn bắt đầu tạo hồ sơ không?`;

  const handleStart = () => {
    if (onStart) {
      onStart();
      return;
    }
    console.log('Bắt đầu thủ tục:', title);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    if (welcomeSecondaryHref) {
      window.location.href = welcomeSecondaryHref;
      return;
    }

    console.log('Hủy thủ tục:', title);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    console.log('Gửi tin nhắn:', message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{title}</h2>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
        {/* AI Initial Message */}
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="p-2 bg-primary rounded-lg text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm text-slate-700 text-sm leading-relaxed">
            <p className="font-semibold text-primary mb-1">Trợ lý AI</p>
            <p>{finalWelcomeMessage}</p>
            <div className="flex gap-1 mt-2 animate-pulse">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons - only show when not started */}
        {!isStarted && (
          <div className="flex items-center gap-3 pl-11">
            <button
              type="button"
              onClick={handleStart}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {welcomePrimaryLabel}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-gray-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              {welcomeSecondaryLabel}
            </button>
          </div>
        )}

        {/* Render Children */}
        {children && (
          <div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
