import axios from 'axios';
import { Resource, ResourceCreate, ResourceUpdate, ResourceRating, ResourceComment } from '../types/resource';

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

export const resourceService = {
  // Create a new resource
  async createResource(resourceData: ResourceCreate): Promise<Resource> {
    const response = await api.post('/api/resources/', resourceData);
    return response.data;
  },

  // Get all resources with optional filtering
  async getResources(params?: {
    skip?: number;
    limit?: number;
    subjectId?: number;
    gradeLevel?: string;
  }): Promise<Resource[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.subjectId !== undefined) queryParams.append('subject_id', params.subjectId.toString());
    if (params?.gradeLevel !== undefined) queryParams.append('grade_level', params.gradeLevel);

    const response = await api.get(`/api/resources/?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific resource by ID
  async getResource(resourceId: number): Promise<Resource> {
    const response = await api.get(`/api/resources/${resourceId}`);
    return response.data;
  },

  // Update a resource
  async updateResource(resourceId: number, resourceData: ResourceUpdate): Promise<Resource> {
    const response = await api.put(`/api/resources/${resourceId}`, resourceData);
    return response.data;
  },

  // Delete a resource
  async deleteResource(resourceId: number): Promise<void> {
    await api.delete(`/api/resources/${resourceId}`);
  },

  // Rate a resource
  async rateResource(resourceId: number, rating: number): Promise<ResourceRating> {
    const response = await api.post(`/api/resources/${resourceId}/ratings`, { resource_id: resourceId, rating });
    return response.data;
  },

  // Get resource ratings
  async getResourceRatings(resourceId: number): Promise<ResourceRating[]> {
    const response = await api.get(`/api/resources/${resourceId}/ratings`);
    return response.data;
  },

  // Comment on a resource
  async commentOnResource(resourceId: number, comment: string, parentCommentId?: number): Promise<ResourceComment> {
    const requestData: any = { resource_id: resourceId, comment };
    if (parentCommentId !== undefined) requestData.parent_comment_id = parentCommentId;
    
    const response = await api.post(`/api/resources/${resourceId}/comments`, requestData);
    return response.data;
  },

  // Get resource comments
  async getResourceComments(resourceId: number): Promise<ResourceComment[]> {
    const response = await api.get(`/api/resources/${resourceId}/comments`);
    return response.data;
  },

  // Upload a resource file
  async uploadResourceFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};