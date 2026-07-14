"use client";

import React, { useState } from 'react';
import { Send, Paperclip, Bot, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  title: string;
  description: string;
  Icon: React.ElementType;
}

const ChatInterface = ({ title, description, Icon }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');

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
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          <span>AI đang hỗ trợ</span>
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
            Xin chào! Tôi là trợ lý ảo hỗ trợ thủ tục <strong>{title}</strong>. 
            <br /><br />
            Để bắt đầu, bạn vui lòng cung cấp thông tin hồ sơ hoặc đặt câu hỏi về quy trình chuyển ngành. Tôi sẽ hướng dẫn bạn từng bước một cách chi tiết nhất.
            <div className="flex gap-1 mt-2 animate-pulse">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 pl-4 bg-slate-100 rounded-2xl border border-gray-200 focus-within:border-primary transition-colors">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Nhập thông tin hồ sơ của bạn...`}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          <button 
            className={`p-2 rounded-xl transition-all ${message ? 'bg-primary text-white shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!message}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;