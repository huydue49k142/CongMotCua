"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, FileText, Clock, UploadCloud, PlusCircle, Paperclip, 
  ShieldCheck, Send, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { requestService, DetailedRequest } from '@/services/request.service';

const getRequestTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'MAJOR_CHANGE': 'Chuyển ngành',
    'ACADEMIC_LEAVE': 'Bảo lưu',
    'RESUME_STUDIES': 'Xin học tiếp',
    'DROPOUT': 'Thôi học'
  };
  return map[type] || type;
};

const getMissingDocumentNames = (type: string) => {
  if (type === 'MAJOR_CHANGE') return ['Giấy báo trúng tuyển THPT'];
  if (type === 'ACADEMIC_LEAVE') return ['Minh chứng hoàn cảnh gia đình'];
  if (type === 'RESUME_STUDIES') return ['Giấy xác nhận của địa phương'];
  if (type === 'DROPOUT') return ['Giấy đồng ý của gia đình'];
  return ['Tài liệu minh chứng'];
};

export default function ResubmitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<DetailedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchData();
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResubmitFile(file);
  };

  const handleResubmit = async () => {
    if (!resubmitFile) return;
    setResubmitting(true);
    try {
      await requestService.resubmitRequestFiles(id, resubmitFile);
      router.push(`/student/submissions/${id}`);
    } catch (error) {
      console.error('Lỗi khi tải file bổ sung:', error);
      alert('Có lỗi xảy ra khi nộp file bổ sung.');
      setResubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  if (!request) {
    return <div className="p-10 text-center text-gray-500">Không tìm thấy thông tin hồ sơ.</div>;
  }

  const typeLabel = getRequestTypeLabel(request.request_type);
  const shortId = `HS${request.id.split('-')[0].toUpperCase()}`;
  const missingDocs = getMissingDocumentNames(request.request_type);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-8 pt-8">
        <h1 className="text-xl font-medium text-slate-800 flex items-center gap-2">
          {typeLabel} ({shortId}) <span className="text-slate-300">|</span> <span className="font-bold text-slate-900">Yêu cầu bổ sung</span>
        </h1>
        
        <button 
          onClick={() => router.push(`/student/submissions`)} 
          className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2 text-slate-700 shadow-sm"
        >
           <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>

      <div className="px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Upload Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Khu vực tải lên minh chứng</h3>
                <span className="text-sm text-slate-500">Định dạng: PDF, JPG, PNG (Max 5MB)</span>
              </div>

              {/* Main Document Requirement */}
              <div className="border border-slate-200 rounded-lg p-5 flex justify-between items-center mb-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 p-3 rounded-md">
                    <FileText className="text-slate-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{missingDocs[0]}</p>
                    {resubmitFile ? (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1 font-medium">
                        <CheckCircle2 size={14} /> {resubmitFile.name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={14} /> Chưa được tải lên
                      </p>
                    )}
                  </div>
                </div>
                {!resubmitFile ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <UploadCloud size={18} /> Tải lên
                  </button>
                ) : (
                  <button 
                    onClick={() => setResubmitFile(null)}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 border border-red-200 rounded-md px-4 py-2 hover:bg-red-50 transition"
                  >
                    <XCircle size={18} /> Gỡ bỏ
                  </button>
                )}
              </div>

              {/* Other Documents */}
              <div 
                onClick={() => !resubmitFile && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition ${
                  resubmitFile ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-300 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <PlusCircle className="text-slate-800 mb-3" size={28} />
                <p className="text-sm font-medium text-slate-800">Thêm minh chứng khác (không bắt buộc)</p>
              </div>

              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="font-bold text-slate-800 mb-6">Tóm tắt hồ sơ hiện tại</h3>
              
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">THÔNG TIN CÁ NHÂN</p>
                <p className="text-sm font-medium text-slate-800">{request.student_name}</p>
                <p className="text-sm text-slate-600 mt-1">MSSV: {request.student_code}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">TỆP ĐÃ NỘP</p>
                <div className="flex flex-col gap-3">
                  {request.documents && request.documents.length > 0 ? (
                    request.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <Paperclip size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate" title={doc.file_name}>{doc.file_name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">Không có tài liệu nào</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm text-slate-700 px-2">
            <ShieldCheck size={24} className="text-slate-800" />
            <p>Bằng cách nhấn gửi, bạn cam kết các tài liệu bổ sung là chính xác và hoàn toàn chịu trách nhiệm về tính pháp lý.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => router.push(`/student/submissions/${id}`)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition text-slate-700"
            >
              Hủy bỏ
            </button>
            <button 
              disabled={!resubmitFile || resubmitting}
              onClick={handleResubmit}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                !resubmitFile || resubmitting
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-[#0070F4] text-white hover:bg-blue-700'
              }`}
            >
              {resubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Gửi bổ sung hồ sơ'} <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
