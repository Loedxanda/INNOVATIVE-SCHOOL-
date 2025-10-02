import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export const messagingService = {
  // Send a new message
  async sendMessage(messageData: any): Promise<any> {
    const response = await api.post('/api/messages/', messageData);
    return response.data;
  },

  // Get user's messages
  async getUserMessages(params?: { skip?: number; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/api/messages/?${queryParams.toString()}`);
    return response.data;
  },

  // Get unread messages count
  async getUnreadMessagesCount(): Promise<number> {
    const response = await api.get('/api/messages/unread-count');
    return response.data.unread_count;
  },

  // Get a specific message by ID
  async getMessage(messageId: number): Promise<any> {
    const response = await api.get(`/api/messages/${messageId}`);
    return response.data;
  },

  // Mark a message as read
  async markMessageAsRead(messageId: number): Promise<void> {
    await api.post(`/api/messages/${messageId}/read`);
  },

  // Create a message group
  async createMessageGroup(groupData: any): Promise<any> {
    const response = await api.post('/api/messages/groups', groupData);
    return response.data;
  },

  // Get user's message groups
  async getUserGroups(): Promise<any> {
    const response = await api.get('/api/messages/groups');
    return response.data;
  },

  // Get a specific message group by ID
  async getMessageGroup(groupId: number): Promise<any> {
    const response = await api.get(`/api/messages/groups/${groupId}`);
    return response.data;
  },

  // Add user to a group
  async addUserToGroup(groupId: number, userId: number, role: string = 'member'): Promise<void> {
    await api.post(`/api/messages/groups/${groupId}/members`, { group_id: groupId, user_id: userId, role });
  },

  // Send a support message
  async sendSupportMessage(messageData: any): Promise<any> {
    const response = await api.post('/api/messages/support', messageData);
    return response.data;
  },
};