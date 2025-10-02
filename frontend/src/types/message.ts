export interface Message {
  id: number;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
  message_type: 'direct' | 'group' | 'support';
  subject?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageCreate {
  recipient_id?: number;
  group_id?: number;
  subject?: string;
  content: string;
  message_type?: 'direct' | 'group' | 'support';
}

export interface MessageGroup {
  id: number;
  name: string;
  description?: string;
  group_type: string;
  created_by: number;
  created_at: string;
}

export interface MessageGroupCreate {
  name: string;
  description?: string;
  group_type: string;
}

export interface MessageGroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: string;
  joined_at: string;
}

export interface MessageGroupMemberCreate {
  group_id: number;
  user_id: number;
  role?: string;
}