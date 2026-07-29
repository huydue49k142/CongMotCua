import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
      reservedDecisionNo: `BL-${new Date().getFullYear()}-0345`, // Mocked
      reservedDate: '15/12/2025', // Mocked
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
    throw error;
  }
};

export const scanResumeDocument = async (file: File): Promise<{format_valid: boolean; title_valid: boolean; signature_present: boolean; error?: string}> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/thoi-hoc/scan-resume/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi scan AI:', error);
    throw error;
  }
};

export const submitResumeApplication = async (courses: {code: string; name: string; credits: string}[], file: File): Promise<{success: boolean; trackingCode: string; requestId: string; error?: string}> => {
  try {
    const token = authService.getAccessToken();
    const formData = new FormData();
    formData.append('courses', JSON.stringify(courses));
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/thoi-hoc/submit-resume/`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi nộp hồ sơ:', error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};
