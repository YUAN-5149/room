import React, { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { FileText, Calendar, Download, Edit, Plus, Trash2, User, Save, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ContractsProps {
  tenants: Tenant[];
  onAddTenant: (tenant: Tenant) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (id: string) => void;
}

const Contracts: React.FC<ContractsProps> = ({ tenants, onAddTenant, onUpdateTenant, onDeleteTenant }) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [mode, setMode] = useState<'VIEW' | 'EDIT_INFO' | 'ADD'>('VIEW');
  // Removed separate editContractMode since it's now integrated into the main form
  
  // Form State
  const [formData, setFormData] = useState<Tenant>({
    id: '',
    name: '',
    roomNumber: '',
    phone: '',
    email: '',
    moveInDate: '',
    leaseEndDate: '',
    rentAmount: 0,
    deposit: 0,
    idNumber: '',
    contractContent: ''
  });

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || null;

  useEffect(() => {
    if (selectedTenant && mode === 'VIEW') {
      setFormData(selectedTenant);
    }
  }, [selectedTenant, mode]);

  // Template generator
  const getContractTemplate = (tenant: Tenant) => `
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
每月租金新台幣 ${tenant.rentAmount.toLocaleString()} 元整。
擔保金(押金)新台幣 ${tenant.deposit.toLocaleString()} 元整。

第四條：特別約定事項
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
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleStartAdd = () => {
    setFormData({
      id: Date.now().toString(),
      name: '',
      roomNumber: '',
      phone: '',
      email: '',
      moveInDate: new Date().toISOString().split('T')[0],
      leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      rentAmount: 0,
      deposit: 0,
      idNumber: '',
      contractContent: '1. 乙方不得隨意破壞屋內設施。\n2. 乙方應遵守大樓管理規約。\n3. 禁止飼養寵物。'
    });
    setMode('ADD');
    setSelectedTenantId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'ADD') {
      onAddTenant(formData);
      setSelectedTenantId(formData.id);
    } else {
      onUpdateTenant(formData);
    }
    setMode('VIEW');
  };

  const handleDelete = () => {
    if (selectedTenantId) {
      onDeleteTenant(selectedTenantId);
      setSelectedTenantId(null);
      setMode('VIEW');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'rentAmount' || name === 'deposit') ? Number(value) : value
    }));
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b-2 border-orange-100 flex-shrink-0">
        <h2 className="text-2xl font-bold text-stone-800">租客資料與合約管理</h2>
        <div className="flex gap-2">
            <button 
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm transition shadow-sm"
            >
            <Plus size={16} /> 新增租客
            </button>
            <button 
            onClick={handleExportList}
            className="flex items-center gap-2 bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-md text-sm transition shadow-sm"
            >
            <Download size={16} /> 匯出清單
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Column: Tenant List (Fixed Width) */}
        <div className="lg:w-80 flex-shrink-0 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="p-4 bg-orange-50 border-b border-orange-100">
            <h3 className="font-semibold text-amber-900">租客列表 ({tenants.length})</h3>
          </div>
          <div className="divide-y divide-orange-50 overflow-y-auto flex-1">
            {tenants.map(tenant => {
              const daysLeft = calculateDaysLeft(tenant.leaseEndDate);
              return (
                <div 
                  key={tenant.id} 
                  onClick={() => { 
                    setSelectedTenantId(tenant.id); 
                    setMode('VIEW'); 
                  }}
                  className={`p-4 cursor-pointer hover:bg-orange-50 transition border-l-4 ${selectedTenantId === tenant.id ? 'bg-amber-100 border-amber-500' : 'border-transparent'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg text-stone-900">{tenant.name}</p>
                      <p className="text-stone-500">{tenant.roomNumber} | {tenant.phone}</p>
                    </div>
                    {daysLeft < 30 && (
                      <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                        {daysLeft < 0 ? '已過期' : `剩 ${daysLeft} 天`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {tenants.length === 0 && (
                <div className="p-8 text-center text-stone-400 text-sm">
                    尚無租客資料，請點擊上方「新增租客」。
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Details / Form / Contract (Flex Grow) */}
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden min-w-0">
          {(selectedTenantId || mode === 'ADD') ? (
            <>
              {/* Header for Right Panel */}
              <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                     <User size={24} />
                   </div>
                   <div>
                       <h3 className="font-bold text-xl text-stone-800">
                           {mode === 'ADD' ? '新增租客資料' : formData.name}
                       </h3>
                       {mode !== 'ADD' && (
                           <p className="text-sm text-stone-500 font-medium">{formData.roomNumber}</p>
                       )}
                   </div>
                </div>
                
                {mode === 'VIEW' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setMode('EDIT_INFO')}
                            className="flex items-center gap-1 text-sm bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded hover:bg-stone-50 transition font-medium"
                        >
                            <Edit size={16} /> 編輯資料
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-1 text-sm bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded hover:bg-rose-50 transition font-medium"
                        >
                            <Trash2 size={16} /> 刪除
                        </button>
                    </div>
                )}
              </div>
              
              {/* Content Area */}
              <div className="p-8 flex-1 overflow-y-auto">
                {mode === 'EDIT_INFO' || mode === 'ADD' ? (
                  // --- EDIT / ADD FORM ---
                  <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">姓名</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="例：王小明" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">房號</label>
                            <input required name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="例：A-101" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">聯絡電話</label>
                            <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">Email</label>
                            <input name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">身分證字號</label>
                            <input required name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">租金 (TWD)</label>
                            <input required type="number" name="rentAmount" value={formData.rentAmount} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-base font-bold text-stone-700">押金 (TWD)</label>
                            <input required type="number" name="deposit" value={formData.deposit} onChange={handleInputChange} className="w-full p-3 text-lg border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-base font-bold text-stone-700">起租日期</label>
                                <input required type="date" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} className="w-full p-3 text-base border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-base font-bold text-stone-700">到期日期</label>
                                <input required type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleInputChange} className="w-full p-3 text-base border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition" />
                            </div>
                        </div>
                    </div>

                    {/* Contract Content - Integrated into main form */}
                    <div className="space-y-2 border-t border-orange-100 pt-6">
                        <label className="text-base font-bold text-stone-700 block">合約特別約定事項 (可直接編輯)</label>
                        <textarea 
                            name="contractContent"
                            className="w-full p-4 text-base font-mono border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none transition shadow-sm h-48 resize-y"
                            value={formData.contractContent}
                            onChange={handleInputChange}
                            placeholder="請輸入合約特別條款..."
                        />
                         <p className="text-xs text-stone-500">此處內容將會自動填入「第四條：特別約定事項」中。</p>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-6 border-t border-stone-100">
                        <button 
                            type="button"
                            onClick={() => {
                                setMode('VIEW');
                                if(selectedTenant) setFormData(selectedTenant);
                                else setSelectedTenantId(null);
                            }}
                            className="px-6 py-3 text-base font-medium text-stone-600 bg-stone-100 rounded-md hover:bg-stone-200 transition"
                        >
                            取消
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-3 text-base font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-2 shadow-md transition"
                        >
                            <Save size={20} /> {mode === 'ADD' ? '確認新增' : '儲存變更'}
                        </button>
                    </div>
                  </form>
                ) : (
                  // --- VIEW CONTRACT MODE ---
                  <div className="space-y-8">
                      {/* Tenant Details Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-stone-50 p-6 rounded-xl border border-stone-100">
                          <div>
                              <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-1">租金</p>
                              <p className="text-2xl font-bold text-stone-800">${formData.rentAmount.toLocaleString()}</p>
                          </div>
                          <div>
                              <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-1">押金</p>
                              <p className="text-2xl font-bold text-stone-800">${formData.deposit.toLocaleString()}</p>
                          </div>
                          <div>
                              <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-1">合約到期</p>
                              <div className="flex items-center gap-2 text-xl font-bold text-stone-800">
                                  <Calendar size={20} className="text-amber-500"/>
                                  {formData.leaseEndDate}
                              </div>
                          </div>
                          <div>
                              <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-1">聯絡電話</p>
                              <p className="text-xl font-bold text-stone-800">{formData.phone}</p>
                          </div>
                      </div>

                      {/* Contract Preview */}
                      <div className="border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-orange-100/50 p-4 border-b border-orange-200 flex justify-between items-center">
                             <h4 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                                <FileText size={20} /> 租賃契約預覽
                             </h4>
                             <span className="text-xs text-amber-700 bg-orange-200/50 px-2 py-1 rounded">
                                唯讀模式 (請點擊上方編輯按鈕修改)
                             </span>
                          </div>
                          
                          <div className="p-8 bg-white min-h-[600px] flex flex-col">
                            <pre className="whitespace-pre-wrap font-serif text-stone-800 leading-relaxed text-base flex-1 p-2">
                                {getContractTemplate(formData)}
                            </pre>
                          </div>
                      </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 bg-stone-50/50">
              <User size={80} className="mb-6 opacity-40 bg-white p-6 rounded-full shadow-sm" />
              <p className="text-xl font-bold text-stone-500">請選擇左側租客</p>
              <p className="text-base mt-2">或點擊「新增租客」建立新資料</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contracts;