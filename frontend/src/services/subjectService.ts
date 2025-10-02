import axios from 'axios';
import { Subject, SubjectCreate, SubjectUpdate, ClassAssignment, SubjectSummary } from '../types/subject';

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

export const subjectService = {
  // Get all subjects with pagination
  async getSubjects(skip: number = 0, limit: number = 100): Promise<Subject[]> {
    const response = await api.get(`/api/subjects/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get subject by ID
  async getSubject(subjectId: number): Promise<Subject> {
    const response = await api.get(`/api/subjects/${subjectId}`);
    return response.data;
  },

  // Create new subject
  async createSubject(subjectData: SubjectCreate): Promise<Subject> {
    const response = await api.post('/api/subjects/', subjectData);
    return response.data;
  },

  // Update subject
  async updateSubject(subjectId: number, subjectData: SubjectUpdate): Promise<Subject> {
    const response = await api.patch(`/api/subjects/${subjectId}`, subjectData);
    return response.data;
  },

  // Get subject class assignments
  async getSubjectClassAssignments(subjectId: number): Promise<ClassAssignment[]> {
    const response = await api.get(`/api/subjects/${subjectId}/assignments`);
    return response.data;
  },

  // Search subjects
  async searchSubjects(query: string): Promise<Subject[]> {
    const response = await api.get(`/api/subjects/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get subjects by grade level
  async getSubjectsByGradeLevel(gradeLevel: string): Promise<Subject[]> {
    const response = await api.get(`/api/subjects/?grade_level=${encodeURIComponent(gradeLevel)}`);
    return response.data;
  },

  // Get subject summary
  async getSubjectSummary(subjectId: number): Promise<SubjectSummary> {
    const response = await api.get(`/api/subjects/${subjectId}/summary`);
    return response.data;
  },
};

