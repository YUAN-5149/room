import React, { useState } from 'react';
import { Tenant } from '../types';
import { FileText, Calendar, Download, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ContractsProps {
  tenants: Tenant[];
}

const Contracts: React.FC<ContractsProps> = ({ tenants }) => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Simple template for Taiwan Residential Lease Agreement (Simplified)
  const defaultContractTemplate = (tenant: Tenant) => `
中華民國房屋租賃契約書 (範本)

立契約書人：
出租人： 房東姓名 (以下簡稱甲方)
承租人： ${tenant.name} (以下簡稱乙方)

第一條：租賃房屋標示
房屋所在地： 台北市... (請填寫)
房號： ${tenant.roomNumber}

第二條：租賃期限
自 ${tenant.moveInDate} 起至 ${tenant.leaseEndDate} 止。

第三條：租金約定
每月租金新台幣 ${tenant.rentAmount} 元整。
擔保金(押金)新台幣 ${tenant.deposit} 元整。

第四條：特別約定事項 (可編輯)
${tenant.contractContent || "1. 乙方不得隨意破壞屋內設施。\n2. 乙方應遵守大樓管理規約。\n3. 禁止飼養寵物。"}

立契約書人
甲方(簽章)：________________
乙方(簽章)：________________
身分證字號：${tenant.idNumber}
  `;

  const handleExportList = () => {
    const ws = XLSX.utils.json_to_sheet(tenants);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tenants");
    XLSX.writeFile(wb, "Tenant_List.xlsx");
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b-2 border-orange-100">
        <h2 className="text-2xl font-bold text-stone-800">合約與租客資料</h2>
        <button 
          onClick={handleExportList}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm transition shadow-sm"
        >
          <Download size={16} /> 匯出租客清單
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-orange-50 border-b border-orange-100">
            <h3 className="font-semibold text-amber-900">租客列表</h3>
          </div>
          <div className="divide-y divide-orange-50 max-h-[600px] overflow-y-auto">
            {tenants.map(tenant => {
              const daysLeft = calculateDaysLeft(tenant.leaseEndDate);
              return (
                <div 
                  key={tenant.id} 
                  onClick={() => { setSelectedTenant(tenant); setIsEditing(false); }}
                  className={`p-4 cursor-pointer hover:bg-orange-50 transition ${selectedTenant?.id === tenant.id ? 'bg-amber-100 border-l-4 border-amber-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-stone-900">{tenant.name}</p>
                      <p className="text-sm text-stone-500">{tenant.roomNumber}</p>
                    </div>
                    {daysLeft < 30 && (
                      <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full">
                        {daysLeft < 0 ? '已過期' : `剩 ${daysLeft} 天`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Viewer/Editor */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow min-h-[500px] flex flex-col">
          {selectedTenant ? (
            <>
              <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
                <div>
                   <h3 className="font-bold text-lg text-stone-800">{selectedTenant.name} - 合約詳情</h3>
                   <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                      <Calendar size={14} /> 到期日: {selectedTenant.leaseEndDate}
                   </div>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-amber-700 hover:text-amber-900 flex items-center gap-1 text-sm font-medium"
                >
                  <Edit size={16} /> {isEditing ? '預覽合約' : '編輯條款'}
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {isEditing ? (
                  <div className="space-y-4">
                     <p className="text-sm text-stone-600 mb-2">編輯合約特別約定事項：</p>
                     <textarea 
                        className="w-full h-96 p-4 border border-stone-200 rounded-md font-mono text-sm leading-relaxed focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                        defaultValue={selectedTenant.contractContent || "1. 乙方不得隨意破壞屋內設施。\n2. 乙方應遵守大樓管理規約。\n3. 禁止飼養寵物。"}
                        onChange={(e) => {
                          // In a real app, update state here
                          selectedTenant.contractContent = e.target.value;
                        }}
                     />
                     <p className="text-xs text-stone-400">* 此處僅為演示，資料更新不會持久化。</p>
                  </div>
                ) : (
                  <div className="bg-orange-50/30 p-8 rounded border border-orange-100 shadow-sm">
                    <pre className="whitespace-pre-wrap font-serif text-stone-800 leading-relaxed">
                      {defaultContractTemplate(selectedTenant)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
              <FileText size={64} className="mb-4 opacity-50" />
              <p>請選擇左側租客以查看或編輯合約</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contracts;