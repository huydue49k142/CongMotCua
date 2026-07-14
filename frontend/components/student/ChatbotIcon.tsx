"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatbotIcon = () => {
  return (
    <button
      className="fixed bottom-8 right-8 h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform"
      aria-label="Open Chatbot"
    >
      <MessageCircle className="h-8 w-8 text-white" />
    </button>
  );
};

export default ChatbotIcon;