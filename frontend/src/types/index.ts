export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export enum UserApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface PendingUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
  approvalStatus: UserApprovalStatus;
}

export interface UserApprovalRequest {
  userId: number;
  reason?: string;
}

export interface UserRejectionRequest {
  userId: number;
  reason: string;
}

export interface UserApprovalResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  approvalStatus: UserApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ApprovalHistoryResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  approvalStatus: UserApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
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
  clientId?: number;
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

export interface UpdatePersonalMeetingRequest {
  therapistName?: string;
  meetingDate?: string;
  duration?: number;
  price?: number;
  isPaid?: boolean;
  notes?: string;
  status?: PersonalMeetingStatus;
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

// Revenue tracking types
export interface RevenueStatsRequest {
  period: 'daily' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface RevenueResponse {
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  totalMeetings: number;
  paidMeetings: number;
  unpaidMeetings: number;
  completedMeetings: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  meetingsToday: number;
  unpaidSessions: number;
  monthlyRevenue: number;
} 