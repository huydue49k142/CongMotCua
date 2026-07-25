// frontend/services/major-change.service.ts

export interface ExtractedData {
  fullName: string;
  dob: string;
  enrollmentYear: string;
  studentId: string;
  idNumber: string;
  currentMajor: string;
}

// Hàm giả lập độ trễ của AI khi quét OCR 2 tài liệu
export const extractDocumentData = async (): Promise<ExtractedData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fullName: 'Nguyễn Văn An',
        studentId: 'DH4a10001',
        dob: '01/01/2003',
        classId: 'CNTT01',
        phone: '0912 345 678',
        email: 'vanan.2003@ou.edu.vn',
      });
    }, 2000); // Giả lập AI quét mất 2 giây
  });
};