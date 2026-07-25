export interface RetentionProfile {
  fullName: string;
  studentId: string;
  dob: string;
  classId: string;
  phone: string;
  email: string;
}

export const getRetentionProfile = async (): Promise<RetentionProfile> => {
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
        });
      }, 800);
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
    throw error;
  }
};
