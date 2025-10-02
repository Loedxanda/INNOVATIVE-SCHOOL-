export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  grade_levels: string[];
  credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class_assignments?: ClassAssignment[];
}

export interface SubjectCreate {
  name: string;
  code: string;
  description?: string;
  grade_levels: string[];
  credits: number;
}

export interface SubjectUpdate {
  name?: string;
  code?: string;
  description?: string;
  grade_levels?: string[];
  credits?: number;
  is_active?: boolean;
}

export interface ClassAssignment {
  id: number;
  class_id: number;
  teacher_id: number;
  subject_id: number;
  academic_year: string;
  is_active: boolean;
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  class?: {
    id: number;
    name: string;
    grade_level: string;
  };
  teacher?: {
    id: number;
    user: {
      full_name?: string;
      email: string;
    };
  };
}

export interface SubjectSummary {
  subject: {
    id: number;
    name: string;
    code: string;
    credits: number;
    grade_levels: string[];
  };
  class_assignments: Array<{
    class_name: string;
    grade_level: string;
    teacher_name: string;
    academic_year: string;
  }>;
  student_count: number;
  average_grade: number;
  recent_grades: Array<{
    student_name: string;
    grade_value: number;
    max_grade: number;
    percentage: number;
    date_given: string;
  }>;
}

