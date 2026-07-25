"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// Định nghĩa kiểu dữ liệu tin nhắn
interface Message {
  role: 'user' | 'model';
  text: string;
}



const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Khởi tạo danh sách tin nhắn với câu chào mặc định
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Xin chào! 👋 Tôi là trợ lý AI của Cổng dịch vụ sinh viên. Tôi có thể giúp gì cho bạn hôm nay?' 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestedQuestions = [
    "Điều kiện chuyển ngành?",
    "Hồ sơ thôi học cần gì?",
    "Cách bảo lưu kết quả học tập?",
    "Thủ tục quay lại học tiếp?",
  ];

  // Hàm xử lý gửi tin nhắn gọi API
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // 1. Thêm câu hỏi của user vào giao diện
    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInputMessage(''); // Xóa ô nhập liệu
    setIsLoading(true);

    try {
      // 2. Gọi API Route Next.js đã tạo
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(msg => ({ role: msg.role, text: msg.text })) // Gửi lịch sử chat
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Thêm câu trả lời của AI vào giao diện
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: data.error || 'Có lỗi xảy ra từ máy chủ.' }]);
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, không thể kết nối tới trợ lý AI lúc này.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Khung Chat */}
      {isOpen && (
        <div className="w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
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
              <Minus className="h-5 w-5" />
            </button>
          </div>

          {/* Khu vực hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Icon User hoặc Bot */}
                <div className={`p-2 rounded-lg shrink-0 text-white ${msg.role === 'user' ? 'bg-blue-500' : 'bg-primary'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bong bóng tin nhắn */}
                <div className={`p-3 border rounded-2xl text-sm leading-relaxed whitespace-pre-wrap max-w-[80%] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                    : 'bg-white border-gray-200 text-slate-700 rounded-tl-none'
                }`}>
                  <ReactMarkdown 
                    components={{
                      a: ({node, ...props}) => (
                        <a 
                          {...props} 
                          className="font-bold underline text-blue-600 hover:text-blue-800" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                        />
                      ),
                      strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
                      p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Khối loading khi chờ AI trả lời */}
            {isLoading && (
               <div className="flex items-start gap-2 max-w-[85%]">
                 <div className="p-2 bg-primary rounded-lg text-white shrink-0">
                   <Bot className="h-4 w-4" />
                 </div>
                 <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                 </div>
               </div>
            )}

            {/* Gợi ý câu hỏi (chỉ hiện khi chưa có nhiều tin nhắn) */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-col gap-2 mt-4 ml-10">
                <p className="text-[11px] font-medium text-slate-500 px-1">Gợi ý cho bạn:</p>
                {suggestedQuestions.map((q, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSendMessage(q)} // Bấm vào là gửi luôn
                    className="text-left w-fit px-3 py-2 text-xs bg-white border border-blue-100 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            
            {/* Điểm neo để tự động cuộn */}
            <div ref={messagesEndRef} />
          </div>

          {/* Khu vực nhập liệu */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                placeholder="Hỏi bất kỳ điều gì..." 
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 px-2"
                disabled={isLoading}
              />
              <button 
                onClick={() => handleSendMessage(inputMessage)}
                className={`p-2 rounded-lg transition-all ${inputMessage.trim() && !isLoading ? 'bg-primary text-white shadow-md hover:bg-primary/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nút bật/tắt (Nằm ngoài cùng góc phải) */}
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



