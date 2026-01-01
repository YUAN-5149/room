
import { Tenant, ExpenseRecord, ExpenseCategory, PaymentRecord, PaymentStatus, MaintenanceTicket, FilterSchedule, MaintenanceStatus, Priority } from '../types';

// ============================================================================
// 設定 1: 租客管理 Sheet
// Sheet ID: 1ILclS7FuqTZ_997n7GkJYNvF9OibFinJY7dSY8Rv1yA
// 請填入您剛剛部署 Tenants Script 後取得的網址 (以 /exec 結尾)
// ============================================================================
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw70J0EVv__jiy07J8awh997Wpr4gTC5P7CIGEJqx3LPc2LIZMlZLZvd9D2spOeDA/exec"; 

// ============================================================================
// 設定 2: 費用管理 Sheet
// ============================================================================
export const GOOGLE_SCRIPT_EXPENSES_URL = "https://script.google.com/macros/s/AKfycbymaG_U9W_lUjwmn5N7YeQ0fS5RlHCneG8pjK8b8bCkwkfMpsUwcG08tlU-j8WFRUmI/exec"; 

// ============================================================================
// 設定 3: 財務管理 Sheet
// ============================================================================
export const GOOGLE_SCRIPT_PAYMENTS_URL = "https://script.google.com/macros/s/AKfycbyvd6BkeKdwqMx8y-VJVop81256WORFxfpmbwB-UJg3qOEPDO5YFS6CIFZwZAdA_1fN2A/exec"; 

// ============================================================================
// 設定 4: 維修管理 Sheet
// ============================================================================
export const GOOGLE_SCRIPT_MAINTENANCE_URL = "https://script.google.com/macros/s/AKfycbymi85ebX1JCDoGIXeq1qOLtruOAVyNCibQrD_wPigccpAzFQN1N-ReW-sOzu4TUP3oEA/exec"; 


/** 類別中英轉換 (費用) */
const CATEGORY_MAP_TO_ZH: Record<ExpenseCategory, string> = {
  'Water': '自來水費',
  'Electricity': '電費',
  'Gas': '瓦斯費',
  'Internet': '網路費',
  'Cleaning': '清潔費',
  'Other': '雜支'
};

const CATEGORY_MAP_TO_EN: Record<string, ExpenseCategory> = {
  '自來水費': 'Water',
  '電費': 'Electricity',
  '瓦斯費': 'Gas',
  '網路費': 'Internet',
  '清潔費': 'Cleaning',
  '雜支': 'Other'
};

/** 帳單類別中英轉換 (財務) */
const PAYMENT_TYPE_TO_ZH: Record<string, string> = {
  'Rent': '租金',
  'Utility': '水電費',
  'Deposit': '押金',
  'Other': '其他'
};

const PAYMENT_TYPE_TO_EN: Record<string, any> = {
  '租金': 'Rent',
  '水電費': 'Utility',
  '押金': 'Deposit',
  '其他': 'Other'
};

/** 維修狀態中英轉換 */
const MAINTENANCE_STATUS_TO_ZH: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.OPEN]: '待處理',
  [MaintenanceStatus.IN_PROGRESS]: '維修中',
  [MaintenanceStatus.COMPLETED]: '已完成'
};
const MAINTENANCE_STATUS_TO_EN: Record<string, MaintenanceStatus> = {
  '待處理': MaintenanceStatus.OPEN,
  '維修中': MaintenanceStatus.IN_PROGRESS,
  '已完成': MaintenanceStatus.COMPLETED,
  'Open': MaintenanceStatus.OPEN, // Fallback
  'In Progress': MaintenanceStatus.IN_PROGRESS,
  'Completed': MaintenanceStatus.COMPLETED
};

/** 優先級中英轉換 */
const PRIORITY_TO_ZH: Record<Priority, string> = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高'
};
const PRIORITY_TO_EN: Record<string, Priority> = {
  '低': Priority.LOW,
  '中': Priority.MEDIUM,
  '高': Priority.HIGH,
  'Low': Priority.LOW, // Fallback
  'Medium': Priority.MEDIUM,
  'High': Priority.HIGH
};
const MAINTENANCE_CAT_TO_ZH: Record<string, string> = {
    'Appliance': '家電',
    'Plumbing': '水電管路',
    'Electrical': '電力系統',
    'Filter': '濾心耗材',
    'Other': '其他'
};
const MAINTENANCE_CAT_TO_EN: Record<string, any> = {
    '家電': 'Appliance',
    '水電管路': 'Plumbing',
    '電力系統': 'Electrical',
    '濾心耗材': 'Filter',
    '其他': 'Other'
};


// --- Tenants Sync ---
export const syncTenantToSheet = async (action: 'CREATE' | 'UPDATE' | 'DELETE', tenant: Partial<Tenant>) => {
  if (!GOOGLE_SCRIPT_URL) return;
  try {
    const dataToSync = { ...tenant };
    
    // 如果有電話號碼，移除所有非數字字元 (例如連字號、空白)，只保留數值
    if (dataToSync.phone) {
        dataToSync.phone = dataToSync.phone.replace(/\D/g, '');
    }

    const payload = { action, data: dataToSync };
    await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (error) { console.error("Tenant Sync Error", error); }
};

export const fetchTenantsFromSheet = async (): Promise<Tenant[] | null> => {
    if (!GOOGLE_SCRIPT_URL) return null;
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        return Array.isArray(data) ? data.map((row: any) => ({
            id: row.id || `t-${Math.random()}`,
            name: row.name || '',
            roomNumber: row.roomNumber || '',
            phone: row.phone || '',
            email: row.email || '', 
            moveInDate: row.moveInDate || '',
            leaseEndDate: row.leaseEndDate || '',
            rentAmount: Number(row.rentAmount) || 0,
            deposit: Number(row.deposit) || 0,
            idNumber: row.idNumber || '',
            contractContent: row.contractContent || ''
        })) : null;
    } catch (e) { return null; }
}

// --- Expenses Sync ---
export const syncExpenseToSheet = async (action: 'CREATE' | 'DELETE', expense: Partial<ExpenseRecord>) => {
  if (!GOOGLE_SCRIPT_EXPENSES_URL) return;
  try {
    const categoryZH = expense.category ? CATEGORY_MAP_TO_ZH[expense.category] : '雜支';
    const payload = { action, data: { ...expense, category: categoryZH } };
    await fetch(GOOGLE_SCRIPT_EXPENSES_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (error) { console.error("Expense Sync Error", error); }
};

export const fetchExpensesFromSheet = async (): Promise<ExpenseRecord[] | null> => {
  if (!GOOGLE_SCRIPT_EXPENSES_URL) return null;
  try {
    const response = await fetch(GOOGLE_SCRIPT_EXPENSES_URL);
    const data = await response.json();
    return Array.isArray(data) ? data.map((row: any) => ({
      id: row.id,
      category: CATEGORY_MAP_TO_EN[row.category] || 'Other',
      amount: Number(row.amount) || 0,
      date: row.date || '',
      description: row.description || ''
    })) : null;
  } catch (e) { return null; }
};

// --- Payments Sync ---
export const syncPaymentToSheet = async (action: 'CREATE' | 'UPDATE' | 'DELETE', payment: Partial<PaymentRecord>) => {
  if (!GOOGLE_SCRIPT_PAYMENTS_URL) return;
  try {
    const typeZH = payment.type ? (PAYMENT_TYPE_TO_ZH[payment.type] || '其他') : '';
    const payload = { action, data: { ...payment, type: typeZH } };
    await fetch(GOOGLE_SCRIPT_PAYMENTS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (error) { console.error("Payment Sync Error", error); }
};

export const fetchPaymentsFromSheet = async (): Promise<PaymentRecord[] | null> => {
  if (!GOOGLE_SCRIPT_PAYMENTS_URL) return null;
  try {
    const response = await fetch(GOOGLE_SCRIPT_PAYMENTS_URL);
    const data = await response.json();
    return Array.isArray(data) ? data.map((row: any) => ({
      id: row.id,
      tenantId: row.tenantId,
      tenantName: row.tenantName,
      amount: Number(row.amount) || 0,
      dueDate: row.dueDate || '',
      status: row.status as PaymentStatus,
      type: PAYMENT_TYPE_TO_EN[row.type] || 'Other'
    })) : null;
  } catch (e) { return null; }
};

// --- Maintenance Sync ---

export const syncMaintenanceToSheet = async (
  action: 'CREATE' | 'UPDATE' | 'DELETE', 
  type: 'REPAIR' | 'FILTER', 
  data: Partial<MaintenanceTicket> | Partial<FilterSchedule>
) => {
  if (!GOOGLE_SCRIPT_MAINTENANCE_URL) return;
  try {
    let finalData = { ...data };
    
    // 轉換中文
    if (type === 'REPAIR') {
      const ticket = data as Partial<MaintenanceTicket>;
      if(ticket.status) (finalData as any).status = MAINTENANCE_STATUS_TO_ZH[ticket.status];
      if(ticket.priority) (finalData as any).priority = PRIORITY_TO_ZH[ticket.priority];
      if(ticket.category) (finalData as any).category = MAINTENANCE_CAT_TO_ZH[ticket.category] || '其他';
    } 

    const payload = { action, type, data: finalData };
    await fetch(GOOGLE_SCRIPT_MAINTENANCE_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (error) { console.error("Maintenance Sync Error", error); }
};

export const fetchMaintenanceFromSheet = async (): Promise<{ repairs: MaintenanceTicket[], filters: FilterSchedule[] } | null> => {
  if (!GOOGLE_SCRIPT_MAINTENANCE_URL) return null;
  try {
    const response = await fetch(GOOGLE_SCRIPT_MAINTENANCE_URL);
    const json = await response.json(); 
    
    const repairs = Array.isArray(json.repairs) ? json.repairs.map((row: any) => ({
        id: row.id,
        tenantId: row.tenantId,
        tenantName: row.tenantName,
        description: row.description,
        reportDate: row.reportDate,
        status: MAINTENANCE_STATUS_TO_EN[row.status] || MaintenanceStatus.OPEN,
        priority: PRIORITY_TO_EN[row.priority] || Priority.MEDIUM,
        category: MAINTENANCE_CAT_TO_EN[row.category] || 'Other',
        cost: Number(row.cost) || 0,
        notes: row.notes || ''
    })) : [];

    const filters = Array.isArray(json.filters) ? json.filters.map((row: any) => ({
        id: row.id,
        model: row.model,
        specification: row.specification,
        cycleMonths: Number(row.cycleMonths),
        location: row.location,
        lastReplaced: row.lastReplaced,
        nextDue: row.nextDue,
        status: row.status as any
    })) : [];

    return { repairs, filters };

  } catch (e) { return null; }
};
