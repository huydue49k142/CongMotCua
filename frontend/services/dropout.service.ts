// 1. Định nghĩa kiểu dữ liệu (Interfaces)
export interface StudentProfile {
  fullName: string;
  studentId: string;
  dob: string;
  classId: string;
  major: string;
  batch: string;
  phone: string;
  email: string;
}

export interface DropoutFormData {
  reason: string;
  expectedDate: string;
  contactAddress: string;
  notes?: string;
}

// 2. Hàm gọi API để lấy thông tin sinh viên tự động điền
export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fullName: 'Nguyễn Văn An',
          studentId: 'DH4a10001',
          dob: '01/01/2003',
          classId: 'CNTT01',
          major: 'Công nghệ Thông tin',
          batch: '2024',
          phone: '0912 345 678',
          email: 'vanan.2003@ou.edu.vn',
        });
      }, 800);
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sinh viên:", error);
    throw error;
  }
};

// 3. Hàm gọi API để gửi hồ sơ xin thôi học lên hệ thống
export const submitDropoutRequest = async (data: DropoutFormData) => {
  try {
    console.log('Đang gửi yêu cầu thôi học với dữ liệu:', data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Nộp hồ sơ thành công!" });
      }, 1000);
    });
  } catch (error) {
    console.error("Lỗi khi nộp đơn thôi học:", error);
    throw error;
  }
};