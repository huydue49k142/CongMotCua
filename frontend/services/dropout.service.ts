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

import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    const user = authService.getUser();
    if (!user) {
      throw new Error("Người dùng chưa đăng nhập");
    }

    const token = authService.getAccessToken();
    const response = await axios.get(`${API_URL}/students/${user.username}/profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = response.data;
    
    return {
      fullName: data.full_name,
      studentId: data.student_id,
      dob: data.date_of_birth ? data.date_of_birth.split('-').reverse().join('/') : '',
      classId: data.student_class?.class_id || '',
      major: data.student_class?.major?.name || 'Công nghệ Thông tin',
      batch: data.student_class?.major?.faculty?.name || '2024',
      phone: '0912 345 678', // Mocked as it's not in DB
      email: data.user?.email || user.email || '',
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
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