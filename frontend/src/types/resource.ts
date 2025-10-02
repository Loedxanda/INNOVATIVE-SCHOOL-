export interface Resource {
  id: number;
  title: string;
  description?: string;
  file_url?: string;
  video_url?: string;
  subject_id?: number;
  grade_level?: string;
  category?: 'lesson_plan' | 'worksheet' | 'presentation' | 'video' | 'assessment' | 'other';
  tags?: string;
  uploaded_by: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResourceCreate {
  title: string;
  description?: string;
  file_url?: string;
  video_url?: string;
  subject_id?: number;
  grade_level?: string;
  category?: 'lesson_plan' | 'worksheet' | 'presentation' | 'video' | 'assessment' | 'other';
  tags?: string;
}

export interface ResourceUpdate {
  title?: string;
  description?: string;
  file_url?: string;
  video_url?: string;
  subject_id?: number;
  grade_level?: string;
  category?: 'lesson_plan' | 'worksheet' | 'presentation' | 'video' | 'assessment' | 'other';
  tags?: string;
  is_public?: boolean;
}

export interface ResourceRating {
  id: number;
  resource_id: number;
  user_id: number;
  rating: number;
  created_at: string;
}

export interface ResourceRatingCreate {
  resource_id: number;
  rating: number;
}

export interface ResourceComment {
  id: number;
  resource_id: number;
  user_id: number;
  comment: string;
  parent_comment_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceCommentCreate {
  resource_id: number;
  comment: string;
  parent_comment_id?: number;
}