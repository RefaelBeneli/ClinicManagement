import axios from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Client,
  ClientRequest,
  Meeting,
  MeetingRequest,
  UpdateMeetingRequest,
  PersonalMeeting,
  PersonalMeetingRequest,
  UpdatePersonalMeetingRequest,
  MessageResponse,
  RevenueResponse,
  DashboardStats,
  PendingUser,
  UserApprovalRequest,
  UserRejectionRequest,
  UserApprovalResponse,
  ApprovalHistoryResponse,
  PersonalMeetingTypeEntity,
  PaymentType,
  ClientSourceResponse,
  ClientSourceRequest,
  UpdateClientSourceRequest,
  ExpenseCategoryResponse,
  ExpenseCategoryRequest,
  UpdateExpenseCategoryRequest
} from '../types';

// Data transformation functions to handle backend/frontend property name mismatches
const transformClientResponse = (data: any): any => {
  if (data && typeof data === 'object') {
    // Handle single client object
    if (data.id && data.fullName) {
      const transformed = {
        ...data,
        active: data.isActive !== undefined ? data.isActive : data.active,
        // Remove the "isActive" property to avoid confusion
        isActive: undefined
      };
      return transformed;
    }
    // Handle array of clients
    if (Array.isArray(data)) {
      const transformed = data.map(transformClientResponse);
      return transformed;
    }
  }
  return data;
};

const transformMeetingResponse = (data: any): any => {
  if (data && typeof data === 'object') {
    // Handle single meeting object
    if (data.id && data.client) {
      const transformed = {
        ...data,
        isPaid: data.paid !== undefined ? data.paid : data.isPaid,
        active: data.isActive !== undefined ? data.isActive : data.active,
        // Remove the "paid" and "isActive" properties to avoid confusion
        paid: undefined,
        isActive: undefined
      };
      return transformed;
    }
    // Handle array of meetings
    if (Array.isArray(data)) {
      const transformed = data.map(transformMeetingResponse);
      return transformed;
    }
  }
  return data;
};

const transformPersonalMeetingResponse = (data: any): any => {
  if (data && typeof data === 'object') {
    // Handle single personal meeting object
    if (data.id && data.therapistName) {
      const transformed = {
        ...data,
        isPaid: data.paid !== undefined ? data.paid : data.isPaid,
        active: data.isActive !== undefined ? data.isActive : data.active,
        // Remove the "paid" and "isActive" properties to avoid confusion
        paid: undefined,
        isActive: undefined
      };
      return transformed;
    }
    // Handle array of personal meetings
    if (Array.isArray(data)) {
      const transformed = data.map(transformPersonalMeetingResponse);
      return transformed;
    }
  }
  return data;
};

const transformExpenseResponse = (data: any): any => {
  if (data && typeof data === 'object') {
    // Handle single expense object
    if (data.id && data.name) {
      const transformed = {
        ...data,
        paid: data.isPaid !== undefined ? data.isPaid : data.paid,
        active: data.isActive !== undefined ? data.isActive : data.active,
        // Remove the "isPaid" and "isActive" properties to avoid confusion
        isPaid: undefined,
        isActive: undefined
      };
      console.log('🔄 Transformed expense:', { 
        original: { isPaid: data.isPaid, paid: data.paid, isActive: data.isActive, active: data.active },
        transformed: { paid: transformed.paid, active: transformed.active }
      });
      return transformed;
    }
    // Handle array of expenses
    if (Array.isArray(data)) {
      const transformed = data.map(transformExpenseResponse);
      return transformed;
    }
  }
  return data;
};

// Automatically detect production environment and use Railway backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
    ? 'https://web-production-9aa8.up.railway.app/api'
    : 'http://localhost:8085/api');

const ROOT_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;



// Create axios instance with enhanced CORS support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 30000, // 30 second timeout
});

// Enhanced request interceptor with debugging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with CORS error detection
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('📥 API Error:', error.config?.method?.toUpperCase(), error.config?.url);
    
    // Detect CORS errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('🚫 POSSIBLE CORS ERROR:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response
      });
      alert('🚫 CORS/Network Error detected! Please:\n1. Hard refresh (Ctrl+Shift+R)\n2. Clear cache\n3. Try incognito mode');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// CORS Test Function
export const testCORS = async () => {
  try {
    console.log('🧪 Testing CORS connection...');
    const response = await apiClient.get('/auth/cors-test');
    console.log('✅ CORS Test Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CORS Test Failed:', error);
    throw error;
  }
};

// Auth API
export const auth = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signin', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<MessageResponse> => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Client API
export const clients = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get('/clients');
    return transformClientResponse(response.data);
  },

  getById: async (id: number): Promise<Client> => {
    const response = await apiClient.get(`/clients/${id}`);
    return transformClientResponse(response.data);
  },

  create: async (clientData: ClientRequest): Promise<Client> => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  },

  update: async (id: number, clientData: Partial<ClientRequest>): Promise<Client> => {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },

  disable: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.patch(`/clients/${id}/disable`);
    return response.data;
  },

  activate: async (id: number): Promise<Client> => {
    const response = await apiClient.post(`/clients/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: number): Promise<Client> => {
    const response = await apiClient.post(`/clients/${id}/deactivate`);
    return response.data;
  },

  search: async (name: string): Promise<Client[]> => {
    const response = await apiClient.get(`/clients/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },
};

// Meeting API
export const meetings = {
  getAll: async (): Promise<Meeting[]> => {
    const response = await apiClient.get('/meetings');
    return transformMeetingResponse(response.data);
  },

  getById: async (id: number): Promise<Meeting> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return transformMeetingResponse(response.data);
  },

  create: async (meetingData: MeetingRequest): Promise<Meeting> => {
    const response = await apiClient.post('/meetings', meetingData);
    return transformMeetingResponse(response.data);
  },

  update: async (id: number, meetingData: UpdateMeetingRequest): Promise<Meeting> => {
    console.log('🔧 meetings.update called with:', { id, meetingData });
    console.log('🔧 Making PUT request to:', `/meetings/${id}`);
    
    const response = await apiClient.put(`/meetings/${id}`, meetingData);
    console.log('🔧 API response received:', response);
    
    return transformMeetingResponse(response.data);
  },

  updatePayment: async (id: number, isPaid: boolean, paymentTypeId?: number, amount?: number, referenceNumber?: string, notes?: string): Promise<Meeting> => {
    console.log('🔧 updatePayment called with:', { id, isPaid, paymentTypeId, amount, referenceNumber, notes });
    console.log('🔧 Making PUT request to:', `/meetings/${id}/payment`);
    
    const payload: any = { isPaid };
    
    // Only include paymentTypeId when marking as paid (required by backend)
    if (isPaid && paymentTypeId) {
      payload.paymentTypeId = paymentTypeId;
    }
    
    // Include optional fields if provided
    if (amount !== undefined) payload.amount = amount;
    if (referenceNumber) payload.referenceNumber = referenceNumber;
    if (notes) payload.notes = notes;
    
    console.log('🔧 Request payload:', payload);
    
    const response = await apiClient.put(`/meetings/${id}/payment`, payload);
    
    console.log('🔧 Response received:', response);
    return transformMeetingResponse(response.data);
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/meetings/${id}`);
    return response.data;
  },

  disable: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.patch(`/meetings/${id}/disable`);
    return response.data;
  },

  activate: async (id: number): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/activate`);
    return transformMeetingResponse(response.data);
  },

  deactivate: async (id: number): Promise<Meeting> => {
    const response = await apiClient.post(`/meetings/${id}/deactivate`);
    return transformMeetingResponse(response.data);
  },

  getByMonth: async (year: number, month: number): Promise<Meeting[]> => {
    const response = await apiClient.get(`/meetings/month?year=${year}&month=${month}`);
    return transformMeetingResponse(response.data);
  },

  // Revenue tracking methods
  getRevenueStats: async (period: string, startDate?: string, endDate?: string): Promise<RevenueResponse> => {
    let url = `/meetings/revenue?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/meetings/user-dashboard-stats');
    return response.data;
  },

  getActiveSources: async (): Promise<ClientSourceResponse[]> => {
    const response = await apiClient.get('/client-sources/active');
    return response.data;
  },
};

// Personal Meeting API
export const personalMeetings = {
  getAll: async (): Promise<PersonalMeeting[]> => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Try to get current user to check role
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          // Use admin endpoint for admin users
          const response = await adminClient.get('/api/admin/personal-meetings?size=1000');
          return transformPersonalMeetingResponse(response.data.content || response.data);
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    // Fallback to regular endpoint
    const response = await apiClient.get('/personal-meetings');
    return transformPersonalMeetingResponse(response.data);
  },

  getById: async (id: number): Promise<PersonalMeeting> => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          const response = await adminClient.get(`/api/admin/personal-meetings/${id}`);
          return transformPersonalMeetingResponse(response.data);
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    const response = await apiClient.get(`/personal-meetings/${id}`);
    return transformPersonalMeetingResponse(response.data);
  },

  create: async (meetingData: PersonalMeetingRequest): Promise<PersonalMeeting> => {
    const response = await apiClient.post('/personal-meetings', meetingData);
    return transformPersonalMeetingResponse(response.data);
  },

  update: async (id: number, meetingData: UpdatePersonalMeetingRequest): Promise<PersonalMeeting> => {
    const response = await apiClient.put(`/personal-meetings/${id}`, meetingData);
    return transformPersonalMeetingResponse(response.data);
  },

  updatePayment: async (id: number, isPaid: boolean, paymentTypeId?: number, amount?: number, referenceNumber?: string, notes?: string): Promise<PersonalMeeting> => {
    console.log('🔧 personalMeetings.updatePayment called with:', { id, isPaid, paymentTypeId, amount, referenceNumber, notes });
    console.log('🔧 Making PUT request to:', `/personal-meetings/${id}/payment`);
    
    const payload: any = { isPaid };
    
    // Only include paymentTypeId when marking as paid (required by backend)
    if (isPaid && paymentTypeId) {
      payload.paymentTypeId = paymentTypeId;
    }
    
    // Include optional fields if provided
    if (amount !== undefined) payload.amount = amount;
    if (referenceNumber) payload.referenceNumber = referenceNumber;
    if (notes) payload.notes = notes;
    
    console.log('🔧 Request payload:', payload);
    
    const response = await apiClient.put(`/personal-meetings/${id}/payment`, payload);
    
    console.log('🔧 Response received:', response);
    return transformPersonalMeetingResponse(response.data);
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/personal-meetings/${id}`);
    return response.data;
  },

  disable: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.patch(`/personal-meetings/${id}/disable`);
    return response.data;
  },

  activate: async (id: number): Promise<PersonalMeeting> => {
    const response = await apiClient.post(`/personal-meetings/${id}/activate`);
    return transformPersonalMeetingResponse(response.data);
  },

  deactivate: async (id: number): Promise<PersonalMeeting> => {
    const response = await apiClient.post(`/personal-meetings/${id}/deactivate`);
    return transformPersonalMeetingResponse(response.data);
  },

  getByMonth: async (year: number, month: number): Promise<PersonalMeeting[]> => {
    const response = await apiClient.get(`/personal-meetings/month?year=${year}&month=${month}`);
    return transformPersonalMeetingResponse(response.data);
  },

  getStats: async (): Promise<any> => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          // For admin, get stats from dashboard endpoint
          const response = await adminClient.get('/api/admin/dashboard/stats');
          return response.data;
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    const response = await apiClient.get('/personal-meetings/stats');
    return response.data;
  },

  getTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/personal-meetings/types');
    return response.data;
  },

  getActiveMeetingTypes: async (): Promise<PersonalMeetingTypeEntity[]> => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          const response = await adminClient.get('/api/admin/personal-meeting-types/active');
          return response.data;
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    // For regular users, try to get meeting types from public endpoint
    try {
      const response = await apiClient.get('/personal-meeting-types/active');
      return response.data;
    } catch (error) {
      console.warn('No public endpoint for meeting types, returning empty array');
      return [];
    }
  },

  getProviderTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/personal-meetings/provider-types');
    return response.data;
  },
};

// Calendar Integration API
export const calendarIntegration = {
  // Get current user's integration settings
  getIntegration: async () => {
    const response = await apiClient.get('/calendar/integration');
    return response.data;
  },

  // Create a new integration (after OAuth callback)
  createIntegration: async (request: any) => {
    const response = await apiClient.post('/calendar/integration', request);
    return response.data;
  },

  // Update existing integration settings (calendars, flags, etc.)
  updateIntegration: async (request: any) => {
    const response = await apiClient.patch('/calendar/integration', request);
    return response.data;
  },

  // Disconnect integration completely
  disconnectIntegration: async () => {
    const response = await apiClient.delete('/calendar/integration');
    return response.data;
  },

  // Generate Google OAuth authorization URL
  getAuthUrl: async () => {
    const response = await apiClient.get('/calendar/auth-url');
    return response.data;
  },

  // Handle OAuth callback (front-end exchanges code for tokens via backend)
  handleOAuthCallback: async (request: any) => {
    const response = await apiClient.post('/calendar/oauth/callback', request);
    return response.data;
  },

  // Sync status
  getSyncStatus: async () => {
    const response = await apiClient.get('/calendar/status');
    return response.data;
  },

  // List user's Google calendars
  getCalendars: async () => {
    const response = await apiClient.get('/calendar/calendars');
    return response.data;
  },

  // Enable sync
  enableSync: async () => {
    const response = await apiClient.post('/calendar/sync/enable');
    return response.data;
  },

  // Disable sync
  disableSync: async () => {
    const response = await apiClient.post('/calendar/sync/disable');
    return response.data;
  },

  // Get Google Calendar events for a date range
  getEvents: async (startDate: string, endDate: string) => {
    const response = await apiClient.get(`/calendar/events?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Check for conflicts when scheduling a meeting
  checkConflicts: async (startDate: string, endDate: string) => {
    const response = await apiClient.get(`/calendar/conflicts?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};

// Admin – User management (CRUD)
export const adminUsers = {
  getAll: async (page = 0, size = 20) => {
    const response = await adminClient.get(`/api/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await adminClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  update: async (id: number, request: any) => {
    const response = await adminClient.put(`/api/admin/users/${id}`, request);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },
};

// User Approval API (Admin only)
export const userApproval = {
  getPendingUsers: async (): Promise<PendingUser[]> => {
    const response = await adminClient.get('/api/admin/users/pending');
    return response.data;
  },

  getPendingCount: async (): Promise<{ count: number }> => {
    const response = await adminClient.get('/api/admin/users/pending/count');
    return response.data;
  },

  approveUser: async (userId: number, request: UserApprovalRequest): Promise<UserApprovalResponse> => {
    const response = await adminClient.post(`/api/admin/users/${userId}/approve`, request);
    return response.data;
  },

  rejectUser: async (userId: number, request: UserRejectionRequest): Promise<UserApprovalResponse> => {
    const response = await adminClient.post(`/api/admin/users/${userId}/reject`, request);
    return response.data;
  },

  getApprovalHistory: async (): Promise<ApprovalHistoryResponse[]> => {
    const response = await adminClient.get('/api/admin/users/approval-history');
    return response.data;
  },

  getUserStatus: async (userId: number): Promise<UserApprovalResponse> => {
    const response = await adminClient.get(`/api/admin/users/${userId}/status`);
    return response.data;
  },
};

// Expenses API
export const expenses = {
  getAll: async () => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Try to get current user to check role
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          // Use admin endpoint for admin users
          const response = await adminClient.get('/api/admin/expenses?size=1000');
          return transformExpenseResponse(response.data.content || response.data);
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    const response = await apiClient.get('/expenses');
    return transformExpenseResponse(response.data);
  },

  getById: async (id: number) => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          const response = await adminClient.get(`/api/admin/expenses/${id}`);
          return transformExpenseResponse(response.data);
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    const response = await apiClient.get(`/expenses/${id}`);
    return transformExpenseResponse(response.data);
  },

  create: async (expenseData: any) => {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  },

  update: async (id: number, expenseData: any) => {
    const response = await apiClient.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },

  disable: async (id: number) => {
    const response = await apiClient.patch(`/expenses/${id}/disable`);
    return response.data;
  },

  activate: async (id: number) => {
    const response = await apiClient.post(`/expenses/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: number) => {
    const response = await apiClient.post(`/expenses/${id}/deactivate`);
    return response.data;
  },

  getByCategory: async (category: string) => {
    const response = await apiClient.get(`/expenses/category/${category}`);
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await apiClient.get(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getRecurring: async () => {
    const response = await apiClient.get('/expenses/recurring');
    return response.data;
  },

  getUpcoming: async () => {
    const response = await apiClient.get('/expenses/upcoming');
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get('/expenses/summary');
    return response.data;
  },

  markAsPaid: async (expenseId: number, paymentTypeId: number, referenceNumber?: string, notes?: string, transactionId?: string) => {
    const payload: any = { paymentTypeId };
    if (referenceNumber) payload.referenceNumber = referenceNumber;
    if (notes) payload.notes = notes;
    if (transactionId) payload.transactionId = transactionId;
    
    const response = await apiClient.put(`/expenses/${expenseId}/payment`, payload);
    return response.data;
  },

  markAsUnpaid: async (expenseId: number) => {
    const response = await apiClient.put(`/expenses/${expenseId}/unpaid`);
    return response.data;
  },
};

// Create a separate axios instance for admin endpoints (without /api)
const adminClient = axios.create({
  baseURL: ROOT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Add interceptors to admin client
adminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Payment Types API
export const paymentTypes = {
  getAll: async (): Promise<PaymentType[]> => {
    const response = await adminClient.get('/api/admin/payment-types');
    return response.data;
  },

  getActive: async (): Promise<PaymentType[]> => {
    // Check if user is admin and use admin endpoint if so
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userResponse = await apiClient.get('/auth/me');
        const user = userResponse.data;
        
        if (user.role === 'ADMIN') {
          const response = await adminClient.get('/api/admin/payment-types/active');
          return response.data;
        }
      } catch (error) {
        console.warn('Could not determine user role, using regular endpoint:', error);
      }
    }
    
    // For regular users, try to get payment types from public endpoint
    try {
      const response = await apiClient.get('/payment-types/active');
      return response.data;
    } catch (error) {
      console.warn('No public endpoint for payment types, returning empty array');
      return [];
    }
  },

  getById: async (id: number): Promise<PaymentType> => {
    const response = await adminClient.get(`/api/admin/payment-types/${id}`);
    return response.data;
  },

  create: async (paymentTypeData: { name: string }): Promise<PaymentType> => {
    const response = await adminClient.post('/api/admin/payment-types', paymentTypeData);
    return response.data;
  },

  update: async (id: number, paymentTypeData: { name?: string; isActive?: boolean }): Promise<PaymentType> => {
    const response = await adminClient.put(`/api/admin/payment-types/${id}`, paymentTypeData);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await adminClient.delete(`/api/admin/payment-types/${id}`);
    return response.data;
  },

  toggleActive: async (id: number): Promise<PaymentType> => {
    const response = await adminClient.patch(`/api/admin/payment-types/${id}/toggle`);
    return response.data;
  },
};

// Client Source API
export const clientSources = {
  getAll: async (): Promise<ClientSourceResponse[]> => {
    const response = await apiClient.get('/client-sources');
    return response.data;
  },

  getById: async (id: number): Promise<ClientSourceResponse> => {
    const response = await apiClient.get(`/client-sources/${id}`);
    return response.data;
  },

  create: async (sourceData: ClientSourceRequest): Promise<ClientSourceResponse> => {
    const response = await apiClient.post('/client-sources', sourceData);
    return response.data;
  },

  update: async (id: number, sourceData: UpdateClientSourceRequest): Promise<ClientSourceResponse> => {
    const response = await apiClient.put(`/client-sources/${id}`, sourceData);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/client-sources/${id}`);
    return response.data;
  },

  toggleActive: async (id: number): Promise<ClientSourceResponse> => {
    const response = await apiClient.patch(`/client-sources/${id}/toggle`);
    return response.data;
  },
};

export const expenseCategories = {
  getAll: async (): Promise<ExpenseCategoryResponse[]> => {
    const response = await apiClient.get('/expense-categories');
    return response.data;
  },

  getActive: async (): Promise<ExpenseCategoryResponse[]> => {
    const response = await apiClient.get('/expense-categories/active');
    return response.data;
  },

  getById: async (id: number): Promise<ExpenseCategoryResponse> => {
    const response = await apiClient.get(`/expense-categories/${id}`);
    return response.data;
  },

  create: async (data: ExpenseCategoryRequest): Promise<ExpenseCategoryResponse> => {
    const response = await apiClient.post('/expense-categories', data);
    return response.data;
  },

  update: async (id: number, data: UpdateExpenseCategoryRequest): Promise<ExpenseCategoryResponse> => {
    const response = await apiClient.put(`/expense-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/expense-categories/${id}`);
    return response.data;
  },

  toggleActive: async (id: number): Promise<ExpenseCategoryResponse> => {
    const response = await apiClient.patch(`/expense-categories/${id}/toggle`);
    return response.data;
  }
};

export default apiClient; 