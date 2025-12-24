export enum PaymentStatus {
  PAID = '已繳',
  PENDING = '待繳',
  OVERDUE = '逾期',
}

export enum MaintenanceStatus {
  OPEN = '處理中',
  IN_PROGRESS = '維修中',
  COMPLETED = '已完成',
}

export enum Priority {
  LOW = '低',
  MEDIUM = '中',
  HIGH = '高',
}

export interface Tenant {
  id: string;
  name: string;
  roomNumber: string;
  phone: string;
  email: string;
  moveInDate: string;
  leaseEndDate: string;
  rentAmount: number;
  deposit: number;
  idNumber: string; // ID Card number
  contractContent?: string; // Custom contract clauses
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  type: 'Rent' | 'Utility' | 'Other';
}

export interface MaintenanceTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  description: string;
  reportDate: string;
  status: MaintenanceStatus;
  priority: Priority;
  category: 'Appliance' | 'Plumbing' | 'Electrical' | 'Filter' | 'Other';
  cost?: number;
  notes?: string;
}

export interface FilterSchedule {
  id: string;
  location: string; // e.g., "Building A - 2F Common Area"
  lastReplaced: string;
  nextDue: string;
  status: 'Good' | 'Due Soon' | 'Overdue';
}