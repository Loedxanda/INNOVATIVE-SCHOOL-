import axios from 'axios';
import { 
  Notification, 
  NotificationCreate, 
  NotificationUpdate, 
  BulkNotificationCreate, 
  NotificationTemplate, 
  NotificationSettings, 
  NotificationStats 
} from '../types/notification';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const notificationService = {
  // Get notifications with pagination and filters
  async getNotifications(
    skip: number = 0, 
    limit: number = 100,
    filters?: {
      user_id?: number;
      type?: string;
      priority?: string;
      status?: string;
      channel?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<Notification[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const response = await api.get(`/notifications/?${params.toString()}`);
    return response.data;
  },

  // Get notification by ID
  async getNotification(notificationId: number): Promise<Notification> {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Create notification
  async createNotification(notificationData: NotificationCreate): Promise<Notification> {
    const response = await api.post('/notifications/', notificationData);
    return response.data;
  },

  // Create bulk notifications
  async createBulkNotifications(bulkData: BulkNotificationCreate): Promise<Notification[]> {
    const response = await api.post('/notifications/bulk', bulkData);
    return response.data;
  },

  // Update notification
  async updateNotification(notificationId: number, notificationData: NotificationUpdate): Promise<Notification> {
    const response = await api.patch(`/notifications/${notificationId}`, notificationData);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark notification as unread
  async markAsUnread(notificationId: number): Promise<Notification> {
    const response = await api.patch(`/notifications/${notificationId}/unread`);
    return response.data;
  },

  // Archive notification
  async archiveNotification(notificationId: number): Promise<Notification> {
    const response = await api.patch(`/notifications/${notificationId}/archive`);
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId: number): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Mark all notifications as read
  async markAllAsRead(userId: number): Promise<void> {
    await api.patch(`/notifications/mark-all-read/${userId}`);
  },

  // Get notification statistics
  async getNotificationStats(userId?: number): Promise<NotificationStats> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    
    const response = await api.get(`/notifications/stats?${params.toString()}`);
    return response.data;
  },

  // Get notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get('/notifications/templates');
    return response.data;
  },

  // Create notification template
  async createNotificationTemplate(templateData: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    const response = await api.post('/notifications/templates', templateData);
    return response.data;
  },

  // Update notification template
  async updateNotificationTemplate(templateId: number, templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.patch(`/notifications/templates/${templateId}`, templateData);
    return response.data;
  },

  // Delete notification template
  async deleteNotificationTemplate(templateId: number): Promise<void> {
    await api.delete(`/notifications/templates/${templateId}`);
  },

  // Get user notification settings
  async getNotificationSettings(userId: number): Promise<NotificationSettings> {
    const response = await api.get(`/notifications/settings/${userId}`);
    return response.data;
  },

  // Update user notification settings
  async updateNotificationSettings(userId: number, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await api.patch(`/notifications/settings/${userId}`, settings);
    return response.data;
  },

  // Send test notification
  async sendTestNotification(userId: number, channel: 'email' | 'sms' | 'push' | 'in_app'): Promise<void> {
    await api.post(`/notifications/test/${userId}`, { channel });
  },

  // Get notification preferences
  async getNotificationPreferences(userId: number): Promise<any> {
    const response = await api.get(`/notifications/preferences/${userId}`);
    return response.data;
  },

  // Update notification preferences
  async updateNotificationPreferences(userId: number, preferences: any): Promise<any> {
    const response = await api.patch(`/notifications/preferences/${userId}`, preferences);
    return response.data;
  },

  // Schedule notification
  async scheduleNotification(notificationData: NotificationCreate & { scheduled_at: string }): Promise<Notification> {
    const response = await api.post('/notifications/schedule', notificationData);
    return response.data;
  },

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/cancel`);
  },

  // Get notification history
  async getNotificationHistory(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<Notification[]> {
    const params = new URLSearchParams();
    params.append('user_id', userId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/notifications/history?${params.toString()}`);
    return response.data;
  },
};

