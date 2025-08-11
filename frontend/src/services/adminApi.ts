import api from './api';

// Admin API endpoints for full system access
export const adminApi = {
  // Users - Admin can manage all users
  getUsers: () => api.get('/api/admin/users'),
  createUser: (userData: any) => api.post('/api/admin/users', userData),
  updateUser: (id: number, userData: any) => api.put(`/api/admin/users/${id}`, userData),
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),
  
  // Clients - Admin can manage all clients
  getClients: () => api.get('/api/admin/clients'),
  createClient: (clientData: any) => api.post('/api/admin/clients', clientData),
  updateClient: (id: number, clientData: any) => api.put(`/api/admin/clients/${id}`, clientData),
  deleteClient: (id: number) => api.delete(`/api/admin/clients/${id}`),
  
  // Sessions/Meetings - Admin can manage all sessions
  getSessions: () => api.get('/api/admin/meetings'),
  createSession: (sessionData: any) => api.post('/api/admin/meetings', sessionData),
  updateSession: (id: number, sessionData: any) => api.put(`/api/admin/meetings/${id}`, sessionData),
  deleteSession: (id: number) => api.delete(`/api/admin/meetings/${id}`),
  
  // Personal Sessions - Admin can manage all personal sessions
  getPersonalSessions: () => api.get('/api/admin/personal-meetings'),
  createPersonalSession: (sessionData: any) => api.post('/api/admin/personal-meetings', sessionData),
  updatePersonalSession: (id: number, sessionData: any) => api.put(`/api/admin/personal-meetings/${id}`, sessionData),
  deletePersonalSession: (id: number) => api.delete(`/api/admin/personal-meetings/${id}`),
  
  // Expenses - Admin can manage all expenses
  getExpenses: () => api.get('/api/admin/expenses'),
  createExpense: (expenseData: any) => api.post('/api/admin/expenses', expenseData),
  updateExpense: (id: number, expenseData: any) => api.put(`/api/admin/expenses/${id}`, expenseData),
  deleteExpense: (id: number) => api.delete(`/api/admin/expenses/${id}`),
  
  // System Settings - Enum management
  getMeetingSources: () => api.get('/api/admin/meeting-sources'),
  createMeetingSource: (sourceData: any) => api.post('/api/admin/meeting-sources', sourceData),
  updateMeetingSource: (id: number, sourceData: any) => api.put(`/api/admin/meeting-sources/${id}`, sourceData),
  deleteMeetingSource: (id: number) => api.delete(`/api/admin/meeting-sources/${id}`),
  
  getExpenseCategories: () => api.get('/api/admin/expense-categories'),
  createExpenseCategory: (categoryData: any) => api.post('/api/admin/expense-categories', categoryData),
  updateExpenseCategory: (id: number, categoryData: any) => api.put(`/api/admin/expense-categories/${id}`, categoryData),
  deleteExpenseCategory: (id: number) => api.delete(`/api/admin/expense-categories/${id}`),
  
  getPaymentTypes: () => api.get('/api/admin/payment-types'),
  createPaymentType: (typeData: any) => api.post('/api/admin/payment-types', typeData),
  updatePaymentType: (id: number, typeData: any) => api.put(`/api/admin/payment-types/${id}`, typeData),
  deletePaymentType: (id: number) => api.delete(`/api/admin/payment-types/${id}`),
  
  // Dashboard stats and activity
  getDashboardStats: () => api.get('/api/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/api/admin/dashboard/recent-activity'),
};

// Type definitions for admin operations
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AdminClient {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  id: number;
  clientId: number;
  clientName: string;
  date: string;
  time: string;
  type: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPersonalSession {
  id: number;
  provider: string;
  date: string;
  time: string;
  type: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminExpense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemEnum {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalSessions: number;
  totalExpenses: number;
}

export interface RecentActivity {
  id: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  entity: string;
  entityId: number;
  timestamp: string;
  userId: number;
  userName: string;
} 