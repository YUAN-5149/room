import React, { useState, useEffect, useMemo } from 'react';
import { Tenant, PaymentRecord, PaymentStatus } from '../types';
import { FileText, Download, Edit, Plus, Trash2, User, Save, X, Info, Printer, CheckSquare, Square, ChevronRight, Search, Users, Mail, Phone, Calendar, Zap } from 'lucide-react';

// 擴充合約細項介面
interface ContractSettings {
  mgmtBy: 'landlord' | 'tenant';
  waterBy: 'landlord' | 'tenant';
  elecBy: 'landlord' | 'tenant';
  gasBy: 'landlord' | 'tenant';
  internetBy: 'landlord' | 'tenant';
  terminateAllowed: boolean;
  notarization: boolean;
  parking: 'none' | 'car' | 'moto' | 'both';
  subletAllowed: boolean;
  renovationAllowed: boolean;
}

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
  
  // 自動化產生帳單的狀態 (修正：預設只產生租金帳單，避免重複登打問題)
  const [genRent, setGenRent] = useState(true);
  const [genDeposit, setGenDeposit] = useState(false); // 修正為預設 false
  
  const defaultSettings: ContractSettings = {
    mgmtBy: 'landlord',
    waterBy: 'tenant',
    elecBy: 'tenant',
    gasBy: 'tenant',
    internetBy: 'landlord',
    terminateAllowed: true,
    notarization: false,
    parking: 'none',
    subletAllowed: false,
    renovationAllowed: false,
  };

  const initialFormState: Tenant & { settings: ContractSettings } = {
    id: '',
    name: '',
    roomNumber: '',
    phone: '',
    email: '',
    moveInDate: new Date().toISOString().split('T')[0],
    leaseEndDate: '',
    rentAmount: 0,
    deposit: 0,
    idNumber: '',
    contractContent: '',
    settings: defaultSettings,
  };

  const [formData, setFormData] = useState<Tenant & { settings: ContractSettings }>(initialFormState);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || null;

  useEffect(() => {
    if (mode === 'ADD') {
      setFormData(initialFormState);
      setGenRent(true);
      setGenDeposit(false); // 重置為關閉
    } else if (selectedTenant) {
      setFormData({
        ...selectedTenant,
        settings: (selectedTenant as any).settings || defaultSettings
      });
    }
  }, [selectedTenant, mode]);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  const getTenantFinancialStatus = (tenantId: string) => {
    const tenantPayments = payments.filter(p => p.tenantId === tenantId);
    if (tenantPayments.length === 0) return 'NONE';
    const hasOverdue = tenantPayments.some(p => p.status === PaymentStatus.OVERDUE);
    if (hasOverdue) return 'OVERDUE';
    const hasPending = tenantPayments.some(p => p.status === PaymentStatus.PENDING);
    if (hasPending) return 'PENDING';
    return 'CLEAN';
  };

  const check = (condition: boolean) => condition ? '☑' : '□';

  const getFullContractText = (data: typeof formData) => {
    const today = new Date();
    const year = today.getFullYear() - 1911;
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const s = data.settings;

    return `內政部113年7月8日內政部台內地字第11302639334號函修正

住宅租賃契約書

契約審閱權
本契約於中華民國 ${year} 年 ${month} 月 ${day} 日經承租人攜回審閱____日（契約審閱期間至少三日）
承租人簽章：________________
出租人簽章：________________
 
立契約書人：
承租人：${data.name || '________'}
出租人：________ 【為 ${check(true)}所有權人 ${check(false)}轉租人】
茲為住宅租賃事宜，雙方同意本契約條款如下：

第一條 租賃標的
(一)租賃住宅標示：
1、門牌：${data.roomNumber || '________'}
2、車位：${check(s.parking !== 'none')}有（汽車停車位${s.parking === 'car' || s.parking === 'both' ? ' 1 ' : '__'}個、機車停車位${s.parking === 'moto' || s.parking === 'both' ? ' 1 ' : '__'}個）${check(s.parking === 'none')}無。

第二條 租賃期間
租賃期間自民國 ${data.moveInDate || '    年  月  日'} 起至民國 ${data.leaseEndDate || '    年  月  日'} 止。

第三條 租金約定及支付
承租人每月租金為新臺幣 ${data.rentAmount.toLocaleString()} 元整，並於每月____日前支付。出租人於租賃期間亦不得藉任何理由要求調漲租金。

第四條 押金約定及返還
押金由租賃雙方約定為____個月租金，金額為 ${data.deposit.toLocaleString()} 元整(最高不得超過二個月租金之總額)。

第五條 租賃期間相關費用之約定
(一)管理費：${check(s.mgmtBy === 'landlord')}由出租人負擔 ${check(s.mgmtBy === 'tenant')}由承租人負擔。
(二)水費：${check(s.waterBy === 'landlord')}由出租人負擔 ${check(s.waterBy === 'tenant')}由承租人負擔。
(三)電費：${check(s.elecBy === 'landlord')}由出租人負擔 ${check(s.elecBy === 'tenant')}由承租人負擔。每期依電費單之「當期每度平均電價」計收。
(四)瓦斯費：${check(s.gasBy === 'landlord')}由出租人負擔 ${check(s.gasBy === 'tenant')}由承租人負擔。
(五)網路費：${check(s.internetBy === 'landlord')}由出租人負擔 ${check(s.internetBy === 'tenant')}由承租人負擔。

第六條 稅費負擔之約定
本契約租賃住宅之房屋稅、地價稅由出租人負擔。

第七條 使用租賃住宅之限制
本租賃住宅係供居住使用，承租人不得變更用途。
承租人 ${check(s.subletAllowed)}得 ${check(!s.subletAllowed)}不得 將本租賃住宅之全部或一部分轉租、出借。

第八條 修繕
租賃住宅或附屬設備損壞時，除另有約定外，應由出租人負責修繕。

第九條 室內裝修
承租人 ${check(s.renovationAllowed)}得 ${check(!s.renovationAllowed)}不得 進行室內裝修。

第十條 出租人之義務及責任
出租人應出示有權出租本租賃住宅之證明文件及國民身分證。

第十一條 承租人之義務及責任
承租人應於簽訂本契約時，出示國民身分證。

第十二條 租賃住宅部分滅失
因不可歸責於承租人之事由，致租賃住宅之一部滅失者，承租人得請求減少租金。

第十三條 任意終止租約之約定
本契約於期限屆滿前：租賃雙方 ${check(s.terminateAllowed)}得 ${check(!s.terminateAllowed)}不得 任意終止租約。

第十四條 租賃住宅之返還
租賃關係消滅時，承租人應將租賃住宅遷空返還出租人。

第十五條 租賃住宅所有權之讓與
出租人於租賃住宅交付後，承租人占有中，縱將其所有權讓與第三人，本契約對於受讓人仍繼續存在。

第十六條 出租人提前終止租約
承租人如有遲付租金達二個月、擅自變更用途、毀損不修繕等情事，出租人得提前終止租約。

第十七條 承租人提前終止租約
住宅不合居住使用經催告不修繕、或有危及安全健康之瑕疵，承租人得提前終止租約。

第十八條 遺留物之處理
租賃關係消滅後，承租人仍有遺留物者，經催告屆期仍不取回時，視為拋棄其所有權。

第十九條 履行本契約之通知
租賃雙方相互間之通知，應以本契約所記載之地址為準。

第二十條 條款疑義處理
本契約各條款如有疑義時，應為有利於承租人之解釋。

第二十一條 其他約定
本契約租賃雙方 ${check(s.notarization)}同意 ${check(!s.notarization)}不同意 辦理公證。
特別約定事項：
${data.contractContent || '無額外特別約定事項。'}

--------------------------------------------------
【立契約書人簽章】

出租人：____________________________ (簽章)
統一編號：________________
通訊地址：____________________________________
聯絡電話：____________________________________

承租人：${data.name || '____________________________'} (簽章)
統一編號：${data.idNumber || '________________'}
通訊地址：____________________________________
聯絡電話：${data.phone || '________________'}

中 華 民 國 ${year} 年 ${month} 月 ${day} 日
`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'ADD') {
      const newId = `t-${Date.now()}`;
      onAddTenant({ ...formData, id: newId }, { genRent, genDeposit });
      setSelectedTenantId(newId);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'rentAmount' || name === 'deposit') ? Number(value) : value
    }));
  };

  const toggleSetting = (key: keyof ContractSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* 頂部標題 */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
                <FileText className="text-amber-600" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-stone-800">113年版租賃契約管理</h2>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Tenant & Contract Roster System</p>
            </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
            <button 
              onClick={() => { setMode('ADD'); setSelectedTenantId(null); }} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition ${mode === 'ADD' ? 'bg-amber-600 text-white' : 'bg-stone-800 hover:bg-stone-900 text-white'}`}
            >
                <Plus size={16} /> 新增租客資料
            </button>
            <button className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-sm font-bold transition" onClick={() => window.print()}>
                <Printer size={16} /> 列印當前合約
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* 左側名冊 */}
        <div className="lg:w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-stone-600 text-[11px] uppercase tracking-widest">租客名冊 ({tenants.length})</span>
              <Users size={14} className="text-stone-400" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
              <input 
                type="text" 
                placeholder="搜尋姓名或房號..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
            {filteredTenants.length > 0 ? (
              filteredTenants.map(t => {
                const finStatus = getTenantFinancialStatus(t.id);
                return (
                  <div 
                    key={t.id} 
                    onClick={() => { setSelectedTenantId(t.id); setMode('VIEW'); }}
                    className={`p-4 cursor-pointer hover:bg-amber-50/50 transition-all border-l-4 group ${selectedTenantId === t.id ? 'bg-amber-50 border-amber-500' : 'border-transparent'}`}
                  >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {finStatus === 'OVERDUE' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="逾期未繳" />}
                          {finStatus === 'PENDING' && <div className="w-2 h-2 rounded-full bg-amber-400" title="待繳中" />}
                          {finStatus === 'CLEAN' && <div className="w-2 h-2 rounded-full bg-emerald-500" title="已結清" />}
                          <p className={`font-bold text-sm ${selectedTenantId === t.id ? 'text-amber-800' : 'text-stone-700'}`}>{t.name}</p>
                        </div>
                        <ChevronRight size={14} className={`transition-transform ${selectedTenantId === t.id ? 'text-amber-500 translate-x-1' : 'text-stone-300 opacity-0 group-hover:opacity-100'}`} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] text-stone-400 font-medium ml-4">{t.roomNumber}</p>
                      <p className="text-[9px] text-stone-300 font-mono">{t.phone.slice(-4)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-stone-400">
                <Search size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">找不到匹配的租客</p>
              </div>
            )}
          </div>
        </div>

        {/* 右側主區域 */}
        <div className="flex-1 bg-stone-100 rounded-xl flex flex-col overflow-hidden border border-stone-200 shadow-inner">
          {(selectedTenantId || mode === 'ADD') ? (
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
              
              {(mode === 'EDIT_INFO' || mode === 'ADD') && (
                <div className="w-full md:w-[420px] bg-white border-r border-stone-200 flex flex-col overflow-hidden shadow-xl z-10">
                    <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Edit size={16} className="text-amber-600" />
                          <span className="font-bold text-stone-700">{mode === 'ADD' ? '建立新租客資料' : '修改租客與合約資訊'}</span>
                        </div>
                        <button onClick={() => setMode('VIEW')} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                              <User size={12}/> 基本資料管理
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1">姓名</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="租客全名" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1">房號</label>
                                    <input name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="例如: B-302" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1 flex items-center gap-1"><Phone size={10}/> 聯絡電話</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="09xx-xxx-xxx" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1 flex items-center gap-1"><Mail size={10}/> 電子郵件</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="example@mail.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1 flex items-center gap-1"><Calendar size={10}/> 起租日期</label>
                                    <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1 flex items-center gap-1"><Calendar size={10}/> 結束日期</label>
                                    <input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                              財務連動設定
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1">每月租金</label>
                                    <input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-stone-400 ml-1">押金總額</label>
                                    <input type="number" name="deposit" value={formData.deposit} onChange={handleInputChange} className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                            </div>

                            {/* 自動化帳單開關 */}
                            {mode === 'ADD' && (
                              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Zap size={14} className="text-amber-600" />
                                  <span className="text-[11px] font-black text-amber-800 uppercase">智慧帳單自動化</span>
                                </div>
                                <label className="flex items-center justify-between cursor-pointer group">
                                  <span className="text-xs font-bold text-stone-600 group-hover:text-stone-800 transition">自動產生首月租金帳單</span>
                                  <input type="checkbox" checked={genRent} onChange={(e) => setGenRent(e.target.checked)} className="sr-only peer" />
                                  <div className="relative w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                                <label className="flex items-center justify-between cursor-pointer group">
                                  <span className="text-xs font-bold text-stone-600 group-hover:text-stone-800 transition">自動產生押金帳單</span>
                                  <input type="checkbox" checked={genDeposit} onChange={(e) => setGenDeposit(e.target.checked)} className="sr-only peer" />
                                  <div className="relative w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                                <p className="text-[9px] text-stone-400 italic">提示：若租客已付清押金，建議關閉押金自動產生。</p>
                              </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">合約條款細節</h4>
                            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-stone-600">管理費負擔者</span>
                                    <div className="flex bg-white rounded border border-stone-300 overflow-hidden">
                                        <button onClick={() => toggleSetting('mgmtBy', 'landlord')} className={`px-3 py-1 text-[10px] font-bold ${formData.settings.mgmtBy === 'landlord' ? 'bg-amber-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>房東</button>
                                        <button onClick={() => toggleSetting('mgmtBy', 'tenant')} className={`px-3 py-1 text-[10px] font-bold ${formData.settings.mgmtBy === 'tenant' ? 'bg-amber-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>租客</button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-400 ml-1">特別約定 (第21條)</label>
                                <textarea name="contractContent" value={formData.contractContent || ''} onChange={handleInputChange} className="w-full p-3 text-xs border border-stone-200 rounded-lg h-24 focus:ring-2 focus:ring-amber-500 outline-none resize-none" placeholder="例如：全面禁菸、禁止轉租..." />
                            </div>
                        </section>
                    </div>
                    <div className="p-4 border-t border-stone-200 bg-stone-50 flex gap-2">
                        <button onClick={handleSave} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg shadow-md transition flex items-center justify-center gap-2">
                            <Save size={16} /> {mode === 'ADD' ? '確認新增租客' : '儲存變更'}
                        </button>
                    </div>
                </div>
              )}

              {/* 預覽區 */}
              <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col items-center bg-stone-200/50 relative">
                {mode === 'VIEW' && (
                  <div className="mb-6 flex gap-4 w-full max-w-[800px] print:hidden">
                    <button onClick={() => setMode('EDIT_INFO')} className="flex-1 bg-white border border-stone-300 p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Edit size={20}/></div>
                            <div className="text-left">
                                <p className="font-bold text-stone-800">修改此租客資料</p>
                                <p className="text-[10px] text-stone-400">變更金額、日期或合約條款</p>
                            </div>
                        </div>
                        <ChevronRight className="text-stone-300 group-hover:text-amber-500 transition-colors" />
                    </button>
                    <button onClick={handleDelete} className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm hover:bg-rose-50 hover:border-rose-200 transition text-rose-600 flex items-center gap-3 group px-6">
                        <Trash2 size={22} className="group-hover:scale-110 transition-transform"/>
                        <div className="text-left">
                           <p className="font-bold text-xs">刪除名單</p>
                           <p className="text-[9px] text-rose-300 uppercase font-black">Delete</p>
                        </div>
                    </button>
                  </div>
                )}

                <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-sm border border-stone-300 min-h-[1100px] p-16 md:p-24 font-serif text-stone-900 leading-relaxed text-[13px] print:shadow-none print:border-none print:p-0 relative overflow-hidden">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none -rotate-12 text-center">
                       <h1 className="text-[120px] font-black border-8 border-stone-900 px-10 py-5">智慧房東管理</h1>
                   </div>
                   <div className="relative z-10">
                       <header className="mb-12 border-b-4 border-stone-900 pb-6 flex justify-between items-end">
                          <div>
                            <h1 className="text-3xl font-black tracking-[0.2em] mb-2">住宅租賃契約書</h1>
                            <p className="text-[11px] font-bold text-stone-500 italic">內政部 113.07.08 最新修正版本範本</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-stone-400 italic">ID: {formData.id || 'NEW'} | Room: {formData.roomNumber || '---'}</p>
                          </div>
                       </header>
                       <div className="space-y-4">
                           <pre className="whitespace-pre-wrap font-serif tracking-normal text-justify leading-loose">
                               {getFullContractText(formData)}
                           </pre>
                       </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-300 p-10 text-center">
              <div className="bg-white p-12 rounded-full shadow-inner border border-stone-200 mb-6 relative group">
                <Users size={80} className="opacity-10 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus className="text-amber-500" size={40} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-stone-500">點選左側名冊以管理租客</h3>
              <p className="text-sm text-stone-400 mt-3 max-w-sm mx-auto leading-relaxed">
                預設名單（陳小明等）皆可隨時修改或刪除。<br/>您可以選擇在新增租客時，是否要自動產出帳單。
              </p>
              <button 
                onClick={() => { setMode('ADD'); setSelectedTenantId(null); }}
                className="mt-8 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1"
              >
                新增租客資料
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contracts;