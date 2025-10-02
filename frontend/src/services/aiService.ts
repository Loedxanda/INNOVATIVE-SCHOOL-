import axios from 'axios';
import { AIQuery, AIResponse } from '../types/ai';

const AI_API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: AI_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export const aiService = {
  // Ask the pedagogic AI a question
  async askAI(query: AIQuery): Promise<AIResponse> {
    const response = await api.post('/api/ai/query', query);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<any> {
    const response = await api.get('/api/ai/health');
    return response.data;
  },
};