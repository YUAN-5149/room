
import { Tenant, ExpenseRecord, ExpenseCategory } from '../types';

// ============================================================================
// 設定 1: 租客管理 Sheet (既有)
// ============================================================================
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwczxcccdrvLXT26Ly_wi_l9lRFXDV2UPCEPW2XPfN1TV821-14PiewT7ymnfBnHG99/exec"; 

// ============================================================================
// 設定 2: 費用管理 Sheet (新增)
// Sheet ID: 1moxMBNGHAV7e91lT7o5ABgLe4YZVvWo9DhTZNzecjUM
// 請填入您剛剛部署 Expenses Script 後取得的網址 (以 /exec 結尾)
// ============================================================================
export const GOOGLE_SCRIPT_EXPENSES_URL = "https://script.google.com/macros/s/AKfycbymaG_U9W_lUjwmn5N7YeQ0fS5RlHCneG8pjK8b8bCkwkfMpsUwcG08tlU-j8WFRUmI/exec"; 


/**
 * 類別中英轉換對照表
 */
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


/**
 * 將租客資料同步傳送至 Google Sheet
 */
export const syncTenantToSheet = async (action: 'CREATE' | 'UPDATE' | 'DELETE', tenant: Partial<Tenant>) => {
  if (!GOOGLE_SCRIPT_URL) return;

  try {
    const payload = {
      action: action,
      data: {
        id: tenant.id,
        name: tenant.name,
        roomNumber: tenant.roomNumber,
        phone: tenant.phone,
        rentAmount: tenant.rentAmount,
        deposit: tenant.deposit,
        moveInDate: tenant.moveInDate,
        leaseEndDate: tenant.leaseEndDate
      }
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to sync tenant to Google Sheet:", error);
  }
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
            email: '', 
            moveInDate: row.moveInDate || '',
            leaseEndDate: row.leaseEndDate || '',
            rentAmount: Number(row.rentAmount) || 0,
            deposit: Number(row.deposit) || 0,
            idNumber: '',
            contractContent: ''
        })) : null;
    } catch (e) {
        console.error("Fetch tenant sheet error", e);
        return null;
    }
}

/**
 * 將費用資料同步至 Google Sheet (Expenses)
 */
export const syncExpenseToSheet = async (action: 'CREATE' | 'DELETE', expense: Partial<ExpenseRecord>) => {
  if (!GOOGLE_SCRIPT_EXPENSES_URL) {
    console.warn("Expense Sheet URL 尚未設定");
    return;
  }

  try {
    // 轉換類別為中文再傳送
    const categoryZH = expense.category ? CATEGORY_MAP_TO_ZH[expense.category] : '雜支';

    const payload = {
      action: action,
      data: {
        id: expense.id,
        category: categoryZH,
        amount: expense.amount,
        date: expense.date,
        description: expense.description
      }
    };

    await fetch(GOOGLE_SCRIPT_EXPENSES_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log(`Synced expense ${action} to sheet`);
  } catch (error) {
    console.error("Failed to sync expense:", error);
  }
};

/**
 * 從 Google Sheet 讀取費用資料
 */
export const fetchExpensesFromSheet = async (): Promise<ExpenseRecord[] | null> => {
  if (!GOOGLE_SCRIPT_EXPENSES_URL) return null;

  try {
    const response = await fetch(GOOGLE_SCRIPT_EXPENSES_URL);
    const data = await response.json();
    
    // 將中文類別轉回英文 Enum
    return Array.isArray(data) ? data.map((row: any) => ({
      id: row.id || `exp-${Math.random()}`,
      category: CATEGORY_MAP_TO_EN[row.category] || 'Other',
      amount: Number(row.amount) || 0,
      date: row.date || '',
      description: row.description || ''
    })) : null;

  } catch (e) {
    console.error("Fetch expense sheet error", e);
    return null;
  }
};
