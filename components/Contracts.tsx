
import React, { useState, useEffect, useMemo } from 'react';
import { Tenant, PaymentRecord, PaymentStatus } from '../types';
// Added Home to the imports from lucide-react
import { FileText, Edit, Plus, Trash2, User, Save, X, ChevronRight, Search, Users, Zap, DollarSign, Clock, Printer, ScrollText, Home, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ContractsProps {
  tenants: Tenant[];
  payments: PaymentRecord[];
  onAddTenant: (tenant: Tenant, options?: { genRent: boolean, genDeposit: boolean }) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (id: string) => void;
}

const Contracts: React.FC<ContractsProps> = ({ tenants, payments, onAddTenant, onUpdateTenant, onDeleteTenant }) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [mode, setMode] = useState<'VIEW' | 'EDIT_INFO' | 'ADD'>('VIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [genRent, setGenRent] = useState(true);
  const [genDeposit, setGenDeposit] = useState(true);
  
  const initialFormState: Tenant = {
    id: '', name: '', roomNumber: '', phone: '', email: '', moveInDate: new Date().toISOString().split('T')[0],
    leaseEndDate: '', rentAmount: 0, deposit: 0, idNumber: '', contractContent: '',
  };

  const [formData, setFormData] = useState<Tenant>(initialFormState);
  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || null;

  const tenantPayments = useMemo(() => {
    return payments.filter(p => p.tenantId === selectedTenantId).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [payments, selectedTenantId]);

  useEffect(() => {
    if (mode === 'ADD') {
      setFormData(initialFormState);
    } else if (selectedTenant) {
      setFormData(selectedTenant);
    }
  }, [selectedTenant, mode]);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tenants, searchQuery]);

  const getTenantFinancialStatus = (tenantId: string) => {
    const tP = payments.filter(p => p.tenantId === tenantId);
    if (tP.length === 0) return 'NONE';
    if (tP.some(p => p.status === PaymentStatus.OVERDUE)) return 'OVERDUE';
    if (tP.some(p => p.status === PaymentStatus.PENDING)) return 'PENDING';
    return 'CLEAN';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'ADD') {
      onAddTenant(formData, { genRent, genDeposit });
    } else {
      onUpdateTenant(formData);
    }
    setMode('VIEW');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'rentAmount' || name === 'deposit') ? Number(value) : value }));
  };

  const handleExportTenants = () => {
    const dataToExport = tenants.map(t => ({
      房號: t.roomNumber,
      姓名: t.name,
      電話: t.phone,
      Email: t.email,
      身分證字號: t.idNumber,
      起租日期: t.moveInDate,
      租期屆滿: t.leaseEndDate,
      租金: t.rentAmount,
      押金: t.deposit,
      特別約定: t.contractContent
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tenants");
    XLSX.writeFile(wb, "Tenant_List.xlsx");
  };

  // 生成公版合約文字
  const renderContractText = (data: Tenant) => {
    const name = data.name || '________';
    const idNumber = data.idNumber || '________________';
    const room = data.roomNumber || '____';
    const rent = data.rentAmount ? data.rentAmount.toLocaleString() : '________';
    const deposit = data.deposit ? data.deposit.toLocaleString() : '________';
    const startDate = data.moveInDate || '    年    月    日';
    const endDate = data.leaseEndDate || '    年    月    日';

    return `住宅租賃契約書 (內政部範本參考)

第一條：租賃標的
    房屋所在地：本物業 ${room} 室。
    
第二條：租賃期間
    自 ${startDate} 起至 ${endDate} 止。

第三條：租金約定及支付
    每月租金為新臺幣 ${rent} 元整。
    承租人應於每月____日前支付租金，不得藉詞拖延。

第四條：押金約定及返還
    押金為新臺幣 ${deposit} 元整（最高不得超過二個月租金之總額）。
    承租人於租賃期滿交還房屋並扣除欠稅費後，由出租人無息返還。

第五條：當事人資訊
    承租人：${name}
    身分證字號：${idNumber}
    聯絡電話：${data.phone || '________________'}

第六條：特別約定事項
    ${data.contractContent || '（無特別約定事項）'}

第七條：返還義務
    租賃期滿，承租人應將租賃物遷空交還出租人。

--- 出租人（簽章）：________________    承租人（簽章）：________________`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600">
                <ScrollText size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-stone-800 tracking-tight">合約與租客管理</h2>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Official Contract Engine</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleExportTenants} className="flex items-center gap-2 px-5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-bold transition-all shadow-sm">
                <FileSpreadsheet size={14} /> 匯出名單
            </button>
            <button onClick={() => { setMode('ADD'); setSelectedTenantId(null); }} className="flex items-center gap-2 px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-xl active:scale-95">
                <Plus size={14} /> 新增租客
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="lg:w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={12} />
              <input type="text" placeholder="搜尋租客、房號..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-stone-50">
            {filteredTenants.length > 0 ? filteredTenants.map(t => {
              const finStatus = getTenantFinancialStatus(t.id);
              return (
                <div key={t.id} onClick={() => { setSelectedTenantId(t.id); setMode('VIEW'); }} className={`p-4 cursor-pointer hover:bg-amber-50/40 transition-all border-l-4 ${selectedTenantId === t.id ? 'bg-amber-50 border-amber-500 shadow-sm' : 'border-transparent'}`}>
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${finStatus === 'OVERDUE' ? 'bg-rose-500' : finStatus === 'PENDING' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        <p className={`font-bold text-sm ${selectedTenantId === t.id ? 'text-amber-900' : 'text-stone-700'}`}>{t.name}</p>
                      </div>
                      <ChevronRight size={14} className={selectedTenantId === t.id ? 'text-amber-600' : 'text-stone-200'} />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-stone-400 font-bold ml-4 uppercase">{t.roomNumber} 室</p>
                    <p className="text-[9px] font-medium text-stone-300 italic">{t.moveInDate.split('-')[0]} 年度</p>
                  </div>
                </div>
              );
            }) : (
                <div className="p-8 text-center flex flex-col items-center">
                    <Users size={32} className="text-stone-200 mb-2" />
                    <p className="text-xs text-stone-400 font-medium">尚無租客資料</p>
                </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl flex flex-col overflow-hidden border border-stone-200 shadow-sm">
          {(selectedTenantId || mode === 'ADD') ? (
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
              {(mode === 'EDIT_INFO' || mode === 'ADD') && (
                <div className="w-full md:w-80 bg-stone-50 border-r border-stone-200 flex flex-col p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-stone-800">{mode === 'ADD' ? '填寫租賃資訊' : '編輯租客資料'}</h4>
                        <button onClick={() => setMode('VIEW')} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">租客全名</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500" placeholder="王小明" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">手機電話</label>
                            <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500" placeholder="09xx-xxx-xxx" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">房號</label>
                                <input name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500" placeholder="A101" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">身分證字號</label>
                                <input name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500" placeholder="A123456789" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">月租金</label>
                                <input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none font-bold text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">押金金額</label>
                                <input type="number" name="deposit" value={formData.deposit} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">起租日期</label>
                                <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">租期屆滿</label>
                                <input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter ml-1">特別約定 (禁菸/寵物/報稅等)</label>
                            <textarea name="contractContent" value={formData.contractContent} onChange={handleInputChange} className="w-full p-2.5 text-xs border border-stone-200 rounded-lg outline-none h-20 resize-none" placeholder="1. 禁養寵物 2. 全面禁菸..." />
                        </div>

                        {mode === 'ADD' && (
                          <div className="pt-4 border-t border-stone-200 space-y-2.5">
                            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5 uppercase tracking-wide"><Zap size={12}/> 智慧產帳連動功能</p>
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-all border border-transparent hover:border-amber-100">
                              <input type="checkbox" checked={genRent} onChange={(e) => setGenRent(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4" />
                              <span className="text-[11px] font-medium text-stone-600">自動建立第一個月租金帳單</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-all border border-transparent hover:border-amber-100">
                              <input type="checkbox" checked={genDeposit} onChange={(e) => setGenDeposit(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4" />
                              <span className="text-[11px] font-medium text-stone-600">自動建立押金收款紀錄</span>
                            </label>
                          </div>
                        )}
                    </div>
                    <button onClick={handleSave} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg text-xs shadow-md mt-auto transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <Save size={16} /> {mode === 'ADD' ? '確認新增並同步財務' : '更新租約資料'}
                    </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 bg-stone-50/50 flex flex-col items-center custom-scrollbar">
                {mode === 'VIEW' && selectedTenant && (
                  <div className="w-full max-w-2xl space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                             <h2 className="text-3xl font-black text-stone-800 tracking-tight">{selectedTenant.name}</h2>
                             <span className="px-2 py-0.5 bg-stone-100 text-stone-400 rounded text-[9px] font-black uppercase">Active</span>
                        </div>
                        <p className="text-stone-400 text-sm font-medium flex items-center gap-2">
                            <Home size={14} className="text-amber-500" /> {selectedTenant.roomNumber} 號室 • 租約執行中
                        </p>
                      </div>
                      <div className="flex gap-2.5">
                        <button onClick={() => setMode('EDIT_INFO')} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-600 hover:bg-stone-50 hover:border-amber-200 transition-all shadow-sm">
                            <Edit size={14} /> 編輯合約
                        </button>
                        <button onClick={() => { if(window.confirm('確定要刪除這位租客？相關帳務將一併清除。')) onDeleteTenant(selectedTenant.id); }} className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-100 transition-all shadow-sm">
                            <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>

                    {/* Financial Quick View */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-5 border border-stone-100 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">最近一筆帳單</p>
                                {tenantPayments.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-black text-stone-800">${tenantPayments[0].amount.toLocaleString()}</p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tenantPayments[0].status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {tenantPayments[0].status}
                                        </span>
                                    </div>
                                ) : <p className="text-sm font-bold text-stone-300 italic">尚無數據</p>}
                            </div>
                            <div className="p-3 bg-amber-50 rounded-full text-amber-500">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-stone-100 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">租約剩餘天數</p>
                                <p className="text-lg font-black text-stone-800">
                                    {selectedTenant.leaseEndDate ? Math.max(0, Math.ceil((new Date(selectedTenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '---'} <span className="text-xs text-stone-400 font-bold">Days</span>
                                </p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-full text-stone-400">
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Paper Contract Component */}
                    <div className="w-full bg-[#fdfcf8] rounded-md p-12 font-serif text-stone-900 leading-[1.8] text-base border border-stone-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                       <div className="absolute top-0 left-0 w-full h-1 bg-amber-600/20"></div>
                       <div className="flex justify-between items-center mb-10 border-b-2 border-stone-900 pb-4">
                          <h1 className="text-2xl font-black tracking-[0.3em] uppercase">住宅租賃契約書</h1>
                          <Printer size={18} className="text-stone-300 hover:text-stone-900 cursor-pointer transition-colors" />
                       </div>
                       
                       <div className="space-y-8 tracking-tight">
                           <pre className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-stone-800">
                                {renderContractText(selectedTenant)}
                           </pre>
                       </div>
                       
                       <div className="mt-16 pt-8 border-t border-stone-100 flex justify-between items-center opacity-40">
                          <div className="text-[10px] font-bold tracking-widest">LANDLORD OFFICE INTERNAL USE ONLY</div>
                          <div className="text-[10px] font-bold">PAGE 01 / 01</div>
                       </div>
                    </div>
                  </div>
                )}
                
                {mode === 'ADD' && (
                  <div className="w-full max-w-2xl text-center space-y-4">
                     <div className="bg-amber-50 p-6 rounded-full inline-block mb-4">
                        <FileText size={48} className="text-amber-200" />
                     </div>
                     <h3 className="text-2xl font-black text-stone-800">建立新租約</h3>
                     <p className="text-stone-400 max-w-sm mx-auto text-sm leading-relaxed">請在左側面板填寫承租人基本資訊，系統將自動生成標準住宅租賃契約預覽。</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-stone-50/20">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-amber-50 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Users size={48} className="text-stone-200 relative" />
              </div>
              <h3 className="text-lg font-bold text-stone-700 tracking-tight">選取租客以檢視合約詳情</h3>
              <p className="text-xs text-stone-400 mt-2 font-medium">您可以進行租約檢視、編輯、以及確認租客的繳費狀態連動。</p>
              <button onClick={() => setMode('ADD')} className="mt-8 px-6 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all shadow-sm">
                快速新增首位租客
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contracts;
