
import { Tenant, PaymentRecord, MaintenanceTicket, FilterSchedule, ExpenseRecord } from '../types';

export const mockTenants: Tenant[] = [];

export const mockPayments: PaymentRecord[] = [];

export const mockTickets: MaintenanceTicket[] = [];

export const mockExpenses: ExpenseRecord[] = [];

export const mockFilters: FilterSchedule[] = [
  { 
    id: 'f1', 
    model: 'UF-591', 
    specification: 'QUICK-FIT新卡式5微米PP濾芯', 
    cycleMonths: 6, 
    location: 'A棟 1F', 
    lastReplaced: '2023-05-01', 
    nextDue: '2023-11-01', 
    status: 'Due Soon' 
  },
  { 
    id: 'f2', 
    model: 'UF-592', 
    specification: 'QUICK-FIT新卡式塊狀活性碳濾芯', 
    cycleMonths: 6, 
    location: 'A棟 1F', 
    lastReplaced: '2023-05-01', 
    nextDue: '2023-11-01', 
    status: 'Due Soon' 
  },
  { 
    id: 'f3', 
    model: 'UF-504', 
    specification: '0.0001微米逆滲透薄膜', 
    cycleMonths: 24, 
    location: 'A棟 1F', 
    lastReplaced: '2022-01-15', 
    nextDue: '2024-01-15', 
    status: 'Good' 
  },
  { 
    id: 'f4', 
    model: 'UF-28', 
    specification: '遠紅外線麥飯石濾芯', 
    cycleMonths: 24, 
    location: 'A棟 1F', 
    lastReplaced: '2021-08-01', 
    nextDue: '2023-08-01', 
    status: 'Overdue' 
  },
  { 
    id: 'f5', 
    model: 'UF-515', 
    specification: '椰殼顆粒活性碳後置濾芯', 
    cycleMonths: 12, 
    location: 'A棟 1F', 
    lastReplaced: '2023-06-01', 
    nextDue: '2024-06-01', 
    status: 'Good' 
  }
];
