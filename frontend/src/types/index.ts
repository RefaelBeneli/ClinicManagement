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
  approvalStatus: string;
  rejectionReason?: string;
}

export interface UserRejectionRequest {
  approvalStatus: string;
  rejectionReason: string;
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
  notes?: string;
  source?: ClientSourceResponse; // NEW: Client source information
  createdAt: string;
  active: boolean;
}

export interface ClientRequest {
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  sourceId: number; // NEW: Required source ID
}

export interface PaymentType {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSource {
  id: number;
  name: string;
  duration: number;
  price: number;
  noShowPrice: number;
  defaultSessions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// NEW: ClientSourceResponse interface
export interface ClientSourceResponse {
  id: number;
  name: string;
  duration: number;
  price: number;
  noShowPrice: number;
  defaultSessions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// NEW: ClientSourceRequest interface
export interface ClientSourceRequest {
  name: string;
  duration: number;
  price: number;
  noShowPrice: number;
  defaultSessions: number;
}

// NEW: UpdateClientSourceRequest interface
export interface UpdateClientSourceRequest {
  name?: string;
  duration?: number;
  price?: number;
  noShowPrice?: number;
  defaultSessions?: number;
  isActive?: boolean;
}

export interface PersonalMeetingTypeEntity {
  id: number;
  name: string;
  duration: number;
  price: number;
  isRecurring: boolean;
  recurrenceFrequency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSourceRequest {
  name: string;
  duration: number;
  price: number;
  noShowPrice: number;
}

export interface UpdateMeetingSourceRequest {
  name?: string;
  duration?: number;
  price?: number;
  noShowPrice?: number;
  isActive?: boolean;
}

export interface Meeting {
  id: number;
  client: Client;
  source: MeetingSource;
  meetingDate: string;
  duration: number;
  price: number;
  isPaid: boolean;
  paymentDate?: string;
  paymentType?: PaymentType;
  notes?: string;
  summary?: string;
  status: MeetingStatus;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  totalSessions?: number;
  sessionNumber: number;
  parentMeetingId?: number;
  createdAt: string;
  active?: boolean;
}

export interface MeetingRequest {
  clientId: number;
  meetingDate: string;
  duration?: number;
  price?: number;
  notes?: string;
  summary?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  totalSessions?: number;
}

export interface UpdateMeetingRequest {
  clientId?: number;
  meetingDate?: string;
  duration?: number;
  price?: number;
  isPaid?: boolean;
  paymentDate?: string;
  paymentTypeId?: number;
  notes?: string;
  summary?: string;
  status?: MeetingStatus;
}

export interface PersonalMeeting {
  id: number;
  therapistName: string;
  meetingType?: PersonalMeetingTypeEntity;
  providerType: string;
  providerCredentials?: string;
  meetingDate: string;
  duration: number;
  price: number;
  isPaid: boolean;
  paymentDate?: string;
  notes?: string;
  summary?: string;
  status: PersonalMeetingStatus;
  isRecurring: boolean;
  recurrenceFrequency?: string;
  nextDueDate?: string;
  createdAt: string;
  active?: boolean;
}

export interface PersonalMeetingRequest {
  therapistName: string;
  meetingType?: PersonalMeetingTypeEntity;
  providerType?: string;
  providerCredentials?: string;
  meetingDate: string;
  duration?: number;
  price: number;
  notes?: string;
  summary?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  nextDueDate?: string;
  // Payment tracking fields
  isPaid?: boolean;
  paymentDate?: string;
}

export interface UpdatePersonalMeetingRequest {
  therapistName?: string;
  meetingType?: PersonalMeetingTypeEntity;
  providerType?: string;
  providerCredentials?: string;
  meetingDate?: string;
  duration?: number;
  price?: number;
  isPaid?: boolean;
  notes?: string;
  summary?: string;
  status?: PersonalMeetingStatus;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  nextDueDate?: string;
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

export enum PersonalMeetingType {
  PERSONAL_THERAPY = 'PERSONAL_THERAPY',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
  SUPERVISION = 'SUPERVISION',
  TEACHING_SESSION = 'TEACHING_SESSION'
}

export enum RecurrenceFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
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

// Google Calendar Integration Types
export interface CalendarIntegration {
  id: number;
  userId: number;
  googleCalendarId?: string;
  clientSessionCalendar?: string;
  personalMeetingCalendar?: string;
  syncEnabled: boolean;
  syncClientSessions: boolean;
  syncPersonalMeetings: boolean;
  lastSyncDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarIntegrationRequest {
  clientSessionCalendar?: string;
  personalMeetingCalendar?: string;
  syncEnabled?: boolean;
  syncClientSessions?: boolean;
  syncPersonalMeetings?: boolean;
}

export interface UpdateCalendarIntegrationRequest {
  clientSessionCalendar?: string;
  personalMeetingCalendar?: string;
  syncEnabled?: boolean;
  syncClientSessions?: boolean;
  syncPersonalMeetings?: boolean;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
}

export interface CalendarSyncStatus {
  connected: boolean;
  lastSyncDate?: string;
  syncEnabled: boolean;
  clientSessionsSynced: boolean;
  personalMeetingsSynced: boolean;
  errorMessage?: string;
}

export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

// Unified Calendar Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'clinic' | 'google';
  status?: string;
  clientName?: string;
  description?: string;
  location?: string;
  isConflict?: boolean;
}

export interface CalendarConflict {
  startTime: Date;
  endTime: Date;
  conflictingEvents: UnifiedCalendarEvent[];
  severity: 'warning' | 'error';
}

// Expense Types
export interface Expense {
  id: number;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategoryResponse;
  notes?: string;
  expenseDate: string;
  isRecurring: boolean;
  recurrenceFrequency?: string;
  recurrenceCount?: number | null;
  isPaid: boolean;
  paymentType?: PaymentType;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface ExpenseRequest {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  categoryId: number;
  notes?: string;
  expenseDate: string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  recurrenceCount?: number | null;
  isPaid?: boolean;
  paymentTypeId?: number;
  receiptUrl?: string;
}

export interface ExpenseResponse {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategoryResponse;
  notes: string | null;
  expenseDate: string;
  isRecurring: boolean;
  recurrenceFrequency: string | null;
  nextDueDate: string | null;
  isPaid: boolean;
  paymentType: PaymentType | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface UpdateExpenseRequest {
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  categoryId?: number;
  notes?: string;
  expenseDate?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  recurrenceCount?: number | null;
  isPaid?: boolean;
  paymentTypeId?: number;
  receiptUrl?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  paidExpenses: number;
  unpaidExpenses: number;
  recurringExpenses: number;
  monthlyAverage: number;
  categoryBreakdown: Record<string, number>;
}

export interface ExpenseCategoryResponse {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateExpenseCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
} 