export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  grade_value: number;
  max_grade: number;
  percentage: number;
  grade_type?: string;
  description?: string;
  date_given: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    student_id: string;
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

export interface GradeBase {
  grade_value: number;
  max_grade: number;
  grade_type?: string;
  description?: string;
  date_given?: string;
  student_id: number | string;
  subject_id: number | string;
  class_id: number | string;
}

export interface GradeCreate extends GradeBase {
  student_id: number | string;
  subject_id: number | string;
  class_id: number | string;
  grade_value: number;
  max_grade: number;
  date_given: string;
}

export interface GradeUpdate extends Partial<GradeBase> {
  id: number;
}

export interface GradeSummary {
  student_id: number;
  student_name: string;
  student_id_number: string;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  total_grades: number;
  average_grade: number;
  average_percentage: number;
  highest_grade: number;
  lowest_grade: number;
  recent_grades: Array<{
    grade_value: number;
    max_grade: number;
    percentage: number;
    grade_type?: string;
    date_given: string;
  }>;
}

export interface ClassGradeSummary {
  class_id: number;
  class_name: string;
  grade_level: string;
  subject_id: number;
  subject_name: string;
  total_students: number;
  average_grade: number;
  average_percentage: number;
  grade_distribution: {
    A: number; // 90-100%
    B: number; // 80-89%
    C: number; // 70-79%
    D: number; // 60-69%
    F: number; // 0-59%
  };
  student_grades: Array<{
    student_id: number;
    student_name: string;
    student_id_number: string;
    average_grade: number;
    average_percentage: number;
    total_grades: number;
  }>;
}

export interface ReportCard {
  student_id: number;
  student_name: string;
  student_id_number: string;
  class_id: number;
  class_name: string;
  grade_level: string;
  academic_year: string;
  term: string;
  generated_date: string;
  subjects: Array<{
    subject_id: number;
    subject_name: string;
    subject_code: string;
    credits: number;
    average_grade: number;
    average_percentage: number;
    letter_grade: string;
    total_grades: number;
    grades: Array<{
      grade_value: number;
      max_grade: number;
      percentage: number;
      grade_type?: string;
      date_given: string;
    }>;
  }>;
  overall_average: number;
  overall_percentage: number;
  overall_letter_grade: string;
  total_credits: number;
  attendance_summary: {
    total_days: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendance_percentage: number;
  };
  comments: string;
  teacher_comments: Array<{
    subject_name: string;
    teacher_name: string;
    comment: string;
  }>;
}

export interface GradeStatistics {
  period: string;
  start_date: string;
  end_date: string;
  total_grades: number;
  class_summaries: Array<{
    class_id: number;
    class_name: string;
    grade_level: string;
    subject_name: string;
    average_grade: number;
    average_percentage: number;
    total_students: number;
    grade_distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  }>;
  student_rankings: Array<{
    student_id: number;
    student_name: string;
    student_id_number: string;
    class_name: string;
    overall_average: number;
    overall_percentage: number;
    rank: number;
  }>;
}

