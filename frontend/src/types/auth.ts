export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

