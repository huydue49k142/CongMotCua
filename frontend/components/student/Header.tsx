"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, GraduationCap, Zap, Check } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { notificationService, Notification } from '@/services/notification.service';

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      fetchNotifications();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) return;
    try {
      await notificationService.deleteAll();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayName = user?.full_name || user?.name || 'Người dùng';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 bg-primary text-white relative" style={{ gridArea: 'header' }}>
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">
            CỔNG DỊCH VỤ SINH VIÊN
          </span>

          <span className="text-xs text-blue-100 mt-0.5">
            Hệ thống hỗ trợ thủ tục hành chính - AI Agent
          </span>
        </div>
      </div>
      <div className='flex-grow'></div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <button 
            className="relative hover:bg-white/10 p-2 rounded-full transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-primary"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    Không có thông báo nào
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm text-slate-700 ${!notif.is_read ? 'font-medium' : ''}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notif.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-2">
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    Đã đọc
                  </button>
                  <button 
                    onClick={handleDeleteAll}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                  >
                    Xóa hết thông báo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
              {initial}
          </div>
          <div className="text-sm font-semibold">{displayName}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;