import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const parentService = {
  // Get parent's children
  async getParentChildren(parentId: number): Promise<any[]> {
    const response = await api.get(`/api/parents/${parentId}/children`);
    return response.data;
  },

  // Get parent profile
  async getParentProfile(parentId: number): Promise<any> {
    const response = await api.get(`/api/parents/${parentId}`);
    return response.data;
  },

  // Update parent profile
  async updateParentProfile(parentId: number, data: any): Promise<any> {
    const response = await api.patch(`/api/parents/${parentId}`, data);
    return response.data;
  },

  // Get child summary
  async getChildSummary(parentId: number, childId: number): Promise<any> {
    const response = await api.get(`/api/parents/${parentId}/children/${childId}/summary`);
    return response.data;
  },

  // Send message to school
  async sendMessage(parentId: number, message: string, recipient?: string): Promise<any> {
    const response = await api.post(`/api/parents/${parentId}/messages`, {
      message,
      recipient,
    });
    return response.data;
  },

  // Get messages
  async getMessages(parentId: number): Promise<any[]> {
    const response = await api.get(`/api/parents/${parentId}/messages`);
    return response.data;
  },
};

