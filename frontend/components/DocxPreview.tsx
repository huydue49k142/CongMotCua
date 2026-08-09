"use client";

import { useEffect, useRef } from "react";
import * as docx from "docx-preview";

export default function DocxPreview({ blob }: { blob: Blob | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blob && containerRef.current) {
      // Xóa nội dung cũ
      containerRef.current.innerHTML = "";
      
      docx.renderAsync(blob, containerRef.current, undefined, {
        className: "docx-viewer",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
      }).catch(err => {
        console.error("Docx preview error:", err);
      });
    }
  }, [blob]);

  if (!blob) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
        Chưa có bản xem trước
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-auto bg-white rounded-lg p-2"
      style={{ minHeight: "500px" }}
    />
  );
}
