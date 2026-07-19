"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  GraduationCap, 
  Bot, 
  Activity, 
  FileText, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  X,
  ArrowRight,
  ArrowLeft,
  Unlock
} from 'lucide-react';
import { authService, LoginRequest } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  
  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [forgotId, setForgotId] = useState('');
  const [showForgotId, setShowForgotId] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Bypass login and redirect to student dashboard
    // This is a temporary measure for development/testing
    router.push('/student/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseForgot = () => {
    setIsForgotOpen(false);
    setForgotId('');
    setForgotError(null);
    setForgotStep('verify');
    setShowForgotId(false);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResetError(null);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotId.length < 12) {
      setForgotError('ID người dùng phải có tối thiểu 12 ký tự.');
      return;
    }
    if (!/^\d+$/.test(forgotId)) {
      setForgotError('ID người dùng chỉ được chứa chữ số.');
      return;
    }

    setForgotStep('reset');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 8) {
      setResetError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setResetError('Mật khẩu phải bao gồm cả chữ cái và số.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setForgotStep('success');
  };

  const renderForgotContent = () => {
    if (forgotStep === 'success') {
      return (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Đặt lại mật khẩu thành công!</h3>
          <p className="text-sm text-slate-500 mb-6">
            Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.
          </p>
          <button
            type="button"
            onClick={handleCloseForgot}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </div>
      );
    }

    if (forgotStep === 'reset') {
      const hasMinLength = newPassword.length >= 8;
      const hasLetterAndNumber = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
      const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

      return (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              MẬT KHẨU MỚI
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              XÁC NHẬN MẬT KHẨU
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {resetError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{resetError}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-700 transition-all shadow-lg"
          >
            <span>Lưu mật khẩu</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleCloseForgot}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại màn hình đăng nhập</span>
          </button>
        </form>
      );
    }

    const hasMinLength = forgotId.length >= 12;
    const isNumeric = /^\d+$/.test(forgotId);

    return (
      <form onSubmit={handleVerifySubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            USER NAME
          </label>
          <div className="relative">
            <input
              type={showForgotId ? 'text' : 'password'}
              value={forgotId}
              onChange={(e) => setForgotId(e.target.value)}
              className="block w-full px-4 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 font-mono tracking-widest"
              placeholder="0000 0000 0000"
              maxLength={12}
            />
            <button
              type="button"
              onClick={() => setShowForgotId(!showForgotId)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showForgotId ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {forgotError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{forgotError}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-700 transition-all shadow-lg"
        >
          <span>Xác minh tài khoản</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleCloseForgot}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại màn hình đăng nhập</span>
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE - BRANDING SECTION */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Cổng Dịch vụ <br /> Sinh viên
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Hệ thống hỗ trợ thủ tục hành chính tích hợp AI — nhanh chóng, minh bạch, hiện đại.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-6 mb-12">
          <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 transition-hover hover:bg-white/20">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Trợ lý AI 24/7</h3>
              <p className="text-blue-100 text-sm">Giải đáp mọi thắc mắc về thủ tục học vụ ngay lập tức.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 transition-hover hover:bg-white/20">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Theo dõi hồ sơ thời gian thực</h3>
              <p className="text-blue-100 text-sm">Cập nhật tiến độ xử lý hồ sơ chính xác từng bước.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 transition-hover hover:bg-white/20">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Quản lý giấy tờ điện tử</h3>
              <p className="text-blue-100 text-sm">Số hóa toàn bộ minh chứng, không còn nỗi lo thất lạc.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-900">Đăng nhập</h2>
            <p className="mt-2 text-slate-500">
              Chào mừng bạn quay trở lại! Vui lòng nhập thông tin để tiếp tục.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mã người dùng
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                <input
                  name="identifier"
                  type="text"
                  required
                  className="block w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900"
                  placeholder="Nhập mã sinh viên/nhân viên"
                  value={formData.identifier}
                  onChange={handleChange}
                />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-mono">
                      {formData.identifier.length}/12
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-xs font-medium text-primary hover:text-blue-700 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm transition-all"
          onClick={handleCloseForgot}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Unlock className="h-6 w-6 text-white" />
                </div>
                <button
                  type="button"
                  onClick={handleCloseForgot}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {forgotStep === 'reset' ? 'Thiết lập mật khẩu mới' : 'Quên mật khẩu?'}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {forgotStep === 'reset'
                  ? 'Vui lòng nhập mật khẩu mới cho tài khoản của bạn.'
                  : 'Đừng lo lắng, chúng tôi sẽ hỗ trợ bạn. Nhập ID người dùng của bạn để xác minh tài khoản.'}
              </p>

              {renderForgotContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}