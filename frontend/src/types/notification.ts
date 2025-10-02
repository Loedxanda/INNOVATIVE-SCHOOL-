export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'attendance' | 'grade' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    student_id?: number;
    class_id?: number;
    subject_id?: number;
    grade_id?: number;
    attendance_id?: number;
    parent_id?: number;
    teacher_id?: number;
    [key: string]: any;
  };
  user?: {
    id: number;
    full_name?: string;
    email: string;
  };
}

export interface NotificationCreate {
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'attendance' | 'grade' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  scheduled_at?: string;
  metadata?: {
    student_id?: number;
    class_id?: number;
    subject_id?: number;
    grade_id?: number;
    attendance_id?: number;
    parent_id?: number;
    teacher_id?: number;
    [key: string]: any;
  };
}

export interface NotificationUpdate {
  status?: 'unread' | 'read' | 'archived';
  read_at?: string;
  archived_at?: string;
}

export interface BulkNotificationCreate {
  user_ids: number[];
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'attendance' | 'grade' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  scheduled_at?: string;
  metadata?: {
    student_id?: number;
    class_id?: number;
    subject_id?: number;
    grade_id?: number;
    attendance_id?: number;
    parent_id?: number;
    teacher_id?: number;
    [key: string]: any;
  };
}

export interface NotificationTemplate {
  id: number;
  name: string;
  title_template: string;
  message_template: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'attendance' | 'grade' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  user_id: number;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  sms_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  push_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  notification_types: {
    attendance: boolean;
    grades: boolean;
    announcements: boolean;
    reminders: boolean;
    general: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  archived_count: number;
  by_type: {
    info: number;
    success: number;
    warning: number;
    error: number;
    attendance: number;
    grade: number;
    announcement: number;
    reminder: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  by_channel: {
    email: number;
    sms: number;
    push: number;
    in_app: number;
  };
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
}

