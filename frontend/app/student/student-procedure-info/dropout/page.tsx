"use client";

import React from "react";
import {
  ChevronRight,
  CheckCircle,
  FileText,
  Download,
  Clock,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type MotionDivProps = {
  children: React.ReactNode;
  index: number;
};

type RequiredFile = {
  name: string;
  href: string;
  downloadName: string;
};

const MotionDiv = ({ children, index }: MotionDivProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {children}
  </motion.div>
);

const conditions = [
  {
    text: "Tự nguyện nộp đơn xin thôi học",
    details:
      "Sinh viên không bị cưỡng chế thôi học bởi các quyết định kỷ luật khác.",
  },
  {
    text: "Hoàn thành nghĩa vụ học phí",
    details:
      "Đã tất toán các khoản phí, lệ phí và nợ thư viện (nếu có).",
  },
];

const requiredFiles: RequiredFile[] = [
  {
    name: "Đơn xin thôi học",
    href: "/bieu-mau/don-xin-thoi-hoc.docx",
    downloadName: "don-xin-thoi-hoc.docx",
  },
];

export default function DropoutInfoPage() {
  return (
    <div className="flex-1 bg-gray-50/50 p-6 sm:p-8 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <nav className="mb-6 flex items-center text-sm text-gray-500">
            <Link
              href="/student/dashboard"
              className="transition-colors hover:text-primary"
            >
              Trang chủ
            </Link>

            <ChevronRight className="mx-1 h-4 w-4" />

            <Link
              href="/student/student-procedure-info"
              className="transition-colors hover:text-primary"
            >
              Xem thông tin thủ tục
            </Link>

            <ChevronRight className="mx-1 h-4 w-4" />

            <span className="font-medium text-primary">Thôi học</span>
          </nav>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">
            Thôi học
          </h1>

          <p className="mt-2 max-w-3xl text-lg text-slate-600">
            Thủ tục dành cho sinh viên có nguyện vọng dừng việc học tập tại
            trường hoàn toàn. Vui lòng đọc kỹ các điều kiện trước khi thực hiện.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            <MotionDiv index={1}>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-800">
                  <FileText className="h-6 w-6 text-primary" />
                  Điều kiện thực hiện
                </h2>

                <ul className="space-y-4">
                  {conditions.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />

                      <div>
                        <p className="font-semibold text-slate-700">
                          {item.text}
                        </p>

                        {item.details && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </MotionDiv>

            <MotionDiv index={3}>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-slate-800">
                  <Lightbulb className="h-6 w-6 text-blue-500" />
                  Lưu ý!
                </h2>

                <p className="text-blue-800">
                  Sinh viên nên nộp đơn thôi học vào cuối học kỳ để tránh việc
                  phải đóng học phí cho học kỳ tiếp theo đã đăng ký.
                </p>
              </div>
            </MotionDiv>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <MotionDiv index={2}>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-slate-800">
                  <FileText className="h-6 w-6 text-primary" />
                  Danh sách hồ sơ
                </h2>

                <ol className="space-y-2.5">
                  {requiredFiles.map((file, index) => (
                    <li
                      key={file.href}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}.
                        </span>

                        <span className="text-sm font-medium text-slate-700">
                          {file.name}
                        </span>
                      </div>

                      <a
                        href={file.href}
                        download={file.downloadName}
                        aria-label={`Tải xuống ${file.name}`}
                        title={`Tải xuống ${file.name}`}
                        className="rounded-md p-1.5 text-primary transition-colors hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </MotionDiv>

            <MotionDiv index={4}>
              <div className="rounded-2xl bg-primary p-6 text-white shadow-lg shadow-blue-500/20">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-200">
                  <Clock className="h-5 w-5" />
                  <span>Thời gian giải quyết</span>
                </div>

                <div className="text-5xl font-extrabold tracking-tight">
                  07 - 10
                </div>

                <p className="font-medium text-blue-100">
                  Ngày làm việc kể từ khi nhận đủ hồ sơ
                </p>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}