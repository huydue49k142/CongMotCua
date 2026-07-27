import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const token = authService.getAccessToken();
    if (!token) return [];
    const response = await axios.get(`${API_URL}/notifications/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  async markAsRead(id: number): Promise<void> {
    const token = authService.getAccessToken();
    if (!token) return;
    await axios.post(`${API_URL}/notifications/${id}/read/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
