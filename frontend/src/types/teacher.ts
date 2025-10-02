export interface Teacher {
  id: number;
  user_id: number;
  teacher_id: string;
  employee_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  qualification?: string;
  specialization?: string;
  hire_date: string;
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

export interface TeacherCreate {
  user_id: number;
  teacher_id: string;
  employee_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  qualification?: string;
  specialization?: string;
}

export interface TeacherUpdate {
  teacher_id?: string;
  employee_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone_number?: string;
  qualification?: string;
  specialization?: string;
}

export interface TeacherClass {
  assignment_id: number;
  class_id: number;
  class_name: string;
  grade_level: string;
  subject_id: number;
  subject_name: string;
  academic_year: string;
  is_active: boolean;
}

export interface TeacherStudent {
  student_id: number;
  student_name: string;
  student_id_number: string;
  class_id: number;
  class_name: string;
  enrollment_date: string;
}

export interface TeacherAttendance {
  attendance_id: number;
  student_id: number;
  student_name: string;
  student_id_number: string;
  class_id: number;
  class_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  marked_by: number;
  marked_by_name?: string;
}

export interface TeacherGrade {
  grade_id: number;
  student_id: number;
  student_name: string;
  student_id_number: string;
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

