export interface FinancialTransaction {
  id: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  reference_number?: string;
  created_by: number;
  created_at: string;
}

export interface FinancialTransactionCreate {
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  reference_number?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  location?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemCreate {
  name: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit_price?: number;
  location?: string;
  status?: string;
}

export interface InventoryItemUpdate {
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit_price?: number;
  location?: string;
  status?: string;
}

export interface InventoryLog {
  id: number;
  item_id: number;
  action: string;
  quantity: number;
  performed_by: number;
  notes?: string;
  created_at: string;
}

export interface InventoryLogCreate {
  item_id: number;
  action: string;
  quantity?: number;
  notes?: string;
}

export interface WeeklyActivityReport {
  period: string;
  new_users: number;
  new_resources: number;
  messages_sent: number;
  new_inquiries: number;
}

export interface WeeklyFinancialReport {
  period: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  income_transactions: FinancialTransaction[];
  expense_transactions: FinancialTransaction[];
}

export interface WeeklyInventoryReport {
  report_date: string;
  total_items: number;
  available_items: number;
  checked_out_items: number;
  maintenance_items: number;
  retired_items: number;
  low_stock_items: InventoryItem[];
}

export interface DashboardMetrics {
  total_transactions: number;
  total_inventory_items: number;
  unread_inquiries: number;
}

export interface AccountingDashboard {
  metrics: DashboardMetrics;
  recent_transactions: FinancialTransaction[];
  low_stock_items: InventoryItem[];
}