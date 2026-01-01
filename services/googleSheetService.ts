
import { Tenant } from '../types';

// ============================================================================
// 設定說明：
// 1. 您提供的 Google Sheet ID 為: 1ILclS7FuqTZ_997n7GkJYNvF9OibFinJY7dSY8Rv1yA
// 2. 請務必先在 Apps Script 部署為「網頁應用程式 (Web App)」。
// 3. 將部署後取得的網址 (以 /exec 結尾) 貼在下方引號中。
//    (請勿直接貼上 Google Sheet 的網址，那樣無法運作)
// ============================================================================
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwczxcccdrvLXT26Ly_wi_l9lRFXDV2UPCEPW2XPfN1TV821-14PiewT7ymnfBnHG99/exec"; 

/**
 * 將租客資料同步傳送至 Google Sheet
 * 注意：由於 CORS 限制，這裡使用 mode: 'no-cors'，我們無法讀取回應，但資料會成功送達後端。
 */
export const syncTenantToSheet = async (action: 'CREATE' | 'UPDATE' | 'DELETE', tenant: Partial<Tenant>) => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("Google Sheet Script URL 尚未設定，資料僅儲存於本地瀏覽器。請至 services/googleSheetService.ts 設定。");
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
