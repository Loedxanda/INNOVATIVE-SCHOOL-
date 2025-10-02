export interface AIQuery {
  question: string;
  user_role: 'teacher' | 'student' | 'admin' | 'parent';
  subject?: string;
  grade_level?: string;
  academic_profile?: any;
  conversation_history?: Array<{ role: string; content: string }>;
  save_conversation?: boolean;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  conversation_id?: string;
}