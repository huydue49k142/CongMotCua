"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  Minus,
  Send,
  User,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text:
        "Xin chào! 👋 Tôi là trợ lý AI của Cổng dịch vụ sinh viên. " +
        "Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    "Điều kiện chuyển ngành?",
    "Hồ sơ thôi học cần gì?",
    "Bảo lưu xử lý trong bao lâu?",
    "Học tiếp mất mấy ngày?",
  ];

  const handleSendMessage = async (
    textToSend: string
  ) => {
    const normalizedText = textToSend.trim();

    if (!normalizedText || isLoading) {
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        text: normalizedText,
      },
    ]);

    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: normalizedText,
          history: messages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((previousMessages) => [
          ...previousMessages,
          {
            role: "model",
            text:
              data.reply ||
              "Hệ thống chưa nhận được nội dung trả lời.",
          },
        ]);
      } else {
        setMessages((previousMessages) => [
          ...previousMessages,
          {
            role: "model",
            text:
              data.error ||
              "Có lỗi xảy ra từ máy chủ.",
          },
        ]);
      }
    } catch (error) {
      console.error(
        "Lỗi gửi tin nhắn:",
        error
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "model",
          text:
            "Xin lỗi, không thể kết nối tới trợ lý AI lúc này.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-sm leading-none">
                  Trợ lý AI
                </h3>

                <div className="flex items-center gap-1 text-[10px] text-white/80 mt-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span>Đang hoạt động</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
              aria-label="Thu nhỏ chatbot"
            >
              <Minus className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex items-start gap-2 ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : ""
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 text-white ${
                    message.role === "user"
                      ? "bg-blue-500"
                      : "bg-primary"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`p-3 border rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                      : "bg-white border-gray-200 text-slate-700 rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({
                        node: _node,
                        ...props
                      }) => (
                        <a
                          {...props}
                          className="font-bold underline text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      strong: ({
                        node: _node,
                        ...props
                      }) => (
                        <strong
                          {...props}
                          className="font-bold"
                        />
                      ),
                      p: ({
                        node: _node,
                        ...props
                      }) => (
                        <p
                          {...props}
                          className="mb-2 last:mb-0"
                        />
                      ),
                      ul: ({
                        node: _node,
                        ...props
                      }) => (
                        <ul
                          {...props}
                          className="list-disc pl-5 space-y-1 mb-2"
                        />
                      ),
                      ol: ({
                        node: _node,
                        ...props
                      }) => (
                        <ol
                          {...props}
                          className="list-decimal pl-5 space-y-1 mb-2"
                        />
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="p-2 bg-primary rounded-lg text-white shrink-0">
                  <Bot className="h-4 w-4" />
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: "0.2s",
                    }}
                  />
                  <span
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: "0.4s",
                    }}
                  />
                </div>
              </div>
            )}

            {messages.length === 1 &&
              !isLoading && (
                <div className="flex flex-col gap-2 mt-4 ml-10">
                  <p className="text-[11px] font-medium text-slate-500 px-1">
                    Gợi ý cho bạn:
                  </p>

                  {suggestedQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            question
                          )
                        }
                        className="text-left w-fit px-3 py-2 text-xs bg-white border border-blue-100 text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        {question}
                      </button>
                    )
                  )}
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
              <input
                type="text"
                value={inputMessage}
                onChange={(event) =>
                  setInputMessage(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSendMessage(
                      inputMessage
                    );
                  }
                }}
                placeholder="Hỏi bất kỳ điều gì..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 px-2"
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() =>
                  void handleSendMessage(
                    inputMessage
                  )
                }
                className={`p-2 rounded-lg transition-all ${
                  inputMessage.trim() &&
                  !isLoading
                    ? "bg-primary text-white shadow-md hover:bg-primary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={
                  !inputMessage.trim() ||
                  isLoading
                }
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all duration-300 ${
          isOpen
            ? "bg-blue-600 rotate-90"
            : "bg-primary hover:scale-110"
        }`}
        aria-label={
          isOpen
            ? "Đóng chatbot"
            : "Mở chatbot"
        }
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