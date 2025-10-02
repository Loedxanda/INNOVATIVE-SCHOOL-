import axios from 'axios';
import { 
  Grade, 
  GradeCreate, 
  GradeUpdate, 
  GradeSummary, 
  ClassGradeSummary, 
  ReportCard, 
  GradeStatistics 
} from '../types/grade';

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

export const gradeService = {
  // Get grades with pagination and filters
  async getGrades(
    skip: number = 0, 
    limit: number = 100,
    filters?: {
      student_id?: number;
      class_id?: number;
      subject_id?: number;
      grade_type?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<Grade[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    if (filters?.student_id) params.append('student_id', filters.student_id.toString());
    if (filters?.class_id) params.append('class_id', filters.class_id.toString());
    if (filters?.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters?.grade_type) params.append('grade_type', filters.grade_type);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const response = await api.get(`/api/grades/?${params.toString()}`);
    return response.data;
  },

  // Get grade by ID
  async getGrade(gradeId: number): Promise<Grade> {
    const response = await api.get(`/api/grades/${gradeId}`);
    return response.data;
  },

  // Create new grade
  async createGrade(gradeData: GradeCreate): Promise<Grade> {
    const response = await api.post('/api/grades/', gradeData);
    return response.data;
  },

  // Update grade
  async updateGrade(gradeId: number, gradeData: GradeUpdate): Promise<Grade> {
    const response = await api.patch(`/api/grades/${gradeId}`, gradeData);
    return response.data;
  },

  // Delete grade
  async deleteGrade(gradeId: number): Promise<void> {
    await api.delete(`/api/grades/${gradeId}`);
  },

  // Get student grade summary
  async getStudentGradeSummary(
    studentId: number, 
    classId?: number,
    subjectId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<GradeSummary> {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    if (subjectId) params.append('subject_id', subjectId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/api/grades/student/${studentId}/summary?${params.toString()}`);
    return response.data;
  },

  // Get class grade summary
  async getClassGradeSummary(
    classId: number, 
    subjectId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ClassGradeSummary> {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject_id', subjectId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/api/grades/class/${classId}/summary?${params.toString()}`);
    return response.data;
  },

  // Generate report card
  async generateReportCard(
    studentId: number,
    classId: number,
    academicYear: string,
    term: string
  ): Promise<ReportCard> {
    const response = await api.get(`/api/grades/report-card/${studentId}?class_id=${classId}&academic_year=${academicYear}&term=${term}`);
    return response.data;
  },

  // Get grade statistics
  async getGradeStatistics(
    startDate: string, 
    endDate: string,
    classId?: number,
    subjectId?: number
  ): Promise<GradeStatistics> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (classId) params.append('class_id', classId.toString());
    if (subjectId) params.append('subject_id', subjectId.toString());
    
    const response = await api.get(`/api/grades/statistics?${params.toString()}`);
    return response.data;
  },

  // Bulk create grades
  async bulkCreateGrades(grades: GradeCreate[]): Promise<Grade[]> {
    const response = await api.post('/api/grades/bulk', { grades });
    return response.data;
  },

  // Get grade types
  async getGradeTypes(): Promise<string[]> {
    const response = await api.get('/api/grades/types');
    return response.data;
  },

  // Calculate letter grade
  calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  },

  // Calculate GPA
  calculateGPA(grades: Array<{ percentage: number; credits: number }>): number {
    if (grades.length === 0) return 0;
    
    const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
    if (totalCredits === 0) return 0;
    
    const weightedSum = grades.reduce((sum, grade) => {
      const gpa = this.calculateGPAPoints(grade.percentage);
      return sum + (gpa * grade.credits);
    }, 0);
    
    return weightedSum / totalCredits;
  },

  // Calculate GPA points
  calculateGPAPoints(percentage: number): number {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
  },
};

