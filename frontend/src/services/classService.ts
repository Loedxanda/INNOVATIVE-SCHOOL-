import axios from 'axios';
import { Class, ClassCreate, ClassUpdate, ClassAssignment, ClassAssignmentCreate, Enrollment, EnrollmentCreate, ClassSummary } from '../types/class';

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

export const classService = {
  // Get all classes with pagination
  async getClasses(skip: number = 0, limit: number = 100): Promise<Class[]> {
    const response = await api.get(`/api/classes/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get class by ID
  async getClass(classId: number): Promise<Class> {
    const response = await api.get(`/api/classes/${classId}`);
    return response.data;
  },

  // Create new class
  async createClass(classData: ClassCreate): Promise<Class> {
    const response = await api.post('/api/classes/', classData);
    return response.data;
  },

  // Update class
  async updateClass(classId: number, classData: ClassUpdate): Promise<Class> {
    const response = await api.patch(`/api/classes/${classId}`, classData);
    return response.data;
  },

  // Get class assignments
  async getClassAssignments(classId: number): Promise<ClassAssignment[]> {
    const response = await api.get(`/api/classes/${classId}/assignments`);
    return response.data;
  },

  // Create class assignment
  async createClassAssignment(assignmentData: ClassAssignmentCreate): Promise<ClassAssignment> {
    const response = await api.post('/api/classes/assignments', assignmentData);
    return response.data;
  },

  // Update class assignment
  async updateClassAssignment(assignmentId: number, assignmentData: Partial<ClassAssignmentCreate>): Promise<ClassAssignment> {
    const response = await api.patch(`/api/classes/assignments/${assignmentId}`, assignmentData);
    return response.data;
  },

  // Delete class assignment
  async deleteClassAssignment(assignmentId: number): Promise<void> {
    await api.delete(`/api/classes/assignments/${assignmentId}`);
  },

  // Get class enrollments
  async getClassEnrollments(classId: number): Promise<Enrollment[]> {
    const response = await api.get(`/api/classes/${classId}/enrollments`);
    return response.data;
  },

  // Create enrollment
  async createEnrollment(enrollmentData: EnrollmentCreate): Promise<Enrollment> {
    const response = await api.post('/api/classes/enrollments', enrollmentData);
    return response.data;
  },

  // Update enrollment
  async updateEnrollment(enrollmentId: number, enrollmentData: Partial<EnrollmentCreate>): Promise<Enrollment> {
    const response = await api.patch(`/api/classes/enrollments/${enrollmentId}`, enrollmentData);
    return response.data;
  },

  // Delete enrollment
  async deleteEnrollment(enrollmentId: number): Promise<void> {
    await api.delete(`/api/classes/enrollments/${enrollmentId}`);
  },

  // Get class students
  async getClassStudents(classId: number): Promise<any[]> {
    const response = await api.get(`/api/classes/${classId}/students`);
    return response.data;
  },

  // Search classes
  async searchClasses(query: string): Promise<Class[]> {
    const response = await api.get(`/api/classes/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get classes by grade level
  async getClassesByGradeLevel(gradeLevel: string): Promise<Class[]> {
    const response = await api.get(`/api/classes/?grade_level=${encodeURIComponent(gradeLevel)}`);
    return response.data;
  },

  // Get classes by academic year
  async getClassesByAcademicYear(academicYear: string): Promise<Class[]> {
    const response = await api.get(`/api/classes/?academic_year=${encodeURIComponent(academicYear)}`);
    return response.data;
  },

  // Get class summary
  async getClassSummary(classId: number): Promise<ClassSummary> {
    const response = await api.get(`/api/classes/${classId}/summary`);
    return response.data;
  },
};

