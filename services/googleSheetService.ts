
import { Tenant } from '../types';

// ============================================================================
// 重要：請將此處替換為您 Google Apps Script 部署後的「網頁應用程式網址」
// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
// ============================================================================
export const GOOGLE_SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1ILclS7FuqTZ_997n7GkJYNvF9OibFinJY7dSY8Rv1yA/edit?gid=0#gid=0"; 

/**
 * 將租客資料同步傳送至 Google Sheet
 * 注意：由於 CORS 限制，這裡使用 mode: 'no-cors'，我們無法讀取回應，但資料會成功送達後端。
 */
export const syncTenantToSheet = async (action: 'CREATE' | 'UPDATE' | 'DELETE', tenant: Partial<Tenant>) => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("Google Sheet Script URL尚未設定，僅儲存於本地。");
    return;
  }

  try {
    // 準備要傳送的 payload
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

    // 使用 fetch 發送 POST 請求
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // 避開跨域問題 (Opaque response)
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`Successfully sent ${action} request to Google Sheet for ${tenant.name}`);

  } catch (error) {
    console.error("Failed to sync to Google Sheet:", error);
    // 即使失敗也不阻擋前端操作，確保用戶體驗流暢
  }
};

/**
 * 從 Google Sheet 讀取資料 (如果已設定)
 */
export const fetchTenantsFromSheet = async (): Promise<Tenant[] | null> => {
    if (!GOOGLE_SCRIPT_URL) return null;

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        // 簡單轉換，確保符合 Tenant 介面
        return Array.isArray(data) ? data.map((row: any) => ({
            id: row.id || `t-${Math.random()}`,
            name: row.name || '',
            roomNumber: row.roomNumber || '',
            phone: row.phone || '',
            email: '', // Sheet 範例中未包含，設為空
            moveInDate: row.moveInDate || '',
            leaseEndDate: row.leaseEndDate || '',
            rentAmount: Number(row.rentAmount) || 0,
            deposit: Number(row.deposit) || 0,
            idNumber: '',
            contractContent: ''
        })) : null;
    } catch (e) {
        console.error("Fetch sheet error", e);
        return null;
    }
}
