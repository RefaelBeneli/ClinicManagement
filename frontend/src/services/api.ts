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
  PersonalMeeting,
  PersonalMeetingRequest,
  MessageResponse
} from '../types';

// Automatically detect production environment and use Railway backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
    ? 'https://web-production-9aa8.up.railway.app/api'
    : 'http://localhost:8085/api');

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

  update: async (id: number, meetingData: Partial<MeetingRequest>): Promise<Meeting> => {
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

  update: async (id: number, meetingData: Partial<PersonalMeetingRequest>): Promise<PersonalMeeting> => {
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
};

export default apiClient; 