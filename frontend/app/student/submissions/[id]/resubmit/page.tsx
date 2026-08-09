"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Clock,
  UploadCloud,
  Paperclip,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  requestService,
  DetailedRequest,
  SupplementRequirement,
} from '@/services/request.service';

const getRequestTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    MAJOR_CHANGE: 'Chuyển ngành',
    ACADEMIC_LEAVE: 'Bảo lưu',
    RESUME_STUDIES: 'Xin học tiếp',
    DROPOUT: 'Thôi học',
  };
  return map[type] || type;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

export default function ResubmitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<DetailedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitFiles, setResubmitFiles] = useState<Record<string, File>>({});
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      void fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await requestService.getStudentRequestDetail(id);
      setRequest(data);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hồ sơ:', error);
      alert('Không thể tải dữ liệu hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Chỉ chấp nhận file PDF, JPG, JPEG hoặc PNG.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File không được vượt quá 5MB.';
    }

    return null;
  };

  const handleFileSelect = (
    requirement: SupplementRequirement,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Cho phép chọn lại đúng file sau khi gỡ.
    event.target.value = '';

    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setResubmitFiles((current) => ({
      ...current,
      [requirement.document_key]: file,
    }));
  };

  const removeFile = (documentKey: string) => {
    setResubmitFiles((current) => {
      const next = { ...current };
      delete next[documentKey];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-10 text-center text-gray-500">
        Không tìm thấy thông tin hồ sơ.
      </div>
    );
  }

  const typeLabel = getRequestTypeLabel(request.request_type);
  const shortId = `HS${request.id.split('-')[0].toUpperCase()}`;
  const requirements = request.supplement_requirements || [];

  const latestSupplementHistory = request.history?.find(
    (item) => item.status === 'ADDITIONAL_INFO_REQUIRED'
  );

  const allRequiredFilesSelected =
    requirements.length > 0 &&
    requirements.every(
      (requirement) => Boolean(resubmitFiles[requirement.document_key])
    );

  const handleResubmit = async () => {
    if (!allRequiredFilesSelected) return;

    const uploads = requirements.map((requirement) => ({
      document_key: requirement.document_key,
      file: resubmitFiles[requirement.document_key],
    }));

    setResubmitting(true);

    try {
      await requestService.resubmitRequestFiles(id, uploads);
      router.push(`/student/submissions/${id}`);
    } catch (error: any) {
      console.error('Lỗi khi tải file bổ sung:', error);
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          'Có lỗi xảy ra khi nộp file bổ sung.'
      );
      setResubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-8 pt-8">
        <h1 className="text-xl font-medium text-slate-800 flex items-center gap-2">
          {typeLabel} ({shortId})
          <span className="text-slate-300">|</span>
          <span className="font-bold text-slate-900">Yêu cầu bổ sung</span>
        </h1>

        <button
          onClick={() => router.push('/student/submissions')}
          className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2 text-slate-700 shadow-sm"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>

      <div className="px-8 pb-12">
        {latestSupplementHistory?.notes && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-orange-500"
              />
              <div>
                <p className="font-semibold text-orange-800">
                  Yêu cầu từ Phòng Đào tạo
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-orange-700">
                  {latestSupplementHistory.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6 gap-4">
                <h3 className="font-bold text-slate-800">
                  Tài liệu Phòng Đào tạo yêu cầu bổ sung
                </h3>
                <span className="text-sm text-slate-500 text-right">
                  Định dạng: PDF, JPG, PNG (Max 5MB)
                </span>
              </div>

              {requirements.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                    <div>
                      <p className="font-semibold text-amber-800">
                        Chưa xác định tài liệu cần bổ sung
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        Yêu cầu này được tạo trước khi hệ thống lưu loại tài liệu
                        cụ thể. Vui lòng liên hệ Phòng Đào tạo để cán bộ tạo lại
                        yêu cầu bổ sung.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {requirements.map((requirement) => {
                    const selectedFile =
                      resubmitFiles[requirement.document_key];

                    return (
                      <div
                        key={requirement.document_key}
                        className="border border-slate-200 rounded-lg p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="bg-slate-100 p-3 rounded-md shrink-0">
                              <FileText
                                className="text-slate-600"
                                size={24}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {requirement.document_name}
                              </p>

                              {selectedFile ? (
                                <p
                                  className="text-sm text-green-600 flex items-center gap-1 mt-1 font-medium"
                                  title={selectedFile.name}
                                >
                                  <CheckCircle2 size={14} className="shrink-0" />
                                  <span className="truncate">
                                    {selectedFile.name}
                                  </span>
                                </p>
                              ) : (
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                  <Clock size={14} />
                                  Chưa được tải lên
                                </p>
                              )}
                            </div>
                          </div>

                          {!selectedFile ? (
                            <label className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                              <UploadCloud size={18} />
                              Tải lên
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(event) =>
                                  handleFileSelect(requirement, event)
                                }
                              />
                            </label>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                removeFile(requirement.document_key)
                              }
                              className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <XCircle size={18} />
                              Gỡ bỏ
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="font-bold text-slate-800 mb-6">
                Tóm tắt hồ sơ hiện tại
              </h3>

              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  THÔNG TIN CÁ NHÂN
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {request.student_name}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  MSSV: {request.student_code}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  TỆP ĐÃ NỘP
                </p>
                <div className="flex flex-col gap-3">
                  {request.documents && request.documents.length > 0 ? (
                    request.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <Paperclip
                          size={16}
                          className="text-slate-400 shrink-0"
                        />
                        <span
                          className="truncate"
                          title={doc.file_name}
                        >
                          {doc.file_name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">
                      Không có tài liệu nào
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-3 text-sm text-slate-700 px-2">
            <ShieldCheck size={24} className="text-slate-800 shrink-0" />
            <p>
              Bằng cách nhấn gửi, bạn cam kết các tài liệu bổ sung là chính xác
              và hoàn toàn chịu trách nhiệm về tính pháp lý.
            </p>
          </div>

          <div className="flex gap-3 shrink-0 justify-end">
            <button
              onClick={() => router.push(`/student/submissions/${id}`)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition text-slate-700"
            >
              Hủy bỏ
            </button>

            <button
              disabled={!allRequiredFilesSelected || resubmitting}
              onClick={handleResubmit}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                !allRequiredFilesSelected || resubmitting
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-[#0070F4] text-white hover:bg-blue-700'
              }`}
            >
              {resubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Gửi bổ sung hồ sơ'
              )}
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}