"use client";

import React, { useState } from 'react';
import { MessageCircle, X, Send, Minus, Bot, Sparkles } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const suggestedQuestions = [
    "Điều kiện chuyển ngành?",
    "Hồ sơ thôi học cần gì?",
    "Cách bảo lưu kết quả học tập?",
    "Thủ tục quay lại học tiếp?",
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Trợ lý AI</h3>
                <div className="flex items-center gap-1 text-[10px] text-white/80 mt-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Đang hoạt động</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {/* AI Greeting */}
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="p-2 bg-primary rounded-lg text-white shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-700 leading-relaxed">
                Xin chào! 👋 Tôi là trợ lý AI của Cổng dịch vụ sinh viên. Tôi có thể giúp gì cho bạn hôm nay?
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-[11px] font-medium text-slate-500 px-1">Gợi ý cho bạn:</p>
              {suggestedQuestions.map((q, idx) => (
                <button 
                  key={idx} 
                  className="text-left px-3 py-2 text-xs bg-white border border-blue-100 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Footer / Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-gray-200">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hỏi bất kỳ điều gì..." 
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 px-2"
              />
              <button 
                className={`p-1.5 rounded-lg transition-all ${message ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!message}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger / Close Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all duration-300 ${
          isOpen ? 'bg-blue-600 rotate-90' : 'bg-primary hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;