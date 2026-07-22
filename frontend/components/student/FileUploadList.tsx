"use client";

import React from 'react';
import { File, UploadCloud, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type FileItem = {
  name: string;
  status: 'pending' | 'uploading' | 'done';
};

type Props = {
  files: FileItem[];
};

export const FileUploadList = ({ files }: Props) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-md font-bold text-slate-800 mb-4">
        Thành phần hồ sơ
      </h3>
      <ul className="space-y-3">
        {files.map((item, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <button
              className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50/50 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="text-gray-400">
                    <UploadCloud className="h-5 w-5" />
                </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};