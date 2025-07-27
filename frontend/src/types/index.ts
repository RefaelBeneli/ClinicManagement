export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface Client {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  isActive: boolean;
}

export interface ClientRequest {
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  notes?: string;
}

export interface Meeting {
  id: number;
  client: Client;
  meetingDate: string;
  duration: number;
  price: number;
  isPaid: boolean;
  paymentDate?: string;
  notes?: string;
  status: MeetingStatus;
  createdAt: string;
}

export interface MeetingRequest {
  clientId: number;
  meetingDate: string;
  duration?: number;
  price: number;
  notes?: string;
}

export interface UpdateMeetingRequest {
  meetingDate?: string;
  duration?: number;
  price?: number;
  isPaid?: boolean;
  notes?: string;
  status?: MeetingStatus;
}

export interface PersonalMeeting {
  id: number;
  therapistName: string;
  meetingDate: string;
  duration: number;
  price: number;
  isPaid: boolean;
  paymentDate?: string;
  notes?: string;
  status: PersonalMeetingStatus;
  createdAt: string;
}

export interface PersonalMeetingRequest {
  therapistName: string;
  meetingDate: string;
  duration?: number;
  price: number;
  notes?: string;
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum PersonalMeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface MessageResponse {
  message: string;
} 