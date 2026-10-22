export enum TicketPriority {
  Low = 1,
  Medium = 2,
  High = 3
}

export enum TicketStatus {
  Open = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus | string | number;
  priority: TicketPriority | string | number;
  createdAt: string;
  updatedAt?: string | null;
  createdByName: string;
  assignedToName?: string | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: number;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  priority: number;
}

export interface AssignTicketRequest {
  developerId: number;
}

export interface UpdateTicketStatusRequest {
  status: number;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role?: string;
}
