export type MainSection = 'overview' | 'people' | 'sessions' | 'finance' | 'system';

export interface PendingCounts {
  users: number;
  sessions: number;
  expenses: number;
}

export interface AdminCard {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  size: 'small' | 'medium' | 'large';
  content: React.ReactNode;
  actions?: CardAction[];
  status?: 'normal' | 'warning' | 'error';
}

export interface CardAction {
  label: string;
  action: string;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

export interface QuickActionConfig {
  action: 'create' | 'edit' | 'view' | 'delete' | 'bulk';
  entityType: 'user' | 'client' | 'session' | 'expense' | 'type';
  data?: any;
}

export interface SystemHealth {
  status: 'good' | 'warning' | 'critical';
  uptime: string;
  activeUsers: number;
  systemLoad: number;
  databaseStatus: 'connected' | 'disconnected';
}

export interface TodaySession {
  id: number;
  clientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface RecentActivity {
  id: number;
  type: 'user_created' | 'session_completed' | 'expense_added' | 'system_update';
  description: string;
  timestamp: string;
  user: string;
} 