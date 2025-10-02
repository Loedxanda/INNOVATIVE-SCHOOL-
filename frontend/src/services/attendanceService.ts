import axios from 'axios';
import { 
  Attendance, 
  AttendanceCreate, 
  AttendanceUpdate, 
  BulkAttendanceCreate, 
  AttendanceSummary, 
  ClassAttendanceSummary, 
  AttendanceReport 
} from '../types/attendance';

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

export const attendanceService = {
  // Get attendance records with pagination
  async getAttendance(
    skip: number = 0, 
    limit: number = 100,
    filters?: {
      student_id?: number;
      class_id?: number;
      start_date?: string;
      end_date?: string;
      status?: string;
    }
  ): Promise<Attendance[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    if (filters?.student_id) params.append('student_id', filters.student_id.toString());
    if (filters?.class_id) params.append('class_id', filters.class_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/api/attendance/?${params.toString()}`);
    return response.data;
  },

  // Get attendance by ID
  async getAttendanceById(attendanceId: number): Promise<Attendance> {
    const response = await api.get(`/api/attendance/${attendanceId}`);
    return response.data;
  },

  // Mark attendance for a single student
  async markAttendance(attendanceData: AttendanceCreate): Promise<Attendance> {
    const response = await api.post('/api/attendance/', attendanceData);
    return response.data;
  },

  // Mark bulk attendance for a class
  async markBulkAttendance(bulkData: BulkAttendanceCreate): Promise<Attendance[]> {
    const response = await api.post('/api/attendance/bulk', bulkData);
    return response.data;
  },

  // Update attendance record
  async updateAttendance(attendanceId: number, attendanceData: AttendanceUpdate): Promise<Attendance> {
    const response = await api.patch(`/api/attendance/${attendanceId}`, attendanceData);
    return response.data;
  },

  // Delete attendance record
  async deleteAttendance(attendanceId: number): Promise<void> {
    await api.delete(`/api/attendance/${attendanceId}`);
  },

  // Get attendance summary for a student
  async getStudentAttendanceSummary(
    studentId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<AttendanceSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/api/attendance/student/${studentId}/summary?${params.toString()}`);
    return response.data;
  },

  // Get class attendance summary for a specific date
  async getClassAttendanceSummary(
    classId: number, 
    date: string
  ): Promise<ClassAttendanceSummary> {
    const response = await api.get(`/api/attendance/class/${classId}/summary?date=${date}`);
    return response.data;
  },

  // Get attendance report for a period
  async getAttendanceReport(
    startDate: string, 
    endDate: string,
    classId?: number
  ): Promise<AttendanceReport> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (classId) params.append('class_id', classId.toString());
    
    const response = await api.get(`/api/attendance/report?${params.toString()}`);
    return response.data;
  },

  // Get attendance statistics
  async getAttendanceStatistics(
    period: 'daily' | 'weekly' | 'monthly',
    classId?: number,
    studentId?: number
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (classId) params.append('class_id', classId.toString());
    if (studentId) params.append('student_id', studentId.toString());
    
    const response = await api.get(`/api/attendance/statistics?${params.toString()}`);
    return response.data;
  },

  // Get students for attendance marking
  async getStudentsForAttendance(classId: number, date: string): Promise<any[]> {
    const response = await api.get(`/api/attendance/class/${classId}/students?date=${date}`);
    return response.data;
  },

  // Get attendance calendar for a student
  async getStudentAttendanceCalendar(
    studentId: number, 
    year: number, 
    month: number
  ): Promise<any[]> {
    const response = await api.get(`/api/attendance/student/${studentId}/calendar?year=${year}&month=${month}`);
    return response.data;
  },

  // Get attendance trends
  async getAttendanceTrends(
    classId?: number,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (classId) params.append('class_id', classId.toString());
    
    const response = await api.get(`/api/attendance/trends?${params.toString()}`);
    return response.data;
  },
};

