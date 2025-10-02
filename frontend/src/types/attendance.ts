export interface Attendance {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  marked_by: number;
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
  class?: {
    id: number;
    name: string;
    grade_level: string;
  };
  marked_by_user?: {
    id: number;
    full_name?: string;
    email: string;
  };
}

export interface AttendanceCreate {
  student_id: number;
  class_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceUpdate {
  status?: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface BulkAttendanceCreate {
  class_id: number;
  date: string;
  attendance_data: Array<{
    student_id: number;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

export interface AttendanceSummary {
  student_id: number;
  student_name: string;
  student_id_number: string;
  class_id: number;
  class_name: string;
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
  recent_attendance: Array<{
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

export interface ClassAttendanceSummary {
  class_id: number;
  class_name: string;
  grade_level: string;
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
  students: Array<{
    student_id: number;
    student_name: string;
    student_id_number: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

export interface AttendanceReport {
  period: string;
  start_date: string;
  end_date: string;
  total_days: number;
  class_summaries: Array<{
    class_id: number;
    class_name: string;
    grade_level: string;
    total_students: number;
    average_attendance: number;
    attendance_breakdown: {
      present: number;
      absent: number;
      late: number;
      excused: number;
    };
  }>;
  student_summaries: Array<{
    student_id: number;
    student_name: string;
    student_id_number: string;
    class_name: string;
    attendance_percentage: number;
    total_days: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }>;
}

