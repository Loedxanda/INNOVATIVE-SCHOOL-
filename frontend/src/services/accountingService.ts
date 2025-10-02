import axios from 'axios';
import { 
  FinancialTransaction, FinancialTransactionCreate,
  InventoryItem, InventoryItemCreate, InventoryItemUpdate,
  InventoryLog, InventoryLogCreate,
  WeeklyActivityReport, WeeklyFinancialReport, WeeklyInventoryReport,
  AccountingDashboard
} from '../types/accounting';

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

export const accountingService = {
  // Create a new financial transaction
  async createTransaction(transactionData: FinancialTransactionCreate): Promise<FinancialTransaction> {
    const response = await api.post('/api/accounting/transactions', transactionData);
    return response.data;
  },

  // Get financial transactions
  async getTransactions(params?: {
    skip?: number;
    limit?: number;
    transactionType?: string;
  }): Promise<FinancialTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.transactionType !== undefined) queryParams.append('transaction_type', params.transactionType);

    const response = await api.get(`/api/accounting/transactions?${queryParams.toString()}`);
    return response.data;
  },

  // Create a new inventory item
  async createInventoryItem(itemData: InventoryItemCreate): Promise<InventoryItem> {
    const response = await api.post('/api/accounting/inventory', itemData);
    return response.data;
  },

  // Get inventory items
  async getInventoryItems(params?: {
    skip?: number;
    limit?: number;
    category?: string;
    status?: string;
  }): Promise<InventoryItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.category !== undefined) queryParams.append('category', params.category);
    if (params?.status !== undefined) queryParams.append('status', params.status);

    const response = await api.get(`/api/accounting/inventory?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific inventory item
  async getInventoryItem(itemId: number): Promise<InventoryItem> {
    const response = await api.get(`/api/accounting/inventory/${itemId}`);
    return response.data;
  },

  // Update an inventory item
  async updateInventoryItem(itemId: number, itemData: InventoryItemUpdate): Promise<InventoryItem> {
    const response = await api.put(`/api/accounting/inventory/${itemId}`, itemData);
    return response.data;
  },

  // Delete an inventory item
  async deleteInventoryItem(itemId: number): Promise<void> {
    await api.delete(`/api/accounting/inventory/${itemId}`);
  },

  // Create an inventory log entry
  async createInventoryLog(itemId: number, logData: InventoryLogCreate): Promise<InventoryLog> {
    const response = await api.post(`/api/accounting/inventory/${itemId}/log`, logData);
    return response.data;
  },

  // Get inventory logs
  async getInventoryLogs(itemId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<InventoryLog[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/api/accounting/inventory/${itemId}/logs?${queryParams.toString()}`);
    return response.data;
  },

  // Get weekly activity report
  async getWeeklyActivityReport(): Promise<WeeklyActivityReport> {
    const response = await api.get('/api/accounting/reports/weekly-activity');
    return response.data;
  },

  // Get weekly financial report
  async getWeeklyFinancialReport(): Promise<WeeklyFinancialReport> {
    const response = await api.get('/api/accounting/reports/weekly-financial');
    return response.data;
  },

  // Get weekly inventory report
  async getWeeklyInventoryReport(): Promise<WeeklyInventoryReport> {
    const response = await api.get('/api/accounting/reports/weekly-inventory');
    return response.data;
  },

  // Get accounting dashboard
  async getAccountingDashboard(): Promise<AccountingDashboard> {
    const response = await api.get('/api/accounting/reports/dashboard');
    return response.data;
  },
};