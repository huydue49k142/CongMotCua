import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface AgentResponse {
  response: string;
  state: string;
  workflow: string;
  status: string;
  intent: string;
  error: string | null;
  tool_result: any;
}

export const agentService = {
  async sendMessage(message: string, sessionId?: string): Promise<AgentResponse> {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/agent/chat/`,
      { 
        message,
        session_id: sessionId 
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async getState(sessionId?: string): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${API_URL}/agent/state/`,
      {
        params: { session_id: sessionId },
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async cancelWorkflow(sessionId?: string): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/agent/cancel/`,
      { session_id: sessionId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
};