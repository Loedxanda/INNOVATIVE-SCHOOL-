import axios from 'axios';
import { Teacher, TeacherCreate, TeacherUpdate, TeacherClass, TeacherStudent, TeacherAttendance, TeacherGrade } from '../types/teacher';

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

export const teacherService = {
  // Get all teachers with pagination
  async getTeachers(skip: number = 0, limit: number = 100): Promise<Teacher[]> {
    const response = await api.get(`/api/teachers/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get teacher by ID
  async getTeacher(teacherId: number): Promise<Teacher> {
    const response = await api.get(`/api/teachers/${teacherId}`);
    return response.data;
  },

  // Get current user's teacher profile
  async getMyTeacherProfile(): Promise<Teacher> {
    const response = await api.get('/api/teachers/me/profile');
    return response.data;
  },

  // Create new teacher
  async createTeacher(teacherData: TeacherCreate): Promise<Teacher> {
    const response = await api.post('/api/teachers/', teacherData);
    return response.data;
  },

  // Update teacher
  async updateTeacher(teacherId: number, teacherData: TeacherUpdate): Promise<Teacher> {
    const response = await api.patch(`/api/teachers/${teacherId}`, teacherData);
    return response.data;
  },

  // Get teacher's classes
  async getTeacherClasses(teacherId: number, academicYear?: string): Promise<TeacherClass[]> {
    const params = new URLSearchParams();
    if (academicYear) params.append('academic_year', academicYear);
    
    const response = await api.get(`/api/teachers/${teacherId}/classes?${params.toString()}`);
    return response.data;
  },

  // Get teacher's students
  async getTeacherStudents(teacherId: number, classId?: number): Promise<TeacherStudent[]> {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    
    const response = await api.get(`/api/teachers/${teacherId}/students?${params.toString()}`);
    return response.data;
  },

  // Mark attendance
  async markAttendance(
    teacherId: number,
    studentId: number,
    classId: number,
    date: string,
    status: string,
    notes?: string
  ): Promise<any> {
    const response = await api.post(`/api/teachers/${teacherId}/attendance/mark`, {
      student_id: studentId,
      class_id: classId,
      date,
      status,
      notes,
    });
    return response.data;
  },

  // Mark bulk attendance
  async markBulkAttendance(
    teacherId: number,
    classId: number,
    date: string,
    attendanceData: Array<{
      student_id: number;
      status: string;
      notes?: string;
    }>
  ): Promise<any> {
    const response = await api.post(`/api/teachers/${teacherId}/attendance/mark-bulk`, {
      class_id: classId,
      date,
      attendance_data: attendanceData,
    });
    return response.data;
  },

  // Add grade
  async addGrade(
    teacherId: number,
    studentId: number,
    subjectId: number,
    classId: number,
    gradeValue: number,
    maxGrade: number = 100,
    gradeType?: string,
    description?: string
  ): Promise<any> {
    const response = await api.post(`/api/teachers/${teacherId}/grades/add`, {
      student_id: studentId,
      subject_id: subjectId,
      class_id: classId,
      grade_value: gradeValue,
      max_grade: maxGrade,
      grade_type: gradeType,
      description,
    });
    return response.data;
  },

  // Search teachers
  async searchTeachers(query: string): Promise<Teacher[]> {
    const response = await api.get(`/api/teachers/?search=${encodeURIComponent(query)}`);
    return response.data;
  },
};

