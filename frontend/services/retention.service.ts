import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
      phone: '0912 345 678', // Mocked as it's not in DB
      email: data.user?.email || user.email || '',
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
    throw error;
  }
};
