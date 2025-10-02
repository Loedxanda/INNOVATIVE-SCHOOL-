import axios from 'axios';
import { Inquiry, InquiryCreate, InquiryUpdate, InquiryComment, InquiryCommentCreate } from '../types/inquiry';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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

export const inquiryService = {
  // Create a new inquiry
  async createInquiry(inquiryData: InquiryCreate): Promise<Inquiry> {
    const response = await api.post('/api/inquiries/', inquiryData);
    return response.data;
  },

  // Get all inquiries with optional filtering
  async getInquiries(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    department?: string;
  }): Promise<Inquiry[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.status !== undefined) queryParams.append('status', params.status);
    if (params?.department !== undefined) queryParams.append('department', params.department);

    const response = await api.get(`/api/inquiries/?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific inquiry by ID
  async getInquiry(inquiryId: number): Promise<Inquiry> {
    const response = await api.get(`/api/inquiries/${inquiryId}`);
    return response.data;
  },

  // Get an inquiry by ticket number
  async getInquiryByTicket(ticketNumber: string): Promise<Inquiry> {
    const response = await api.get(`/api/inquiries/ticket/${ticketNumber}`);
    return response.data;
  },

  // Update an inquiry
  async updateInquiry(inquiryId: number, inquiryData: InquiryUpdate): Promise<Inquiry> {
    const response = await api.put(`/api/inquiries/${inquiryId}`, inquiryData);
    return response.data;
  },

  // Add a comment to an inquiry
  async addInquiryComment(inquiryId: number, commentData: InquiryCommentCreate): Promise<any> {
    const response = await api.post(`/api/inquiries/${inquiryId}/comments`, commentData);
    return response.data;
  },

  // Get inquiry comments
  async getInquiryComments(inquiryId: number): Promise<InquiryComment[]> {
    const response = await api.get(`/api/inquiries/${inquiryId}/comments`);
    return response.data;
  },

  // Assign an inquiry to a user
  async assignInquiry(inquiryId: number, assigneeId: number): Promise<any> {
    const response = await api.post(`/api/inquiries/${inquiryId}/assign`, { assignee_id: assigneeId });
    return response.data;
  },

  // Update inquiry status
  async updateInquiryStatus(inquiryId: number, status: string): Promise<any> {
    const response = await api.post(`/api/inquiries/${inquiryId}/status`, { status });
    return response.data;
  },
};