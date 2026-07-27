import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    full_name: string;
  };
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/login/`, data);
    const { access, refresh, user } = response.data;
    
    // Lưu vào localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Lưu vào Cookie để middleware đọc được
    document.cookie = `access_token=${access}; path=/; SameSite=Lax`;
    
    return response.data;
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Xóa cookie
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },

  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async verifyUsername(username: string): Promise<boolean> {
    const response = await axios.post(`${API_URL}/users/verify-username/`, { username });
    return response.data.exists;
  },

  async resetPassword(username: string, new_password: string): Promise<void> {
    await axios.post(`${API_URL}/users/reset-password/`, { username, new_password });
  }
};