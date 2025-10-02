export interface Inquiry {
  id: number;
  ticket_number: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  department: 'admissions' | 'finance' | 'it' | 'general' | 'academic';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface InquiryCreate {
  name: string;
  email: string;
  subject: string;
  message: string;
  department: 'admissions' | 'finance' | 'it' | 'general' | 'academic';
  priority?: string;
}

export interface InquiryUpdate {
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: number;
  priority?: string;
}

export interface InquiryComment {
  id: number;
  inquiry_id: number;
  user_id: number;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface InquiryCommentCreate {
  inquiry_id: number;
  comment: string;
  is_internal?: boolean;
}