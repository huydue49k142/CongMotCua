// frontend/services/major-change.service.ts

export interface ExtractedData {
  fullName: string;
  dob: string;
  enrollmentYear: string;
  studentId: string;
  idNumber: string;
  currentMajor: string;
}

import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface MajorChangeProfile {
  fullName: string;
  dob: string;
  enrollmentYear: string;
  studentId: string;
  idNumber: string;
  currentMajor: string;
  phone?: string;
  admissionScore?: number;
  admissionCombo?: string;
}

export const getMajorChangeProfile = async (): Promise<MajorChangeProfile> => {
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
      currentMajor: data.student_class?.major?.name || 'Công nghệ Thông tin',
      enrollmentYear: data.student_class?.major?.faculty?.name || '2024',
      idNumber: '079203001234', // Mocked CCCD as it might not be in DB
      admissionScore: data.admission_score || 0,
      admissionCombo: data.admission_combo || ''
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
    throw error;
  }
};

export interface Major {
  name: string;
  major_id: string;
  admission_threshold: number;
}

export const getMajors = async (): Promise<Major[]> => {
  try {
    const token = authService.getAccessToken();
    const response = await axios.get(`${API_URL}/students/majors/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ngành:', error);
    throw error;
  }
};