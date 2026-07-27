"use client";

import React from 'react';
import { ChevronRight, CheckCircle, FileText, Download, Clock, Info, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionDiv = ({ children, index }: { children: React.ReactNode, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {children}
  </motion.div>
);

const conditions = [
  { text: "Hết thời hạn bảo lưu", details: "Sinh viên đã hoàn thành thời gian tạm dừng học tập ghi trên quyết định cũ." },
  { text: "Đủ sức khỏe học tập", details: "Có giấy xác nhận tình trạng sức khỏe ổn định từ cơ sở y tế có thẩm quyền (nếu bảo lưu vì lý do sức khỏe)." },
  { text: "Không trong thời gian bị kỷ luật", details: "Sinh viên không vi phạm các quy định pháp luật hoặc nội quy nhà trường dẫn đến cấm học tập." },
];

const requiredFiles = [
  "Đơn xin học lại",
  "Thời khóa biểu",
];

export default function ResumeInfoPage() {
  return (
    <div className="flex-1 bg-gray-50/50 p-6 sm:p-8 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <nav className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/student/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/student/student-procedure-info" className="hover:text-primary transition-colors">Xem thông tin thủ tục</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="font-medium text-primary">Học tiếp</span>
            </nav>
        </motion.div>

        {/* Header */}
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Học tiếp</h1>
            <p className="mt-2 text-lg text-slate-600 max-w-3xl">
              Thủ tục cho phép sinh viên quay lại học tập sau thời gian bảo lưu hoặc tạm dừng, giúp sinh viên sớm ổn định kế hoạch học tập cá nhân.
            </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <MotionDiv index={1}>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-5">
                        <FileText className="h-6 w-6 text-primary" />
                        Điều kiện thực hiện
                    </h2>
                    <ul className="space-y-4">
                        {conditions.map((item, index) => (
                            <li key={index} className="flex items-start gap-4">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-slate-700">{item.text}</p>
                                {item.details && <p className="text-sm text-slate-500 mt-1">{item.details}</p>}
                            </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </MotionDiv>
            
            <MotionDiv index={3}>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-500" />
                    Lưu ý!
                </h2>
                <p className="text-blue-800">
                  Khi hết thời hạn quy định được phép nghỉ học (theo Quyết định), sinh viên làm đơn xin trở lại học tập, nộp đơn về TaoPhòng Đào tạo. Sinh viên nên thực hiện thủ tục học tiếp ít nhất 2 tuần trước khi học kỳ mới bắt đầu để tránh phát sinh học phí
                </p>
              </div>
            </MotionDiv>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <MotionDiv index={2}>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-5">
                  <FileText className="h-6 w-6 text-primary" />
                  Thành phần hồ sơ
                </h2>
                <ol className="space-y-2.5">
                  {requiredFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary text-sm">{index + 1}.</span>
                        <span className="text-sm font-medium text-slate-700">{file}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </MotionDiv>

            <MotionDiv index={4}>
              <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold uppercase tracking-wider text-blue-200">
                    <Clock className="h-5 w-5" />
                    <span>Thời gian giải quyết</span>
                </div>
                <div className="text-5xl font-extrabold tracking-tight">
                    03 - 05
                </div>
                <p className="text-blue-100 font-medium">Ngày làm việc kể từ khi nhận đủ hồ sơ</p>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}