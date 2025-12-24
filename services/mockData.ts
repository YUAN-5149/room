import { Tenant, PaymentRecord, PaymentStatus, MaintenanceTicket, MaintenanceStatus, Priority, FilterSchedule } from '../types';

export const mockTenants: Tenant[] = [
  {
    id: 't1',
    name: '陳小明',
    roomNumber: 'A-101',
    phone: '0912-345-678',
    email: 'ming@example.com',
    moveInDate: '2023-01-01',
    leaseEndDate: '2024-01-01',
    rentAmount: 15000,
    deposit: 30000,
    idNumber: 'A123456789',
  },
  {
    id: 't2',
    name: '林雅婷',
    roomNumber: 'A-102',
    phone: '0922-333-444',
    email: 'yating@example.com',
    moveInDate: '2023-05-15',
    leaseEndDate: '2024-05-15',
    rentAmount: 16500,
    deposit: 33000,
    idNumber: 'B234567890',
  },
  {
    id: 't3',
    name: '張志豪',
    roomNumber: 'B-201',
    phone: '0933-555-666',
    email: 'hao@example.com',
    moveInDate: '2023-08-01',
    leaseEndDate: '2024-08-01',
    rentAmount: 14000,
    deposit: 28000,
    idNumber: 'C345678901',
  },
];

export const mockPayments: PaymentRecord[] = [
  { id: 'p1', tenantId: 't1', tenantName: '陳小明', amount: 15000, dueDate: '2023-10-05', paidDate: '2023-10-04', status: PaymentStatus.PAID, type: 'Rent' },
  { id: 'p2', tenantId: 't2', tenantName: '林雅婷', amount: 16500, dueDate: '2023-10-05', status: PaymentStatus.OVERDUE, type: 'Rent' },
  { id: 'p3', tenantId: 't3', tenantName: '張志豪', amount: 14000, dueDate: '2023-10-05', status: PaymentStatus.PENDING, type: 'Rent' },
  { id: 'p4', tenantId: 't1', tenantName: '陳小明', amount: 15000, dueDate: '2023-09-05', paidDate: '2023-09-03', status: PaymentStatus.PAID, type: 'Rent' },
  { id: 'p5', tenantId: 't2', tenantName: '林雅婷', amount: 16500, dueDate: '2023-09-05', paidDate: '2023-09-06', status: PaymentStatus.PAID, type: 'Rent' },
  { id: 'p6', tenantId: 't3', tenantName: '張志豪', amount: 14000, dueDate: '2023-09-05', paidDate: '2023-09-05', status: PaymentStatus.PAID, type: 'Rent' },
];

export const mockTickets: MaintenanceTicket[] = [
  { id: 'm1', tenantId: 't1', tenantName: '陳小明', description: '冷氣不冷，有異音', reportDate: '2023-09-20', status: MaintenanceStatus.COMPLETED, priority: Priority.MEDIUM, category: 'Appliance', cost: 2500, notes: '清洗濾網並更換電容' },
  { id: 'm2', tenantId: 't2', tenantName: '林雅婷', description: '浴室水龍頭漏水', reportDate: '2023-10-02', status: MaintenanceStatus.IN_PROGRESS, priority: Priority.HIGH, category: 'Plumbing' },
  { id: 'm3', tenantId: 't3', tenantName: '張志豪', description: '更換臥室燈泡', reportDate: '2023-10-04', status: MaintenanceStatus.OPEN, priority: Priority.LOW, category: 'Electrical' },
];

export const mockFilters: FilterSchedule[] = [
  { id: 'f1', location: 'A棟 1F 公共飲水機', lastReplaced: '2023-07-01', nextDue: '2023-10-01', status: 'Overdue' },
  { id: 'f2', location: 'A棟 3F 公共飲水機', lastReplaced: '2023-09-15', nextDue: '2023-12-15', status: 'Good' },
  { id: 'f3', location: 'B棟 2F 公共飲水機', lastReplaced: '2023-08-01', nextDue: '2023-11-01', status: 'Due Soon' },
];