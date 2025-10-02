export interface Class {
  id: number;
  name: string;
  grade_level: string;
  academic_year: string;
  capacity: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher_assignments?: ClassAssignment[];
  enrollments?: Enrollment[];
}

export interface ClassCreate {
  name: string;
  grade_level: string;
  academic_year: string;
  capacity: number;
  description?: string;
}

export interface ClassUpdate {
  name?: string;
  grade_level?: string;
  academic_year?: string;
  capacity?: number;
  description?: string;
  is_active?: boolean;
}

export interface ClassAssignment {
  id: number;
  class_id: number;
  teacher_id: number;
  subject_id: number;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  teacher?: {
    id: number;
    user: {
      full_name?: string;
      email: string;
    };
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface ClassAssignmentCreate {
  class_id: number;
  teacher_id: number;
  subject_id: number;
  academic_year: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  class_id: number;
  academic_year: string;
  enrollment_date: string;
  is_active: boolean;
  student?: {
    id: number;
    student_id: string;
    user: {
      full_name?: string;
      email: string;
    };
  };
}

export interface EnrollmentCreate {
  student_id: number;
  class_id: number;
  academic_year: string;
}

export interface ClassSummary {
  class: {
    id: number;
    name: string;
    grade_level: string;
    academic_year: string;
    capacity: number;
    current_enrollment: number;
  };
  teacher_assignments: Array<{
    teacher_name: string;
    subject_name: string;
    subject_code: string;
  }>;
  recent_enrollments: Array<{
    student_name: string;
    enrollment_date: string;
  }>;
  attendance_summary: {
    total_days: number;
    average_attendance: number;
    present_count: number;
    absent_count: number;
  };
}

