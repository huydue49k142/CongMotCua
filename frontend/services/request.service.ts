import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ProcedureRequest {
  id: string;
  student: string;
  request_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RequestHistory {
  id: number;
  status: string;
  actor_name: string;
  notes: string;
  timestamp: string;
}

export interface RequestDocument {
  id: string;
  file: string;
  file_name: string;
  document_type: string;
  document_key?: string;
  uploaded_at: string;
}

export interface SupplementRequirement {
  document_key: string;
  document_name: string;
}

export interface SupplementUpload {
  document_key: string;
  file: File;
}

export interface DetailedRequest {
  id: string;
  student_name: string;
  student_code: string;
  request_type: string;
  status: string;
  submitted_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  history: RequestHistory[];
  documents: RequestDocument[];
  supplement_requirements: SupplementRequirement[];
}

export const requestService = {
  async getMyRequests(): Promise<ProcedureRequest[]> {
    const token = authService.getAccessToken();
    if (!token) return [];
    
    const response = await axios.get(`${API_URL}/requests/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getStaffRequests(): Promise<any[]> {
    const token = authService.getAccessToken();
    if (!token) return [];
    
    const response = await axios.get(`${API_URL}/requests/staff/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getStaffStats(): Promise<any> {
    const token = authService.getAccessToken();
    if (!token) return { pending: 0, warning: 0, rejected: 0, completed: 0 };
    
    const response = await axios.get(`${API_URL}/requests/staff/stats/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getStaffRequestDetail(id: string): Promise<DetailedRequest> {
    const token = authService.getAccessToken();
    const response = await axios.get(`${API_URL}/requests/staff/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteRequest(id: string): Promise<void> {
    const token = authService.getAccessToken();
    await axios.delete(`${API_URL}/requests/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async updateRequestStatus(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
    notes: string = '',
    supplementRequirements: SupplementRequirement[] = []
  ): Promise<any> {
    const token = authService.getAccessToken();
    const response = await axios.post(
      `${API_URL}/requests/staff/${id}/action/`,
      {
        action,
        notes,
        supplement_requirements: supplementRequirements,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getStudentRequestDetail(id: string): Promise<DetailedRequest> {
    const token = authService.getAccessToken();
    const response = await axios.get(`${API_URL}/requests/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async resubmitRequestFiles(
    id: string,
    uploads: SupplementUpload[]
  ): Promise<any> {
    const token = authService.getAccessToken();
    const formData = new FormData();

    uploads.forEach(({ document_key, file }) => {
      formData.append('document_keys', document_key);
      formData.append('files', file);
    });

    const response = await axios.post(
      `${API_URL}/requests/${id}/resubmit/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};