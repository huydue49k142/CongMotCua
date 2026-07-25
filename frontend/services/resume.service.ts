// Định nghĩa kiểu dữ liệu
export interface ResumeProfile {
  fullName: string;
  studentId: string;
  dob: string;
  classId: string;
  phone: string;
  email: string;
  reservedDecisionNo: string;
  reservedDate: string;
}

// Hàm gọi API lấy thông tin sinh viên và hồ sơ bảo lưu
export const getResumeProfile = async (): Promise<ResumeProfile> => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fullName: 'Nguyễn Văn An',
          studentId: 'DH4a10001',
          dob: '01/01/2003',
          classId: 'CNTT01',
          phone: '0912 345 678',
          email: 'vanan.2003@ou.edu.vn',
          reservedDecisionNo: 'BL-2025-0345',
          reservedDate: '15/12/2025',
        });
      }, 800);
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
    throw error;
  }
};
