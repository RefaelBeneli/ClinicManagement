import api from './api';

// Admin API endpoints for full system access
export const adminApi = {
  // Users - Admin can manage all users
  getUsers: (page: number = 0, size: number = 100) => api.get(`/admin/users?page=${page}&size=${size}`),
  createUser: (userData: any) => api.post('/admin/users', userData),
  updateUser: (id: number, userData: any) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  validateUserName: (name: string) => api.get(`/admin/users/validate-name?name=${encodeURIComponent(name)}`),
  
  // Clients - Admin can manage all clients
  getClients: (page: number = 0, size: number = 100) => api.get(`/admin/clients?page=${page}&size=${size}`),
  createClient: (clientData: any) => api.post('/admin/clients', clientData),
  updateClient: (id: number, clientData: any) => api.put(`/admin/clients/${id}`, clientData),
  deleteClient: (id: number) => api.delete(`/admin/clients/${id}`),
  
  // Sessions/Meetings - Admin can manage all sessions
  getSessions: (page: number = 0, size: number = 100) => api.get(`/admin/meetings?page=${page}&size=${size}`),
  createSession: (sessionData: any) => api.post('/admin/meetings', sessionData),
  updateSession: (id: number, sessionData: any) => api.put(`/admin/meetings/${id}`, sessionData),
  updateSessionStatus: (id: number, status: string) => {
    console.log('🔍 adminApi.updateSessionStatus called with:', { id, status });
    return api.patch(`/admin/meetings/${id}/status`, { status });
  },
  activateSession: (id: number) => api.post(`/admin/meetings/${id}/activate`),
  deactivateSession: (id: number) => api.post(`/admin/meetings/${id}/deactivate`),
  deleteSession: (id: number) => api.delete(`/admin/meetings/${id}`),
  
  // Personal Sessions - Admin can manage all personal sessions
  getPersonalSessions: (page: number = 0, size: number = 100) => api.get(`/admin/personal-meetings?page=${page}&size=${size}`),
  createPersonalSession: (sessionData: any) => api.post('/admin/personal-meetings', sessionData),
  updatePersonalSession: (id: number, sessionData: any) => api.put(`/admin/personal-meetings/${id}`, sessionData),
  deletePersonalSession: (id: number) => api.delete(`/admin/personal-meetings/${id}`),
  
  // Expenses - Admin can manage all expenses
  getExpenses: (page: number = 0, size: number = 100) => api.get(`/admin/expenses?page=${page}&size=${size}`),
  createExpense: (expenseData: any) => api.post('/admin/expenses', expenseData),
  updateExpense: (id: number, expenseData: any) => api.put(`/admin/expenses/${id}`, expenseData),
  deleteExpense: (id: number) => api.delete(`/admin/expenses/${id}`),
  
  // System Settings - Enum management
  getMeetingSources: () => api.get('/admin/meeting-sources'),
  createMeetingSource: (sourceData: any) => api.post('/admin/meeting-sources', sourceData),
  updateMeetingSource: (id: number, sourceData: any) => api.put(`/admin/meeting-sources/${id}`, sourceData),
  deleteMeetingSource: (id: number) => api.delete(`/admin/meeting-sources/${id}`),
  
  getExpenseCategories: () => api.get('/admin/expense-categories'),
  createExpenseCategory: (categoryData: any) => api.post('/admin/expense-categories', categoryData),
  updateExpenseCategory: (id: number, categoryData: any) => api.put(`/admin/expense-categories/${id}`, categoryData),
  deleteExpenseCategory: (id: number) => api.delete(`/admin/expense-categories/${id}`),
  
  getPaymentTypes: () => api.get('/admin/payment-types'),
  createPaymentType: (typeData: any) => api.post('/admin/payment-types', typeData),
  updatePaymentType: (id: number, typeData: any) => api.put(`/admin/payment-types/${id}`, typeData),
  deletePaymentType: (id: number) => api.delete(`/admin/payment-types/${id}`),
  
  // Dashboard stats and activity
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/admin/dashboard/recent-activity'),
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