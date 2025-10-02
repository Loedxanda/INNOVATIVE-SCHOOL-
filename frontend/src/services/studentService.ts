import axios from 'axios';
import { Student, StudentCreate, StudentUpdate, StudentEnrollment, StudentAttendance, StudentGrade, StudentSummary } from '../types/student';

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

export const studentService = {
  // Get all students with pagination
  async getStudents(skip: number = 0, limit: number = 100): Promise<Student[]> {
    const response = await api.get(`/api/api/students/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get student by ID
  async getStudent(studentId: number): Promise<Student> {
    const response = await api.get(`/api/students/${studentId}`);
    return response.data;
  },

  // Get current user's student profile
  async getMyStudentProfile(): Promise<Student> {
    const response = await api.get('/api/students/me/profile');
    return response.data;
  },

  // Create new student
  async createStudent(studentData: StudentCreate): Promise<Student> {
    const response = await api.post('/api/students/', studentData);
    return response.data;
  },

  // Update student
  async updateStudent(studentId: number, studentData: StudentUpdate): Promise<Student> {
    const response = await api.patch(`/api/students/${studentId}`, studentData);
    return response.data;
  },

  // Get student enrollments
  async getStudentEnrollments(studentId: number): Promise<StudentEnrollment[]> {
    const response = await api.get(`/api/students/${studentId}/enrollments`);
    return response.data;
  },

  // Get student attendance
  async getStudentAttendance(
    studentId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StudentAttendance[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/api/students/${studentId}/attendance?${params.toString()}`);
    return response.data;
  },

  // Get student grades
  async getStudentGrades(studentId: number, subjectId?: number): Promise<StudentGrade[]> {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject_id', subjectId.toString());
    
    const response = await api.get(`/api/students/${studentId}/grades?${params.toString()}`);
    return response.data;
  },

  // Search students
  async searchStudents(query: string): Promise<Student[]> {
    const response = await api.get(`/api/students/?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get students by class
  async getStudentsByClass(classId: number): Promise<Student[]> {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },

  // Get student summary (for parents)
  async getStudentSummary(parentId: number, studentId: number): Promise<StudentSummary> {
    const response = await api.get(`/parents/${parentId}/children/${studentId}/summary`);
    return response.data;
  },
};

