"use client";

import React from "react";
import { LogOut, X, ArrowRight } from "lucide-react";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <LogOut className="h-6 w-6 text-primary" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Đăng xuất khỏi hệ thống
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Bạn có chắc chắn muốn đăng xuất không? Phiên làm việc của bạn sẽ kết thúc và bạn cần đăng nhập lại để tiếp tục sử dụng các dịch vụ.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all group"
            >
              <span>Đồng ý</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center py-3 px-4 text-sm font-medium text-primary hover:text-blue-700 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmDialog;