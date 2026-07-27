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

export const requestService = {
  async getMyRequests(): Promise<ProcedureRequest[]> {
    const token = authService.getAccessToken();
    if (!token) return [];
    
    const response = await axios.get(`${API_URL}/requests/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
