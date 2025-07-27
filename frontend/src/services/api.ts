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
  DashboardStats
} from '../types';

// Automatically detect production environment and use Railway backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
    ? 'https://web-production-9aa8.up.railway.app/api'
    : 'http://localhost:8085/api');

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌍 Current hostname:', window.location.hostname);

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
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
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
    console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url, '✅', response.status);
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
    return response.data;
  },

  getById: async (id: number): Promise<Client> => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
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

  search: async (name: string): Promise<Client[]> => {
    const response = await apiClient.get(`/clients/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },
};

// Meeting API
export const meetings = {
  getAll: async (): Promise<Meeting[]> => {
    const response = await apiClient.get('/meetings');
    return response.data;
  },

  getById: async (id: number): Promise<Meeting> => {
    const response = await apiClient.get(`/meetings/${id}`);
    return response.data;
  },

  create: async (meetingData: MeetingRequest): Promise<Meeting> => {
    const response = await apiClient.post('/meetings', meetingData);
    return response.data;
  },

  update: async (id: number, meetingData: UpdateMeetingRequest): Promise<Meeting> => {
    const response = await apiClient.put(`/meetings/${id}`, meetingData);
    return response.data;
  },

  updatePayment: async (id: number, isPaid: boolean): Promise<Meeting> => {
    const response = await apiClient.patch(`/meetings/${id}/payment`, { 
      isPaid, 
      paymentDate: isPaid ? new Date().toISOString() : null 
    });
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/meetings/${id}`);
    return response.data;
  },

  getByMonth: async (year: number, month: number): Promise<Meeting[]> => {
    const response = await apiClient.get(`/meetings/month?year=${year}&month=${month}`);
    return response.data;
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
    const response = await apiClient.get('/meetings/dashboard-stats');
    return response.data;
  },
};

// Personal Meeting API
export const personalMeetings = {
  getAll: async (): Promise<PersonalMeeting[]> => {
    const response = await apiClient.get('/personal-meetings');
    return response.data;
  },

  getById: async (id: number): Promise<PersonalMeeting> => {
    const response = await apiClient.get(`/personal-meetings/${id}`);
    return response.data;
  },

  create: async (meetingData: PersonalMeetingRequest): Promise<PersonalMeeting> => {
    const response = await apiClient.post('/personal-meetings', meetingData);
    return response.data;
  },

  update: async (id: number, meetingData: UpdatePersonalMeetingRequest): Promise<PersonalMeeting> => {
    const response = await apiClient.put(`/personal-meetings/${id}`, meetingData);
    return response.data;
  },

  updatePayment: async (id: number, isPaid: boolean): Promise<PersonalMeeting> => {
    const response = await apiClient.patch(`/personal-meetings/${id}/payment`, { 
      isPaid, 
      paymentDate: isPaid ? new Date().toISOString() : null 
    });
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`/personal-meetings/${id}`);
    return response.data;
  },

  getByMonth: async (year: number, month: number): Promise<PersonalMeeting[]> => {
    const response = await apiClient.get(`/personal-meetings/month?year=${year}&month=${month}`);
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/personal-meetings/stats');
    return response.data;
  },
};

export default apiClient; 