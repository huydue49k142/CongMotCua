"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, CheckCircle, AlertCircle, Eye } from 'lucide-react';

export interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
}

interface DocumentUploadProps {
  title?: string;
  documents: DocumentItem[];
  onUpload?: (docId: string, file: File) => void;
  onRemove?: (docId: string) => void;
  onDownloadForm?: () => void;
  onPreviewForm?: () => void;
  formUrl?: string;
  formName?: string;
}

const DocumentUpload = ({
  title = "Tài liệu cần nộp",
  documents,
  onUpload,
  onRemove,
  onDownloadForm,
  onPreviewForm,
  formUrl,
  formName = "Đơn xin thôi học (mẫu)",
}: DocumentUploadProps) => {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileSelect = (docId: string, file: File) => {
    if (onUpload) onUpload(docId, file);
  };

  const handleDrop = (docId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(docId, file);
  };

  const handleDragOver = (docId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(docId);
  };

  const handleDragLeave = (docId: string) => {
    setDragOver(null);
  };

  const formatFileSize = (name: string) => {
    // Demo: không có file thực, chỉ hiển thị tên
    return name.length > 30 ? name.slice(0, 27) + '...' : name;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">📎 {title}</h4>
        <span className="text-xs text-slate-400">
          {documents.filter(d => d.uploaded).length}/{documents.length} đã tải
        </span>
      </div>

      {/* Đơn mẫu - tải về */}
      {onDownloadForm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{formName}</p>
                <p className="text-xs text-slate-500">Tải về, in và điền thông tin</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onPreviewForm && (
                <button
                  onClick={onPreviewForm}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Xem trước"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onDownloadForm}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Tải đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách giấy tờ cần upload */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`relative border rounded-lg p-3 transition-all ${
              doc.uploaded
                ? 'border-green-200 bg-green-50/50'
                : dragOver === doc.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
            }`}
            onDragOver={(e) => handleDragOver(doc.id, e)}
            onDragLeave={() => handleDragLeave(doc.id)}
            onDrop={(e) => handleDrop(doc.id, e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg ${
                  doc.uploaded ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {doc.uploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-0.5">*</span>}
                  </p>
                  {doc.uploaded && doc.fileName && (
                    <p className="text-xs text-green-600 truncate">{formatFileSize(doc.fileName)}</p>
                  )}
                  {!doc.uploaded && (
                    <p className="text-xs text-slate-400">Chưa tải lên</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {doc.uploaded ? (
                  <button
                    onClick={() => onRemove?.(doc.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Chọn file
                    </button>
                    <input
                      ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(doc.id, file);
                        e.target.value = '';
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Drop hint khi kéo thả */}
            {!doc.uploaded && dragOver === doc.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 rounded-lg border-2 border-dashed border-blue-400">
                <p className="text-sm font-medium text-blue-600">Thả file để tải lên</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hint nhỏ */}
      {documents.some(d => !d.uploaded) && (
        <p className="text-[10px] text-slate-400 mt-2">
          Hỗ trợ: PDF, JPG, PNG • Kéo thả hoặc bấm để chọn file
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
