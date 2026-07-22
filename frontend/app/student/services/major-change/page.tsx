"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRightLeft, Bot, Paperclip, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConditionChecklist } from '@/components/student/ConditionChecklist';
import { FileUploadList, FileItem } from '@/components/student/FileUploadList';

const TypingIndicator = () => (
  <motion.div 
    className="flex items-end gap-3 mb-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
      <Bot className="h-5 w-5" />
    </div>
    <div className="max-w-xl">
      <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-none bg-gray-100 text-slate-700">
        <div className="flex items-center gap-1.5">
          <motion.div className="h-2 w-2 bg-slate-400 rounded-full" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="h-2 w-2 bg-slate-400 rounded-full" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
          <motion.div className="h-2 w-2 bg-slate-400 rounded-full" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
        </div>
      </div>
    </div>
  </motion.div>
);

const initialConditions = [
    { text: "Không phải là sinh viên năm thứ 1 hoặc năm cuối khóa, không thuộc thụ diện bị xem xét buộc thôi học và còn đủ thời gian học tập", details: "Thủ tục chỉ áp dụng cho sinh viên từ năm thứ 2 trở lên và không thuộc diện bị buộc thôi học." },
    { text: "Đạt điều kiện trúng tuyển của chương trình, ngành đào tạo", details: "Điểm xét tuyển đầu vào phải lớn hơn hoặc bằng điểm chuẩn của ngành muốn chuyển đến tại năm tuyển sinh tương ứng. Về điểm chuẩn 1 trong tất cả các phương thức xét tuyển đáp ứng: học bạ, điểm thi THPTQG, điểm ĐGNL,...)" },
    { text: "Được sự đồng ý của thủ trưởng các đơn vị", details: "Phải được sự phê duyệt từ các đơn vị chuyên môn phụ trách chương trình, ngành đào tạo và hiệu trưởng cơ sở đào tạo" },
    { text: "Không thuộc diện bị xét thôi học hay kỉ luật", details: null },
];

const requiredFiles: FileItem[] = [
  { name: "Đơn xin chuyển ngành", status: 'pending' },
  { name: "Giấy báo trúng tuyển", status: 'pending' },
  { name: "Giấy báo kết quả thi tốt nghiệp", status: 'pending' },
  { name: "Giấy xác nhận sinh viên không thuộc diện thôi học", status: 'pending' },
  { name: "Giấy xác nhận sinh viên không vi phạm kỉ luật", status: 'pending' },
  { name: "Bảng điểm", status: 'pending' },
];

type ChatStep = 'initial_typing' | 'show_checklist' | 'checklist_typing' | 'show_file_upload';

export default function MajorChangeServicePage() {
  const [step, setStep] = useState<ChatStep>('initial_typing');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial message
    const timer = setTimeout(() => {
      setStep('show_checklist');
    }, 1500 + Math.random() * 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChecklistComplete = useCallback(() => {
    setStep('checklist_typing');
    const timer = setTimeout(() => {
      setStep('show_file_upload');
    }, 1500 + Math.random() * 800);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);
  
  const renderContent = () => {
    const isTyping = step === 'initial_typing' || step === 'checklist_typing';

    return (
      <>
        {(step === 'show_checklist' || step === 'show_file_upload' || step === 'checklist_typing') && (
          <motion.div className="flex items-end gap-3 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5" /></div>
            <div className="max-w-xl">
              <div className="space-y-3">
                <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-none bg-gray-100 text-slate-700">
                  <p>Xin chào! Tôi là AI Agent hỗ trợ thủ tục Chuyển ngành. Hệ thống đã truy xuất dữ liệu của bạn. Vui lòng xác nhận đáp ứng đủ các điều kiện sau:</p>
                </div>
                <ConditionChecklist conditions={initialConditions} onComplete={handleChecklistComplete} />
                <p className="text-xs text-slate-400 pl-2">14:53</p>
              </div>
            </div>
          </motion.div>
        )}

        {(step === 'show_file_upload') && (
          <motion.div className="flex items-end gap-3 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"><Bot className="h-5 w-5" /></div>
            <div className="max-w-xl">
               <div className="space-y-3">
                  <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-none bg-gray-100 text-slate-700">
                    <p>Tuyệt vời! Bạn đã đủ điều kiện thực hiện thủ tục. Dưới đây là thành phần hồ sơ cần có, hãy thực hiện theo yêu cầu của tôi nhé:</p>
                  </div>
                  <FileUploadList files={requiredFiles} />
                  <p className="text-xs text-slate-400 pl-2">14:55</p>
                </div>
            </div>
          </motion.div>
        )}

        {isTyping && <TypingIndicator />}
      </>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="h-16 shrink-0 border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-primary">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Chuyển ngành</h1>
            <p className="text-xs text-slate-500 leading-tight">Đăng ký chuyển sang ngành học khác</p>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Chat Footer/Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập tin nhắn tại đây..."
              className="w-full rounded-full border-gray-300 bg-gray-50 py-3 pl-12 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <button className="text-gray-400 hover:text-primary transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button className="flex h-9 w-12 items-center justify-center rounded-full bg-primary text-white hover:bg-blue-700 transition-colors">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}