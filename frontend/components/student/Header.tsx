"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bell,
} from "lucide-react";

import { authService } from "@/services/auth.service";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import {
  getStudentProfile,
} from "@/services/dropout.service";

const Header = () => {
  const [user, setUser] =
    useState<any>(null);

  const [
    studentFullName,
    setStudentFullName,
  ] = useState("");

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const notifRef =
    useRef<HTMLDivElement>(null);

  const fetchNotifications =
    async () => {
      try {
        const data =
          await notificationService
            .getNotifications();

        setNotifications(data);
      } catch (error) {
        console.error(
          "Failed to fetch notifications",
          error
        );
      }
    };

  useEffect(() => {
    let isMounted = true;

    const loadHeaderData = async () => {
      const currentUser =
        authService.getUser();

      if (!currentUser) {
        return;
      }

      if (isMounted) {
        setUser(currentUser);
      }

      /*
       * authService thường chỉ lưu username/role.
       * Vì vậy tải thêm StudentProfile để lấy đúng họ tên.
       */
      try {
        const profile: any =
          await getStudentProfile();

        const fullName = String(
          profile?.full_name ||
          profile?.fullName ||
          profile?.name ||
          ""
        ).trim();

        if (
          isMounted &&
          fullName
        ) {
          setStudentFullName(
            fullName
          );
        }
      } catch (error) {
        console.error(
          "Không thể tải tên sinh viên:",
          error
        );
      }

      if (isMounted) {
        await fetchNotifications();
      }
    };

    void loadHeaderData();

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(
          false
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      isMounted = false;

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleMarkAsRead = async (
    id: number
  ) => {
    try {
      await notificationService
        .markAsRead(id);

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );
    } catch (error) {
      console.error(
        "Failed to mark as read",
        error
      );
    }
  };

  const handleMarkAllAsRead =
    async () => {
      try {
        await notificationService
          .markAllAsRead();

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                is_read: true,
              })
            )
        );
      } catch (error) {
        console.error(
          "Failed to mark all as read",
          error
        );
      }
    };

  const handleDeleteAll =
    async () => {
      const confirmed =
        window.confirm(
          "Bạn có chắc chắn muốn xóa tất cả thông báo?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await notificationService
          .deleteAll();

        setNotifications([]);
      } catch (error) {
        console.error(
          "Failed to delete all notifications",
          error
        );
      }
    };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const displayName =
    studentFullName ||
    user?.student_profile
      ?.full_name ||
    user?.student?.full_name ||
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    "Người dùng";

  const initial =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "N";

  return (
    <header
      className="relative flex items-center justify-between bg-primary px-6 text-white"
      style={{
        gridArea: "header",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white p-1">
          <img
            src="/Logo_DUE.jpg"
            alt="Logo DUE"
            className="h-full w-full rounded-md object-contain"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">
            CỔNG DỊCH VỤ SINH VIÊN
          </span>

          <span className="mt-0.5 text-xs text-blue-100">
            Hệ thống hỗ trợ thủ tục hành chính - AI Agent
          </span>
        </div>
      </div>

      <div className="flex-grow" />

      {/* Right side */}
      <div className="flex items-center gap-6">
        <div
          className="relative"
          ref={notifRef}
        >
          <button
            type="button"
            className="relative rounded-full p-2 transition-colors hover:bg-white/10"
            onClick={() =>
              setShowNotifications(
                (previous) =>
                  !previous
              )
            }
            aria-label="Mở thông báo"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-primary bg-red-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Thông báo
                </h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length ===
                0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Không có thông báo nào
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map(
                      (
                        notification
                      ) => (
                        <button
                          type="button"
                          key={
                            notification.id
                          }
                          onClick={() =>
                            handleMarkAsRead(
                              notification.id
                            )
                          }
                          className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${
                            !notification.is_read
                              ? "bg-blue-50/50"
                              : ""
                          }`}
                        >
                          <div className="flex-1">
                            <p
                              className={`text-sm text-slate-700 ${
                                !notification.is_read
                                  ? "font-medium"
                                  : ""
                              }`}
                            >
                              {
                                notification.message
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                notification.created_at
                              ).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {notifications.length >
                0 && (
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 p-3">
                  <button
                    type="button"
                    onClick={
                      handleMarkAllAsRead
                    }
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                  >
                    Đánh dấu đã đọc
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleDeleteAll
                    }
                    className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                  >
                    Xóa hết thông báo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold">
            {initial}
          </div>

          <div className="text-sm font-semibold">
            {displayName}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;