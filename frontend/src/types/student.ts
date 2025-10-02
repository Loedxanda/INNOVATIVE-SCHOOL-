export interface Student {
  id: number;
  user_id: number;
  student_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  enrollment_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    full_name?: string;
    role: string;
  };
}

export interface StudentCreate {
  user_id: number;
  student_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface StudentUpdate {
  student_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface StudentEnrollment {
  id: number;
  student_id: number;
  class_id: number;
  class_name: string;
  grade_level: string;
  academic_year: string;
  enrollment_date: string;
  is_active: boolean;
}

export interface StudentAttendance {
  id: number;
  class_id: number;
  class_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  marked_by: number;
  marked_by_name?: string;
}

export interface StudentGrade {
  id: number;
  subject_id: number;
  subject_name: string;
  class_id: number;
  class_name: string;
  grade_value: number;
  max_grade: number;
  percentage: number;
  grade_type?: string;
  description?: string;
  date_given: string;
  teacher_name?: string;
}

export interface StudentSummary {
  student: {
    id: number;
    name: string;
    student_id: string;
    current_class: string;
    grade_level?: string;
  };
  attendance_summary: {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  grade_summary: {
    total_grades: number;
    average_percentage: number;
    recent_grades: Array<{
      subject: string;
      grade: number;
      max_grade: number;
      percentage: number;
      date: string;
    }>;
  };
}

