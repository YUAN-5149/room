import React, { useState, useEffect } from 'react';
import { MaintenanceTicket, FilterSchedule, MaintenanceStatus, Priority, Tenant } from '../types';
import { Wrench, CheckCircle, AlertTriangle, Plus, Edit, Trash2, X, Save, RefreshCw, Calendar, User, ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MaintenanceProps {
  tickets: MaintenanceTicket[];
  filters: FilterSchedule[];
  tenants: Tenant[];
  onUpdateTicketStatus: (id: string, status: MaintenanceStatus) => void;
  onAddTicket: (ticket: MaintenanceTicket) => void;
  onUpdateTicket: (ticket: MaintenanceTicket) => void;
  onDeleteTicket: (id: string) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ 
  tickets, 
  filters: initialFilters, 
  tenants,
  onUpdateTicketStatus,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket
}) => {
  const [activeTab, setActiveTab] = useState<'REPAIR' | 'FILTER'>('REPAIR');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  
  const [localFilters, setLocalFilters] = useState<FilterSchedule[]>(initialFilters);

  // Form State for Repairs
  const initialFormState: Partial<MaintenanceTicket> = {
    description: '',
    reportDate: new Date().toISOString().split('T')[0],
    status: MaintenanceStatus.OPEN,
    priority: Priority.MEDIUM,
    category: 'Appliance',
    cost: 0,
    notes: '',
    tenantId: ''
  };
  const [formData, setFormData] = useState<Partial<MaintenanceTicket>>(initialFormState);

  const exportReport = () => {
    const data = activeTab === 'REPAIR' ? tickets : localFilters;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'REPAIR' ? "Repairs" : "Filters");
    XLSX.writeFile(wb, "Maintenance_Report.xlsx");
  };

  // Helper: Calculate status based on nextDue date
  const calculateStatus = (nextDue: string): 'Good' | 'Due Soon' | 'Overdue' => {
    const today = new Date();
    const dueDate = new Date(nextDue);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 30) return 'Due Soon';
    return 'Good';
  };

  const addMonths = (dateStr: string, months: number): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (id: string, newDate: string) => {
    setLocalFilters(prev => prev.map(f => {
      if (f.id === id) {
        const nextDue = addMonths(newDate, f.cycleMonths);
        return {
          ...f,
          lastReplaced: newDate,
          nextDue: nextDue,
          status: calculateStatus(nextDue)
        };
      }
      return f;
    }));
  };

  const handleMarkReplaced = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    handleDateChange(id, today);
  };

  const getModelBgColor = (model: string) => {
    switch (model) {
      case 'UF-591': return 'bg-blue-100/70';
      case 'UF-592': return 'bg-green-100/70';
      case 'UF-504': return 'bg-sky-50';
      case 'UF-28': return 'bg-yellow-100/70';
      case 'UF-515': return 'bg-orange-100/70';
      default: return 'bg-white';
    }
  };

  const handleOpenAddModal = () => {
    setEditingTicketId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ticket: MaintenanceTicket) => {
    setEditingTicketId(ticket.id);
    setFormData(ticket);
    setIsModalOpen(true);
  };

  const handleInlinePriorityUpdate = (id: string, priority: Priority) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        onUpdateTicket({ ...ticket, priority });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTenant = tenants.find(t => t.id === formData.tenantId);
    const tenantName = selectedTenant ? selectedTenant.name : (formData.tenantName || '未知租客');

    const ticketData = {
        ...formData,
        tenantName,
        id: editingTicketId || `mt-${Date.now()}`,
        status: formData.status || MaintenanceStatus.OPEN,
        priority: formData.priority || Priority.MEDIUM,
        category: formData.category || 'Other',
    } as MaintenanceTicket;

    if (editingTicketId) {
        onUpdateTicket(ticketData);
    } else {
        onAddTicket(ticketData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('確定要刪除此維修紀錄嗎？')) {
          onDeleteTicket(id);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: name === 'cost' ? Number(value) : value
    }));
  };

  const getStatusStyle = (status: MaintenanceStatus) => {
    switch (status) {
        case MaintenanceStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case MaintenanceStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
        case Priority.HIGH: return 'text-rose-600 font-bold';
        case Priority.MEDIUM: return 'text-amber-600 font-bold';
        default: return 'text-emerald-600 font-bold';
    }
  };

  const translateCategory = (cat: string) => {
    const mapping: Record<string, string> = {
        'Appliance': '家電',
        'Plumbing': '水電管路',
        'Electrical': '電力系統',
        'Filter': '濾心耗材',
        'Other': '其他'
    };
    return mapping[cat] || cat;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b-2 border-orange-100">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-stone-800">維修管理</h2>
          <div className="flex bg-orange-50 rounded-lg p-1">
             <button 
                onClick={() => setActiveTab('REPAIR')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'REPAIR' ? 'bg-white shadow text-amber-700' : 'text-stone-500 hover:text-stone-700'}`}
             >
                租客報修
             </button>
             <button 
                onClick={() => setActiveTab('FILTER')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'FILTER' ? 'bg-white shadow text-amber-700' : 'text-stone-500 hover:text-stone-700'}`}
             >
                飲水機濾心
             </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
            {activeTab === 'REPAIR' && (
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm transition shadow-sm"
                >
                    <Plus size={16} /> 新增報修
                </button>
            )}
            <button 
            onClick={exportReport}
            className="flex items-center gap-2 bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-md text-sm transition"
            >
            匯出紀錄 (Excel)
            </button>
        </div>
      </div>

      {activeTab === 'REPAIR' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-orange-100">
             <thead className="bg-stone-100">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">日期 / 類別</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">租客</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">問題描述</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">優先級 (可改)</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">費用</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">處理狀態 (可改)</th>
                 <th className="px-6 py-3 text-right text-xs font-bold text-stone-600 uppercase tracking-wider">操作</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-stone-100">
               {tickets.map(ticket => (
                 <tr key={ticket.id} className="hover:bg-orange-50/30 transition duration-150">
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-stone-900">{ticket.reportDate}</div>
                     <div className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded inline-block mt-1 font-bold">
                        {translateCategory(ticket.category)}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold">
                            {ticket.tenantName.charAt(0)}
                        </div>
                        <span className="text-sm text-stone-700 font-medium">{ticket.tenantName}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <p className="text-sm text-stone-800 line-clamp-1 max-w-xs" title={ticket.description}>
                        {ticket.description}
                     </p>
                     {ticket.notes && <p className="text-[10px] text-stone-400 mt-0.5 italic">附註: {ticket.notes}</p>}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={ticket.priority}
                        onChange={(e) => handleInlinePriorityUpdate(ticket.id, e.target.value as Priority)}
                        className={`text-xs bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-6 ${getPriorityStyle(ticket.priority)}`}
                      >
                        <option value={Priority.LOW}>低級</option>
                        <option value={Priority.MEDIUM}>普通</option>
                        <option value={Priority.HIGH}>緊急</option>
                      </select>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-700 font-semibold">
                      ${(ticket.cost || 0).toLocaleString()}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={ticket.status}
                        onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as MaintenanceStatus)}
                        className={`text-xs font-bold py-1 px-3 rounded-full border cursor-pointer outline-none transition appearance-none shadow-sm ${getStatusStyle(ticket.status)}`}
                      >
                        <option value={MaintenanceStatus.OPEN}>待處理</option>
                        <option value={MaintenanceStatus.IN_PROGRESS}>維修中</option>
                        <option value={MaintenanceStatus.COMPLETED}>已完成</option>
                      </select>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => handleOpenEditModal(ticket)}
                            className="text-stone-400 hover:text-amber-600 transition p-1.5 rounded-full hover:bg-amber-50"
                            title="完整編輯"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(ticket.id)}
                            className="text-stone-400 hover:text-rose-600 transition p-1.5 rounded-full hover:bg-rose-50"
                            title="刪除"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                   </td>
                 </tr>
               ))}
               {tickets.length === 0 && (
                   <tr>
                       <td colSpan={7} className="px-6 py-12 text-center text-stone-400 italic">
                           目前沒有報修紀錄。
                       </td>
                   </tr>
               )}
             </tbody>
          </table>
          <div className="p-4 bg-stone-50 flex items-center gap-2 text-[11px] text-stone-500">
            <ClipboardList size={12} className="text-amber-500" />
            <span>提示：您可以直接在表格中點擊「優先級」或「處理狀態」進行快速標記更動。</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-orange-100">
             <thead className="bg-stone-100">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">型號 / 規格</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">更換週期</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">上次更換 (可編輯)</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">預計到期</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">狀態</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">操作</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-stone-100">
               {localFilters.map(filter => (
                 <tr key={filter.id} className={`${getModelBgColor(filter.model)} transition duration-200`}>
                   <td className="px-6 py-4">
                     <div className="text-sm font-bold text-stone-800">{filter.model}</div>
                     <div className="text-xs text-stone-500">{filter.specification}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-500">
                     每 {filter.cycleMonths} 個月
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center gap-2">
                        <input 
                          type="date"
                          value={filter.lastReplaced}
                          onChange={(e) => handleDateChange(filter.id, e.target.value)}
                          className="text-sm bg-transparent border-b border-dashed border-stone-400 hover:border-amber-500 focus:border-amber-600 focus:ring-0 outline-none px-1 py-0.5 text-stone-700 transition"
                        />
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-700">{filter.nextDue}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm
                        ${filter.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 
                          filter.status === 'Due Soon' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'}`}>
                        {filter.status === 'Overdue' ? '已過期' : filter.status === 'Due Soon' ? '即將到期' : '良好'}
                      </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleMarkReplaced(filter.id)}
                        className="flex items-center gap-1 text-xs bg-white/80 text-stone-700 px-3 py-1.5 rounded-md border border-stone-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all font-bold shadow-sm"
                        title="標記為今日更換"
                      >
                        <RefreshCw size={12} /> 一鍵更新
                      </button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          <div className="p-4 bg-stone-50 flex items-center gap-2 text-[11px] text-stone-500">
            <Calendar size={12} className="text-amber-500" />
            <span>提醒：預計到期日前 1 個月將自動轉為「即將到期」狀態。修改「上次更換日期」將自動連動計算。</span>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Repair Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-orange-50">
                    <h3 className="text-lg font-bold text-stone-800">
                        {editingTicketId ? '編輯維修紀錄' : '新增維修紀錄'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-stone-700">報修租客</label>
                            <select 
                                name="tenantId" 
                                value={formData.tenantId} 
                                onChange={handleInputChange}
                                className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                required
                            >
                                <option value="" disabled>請選擇租客</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.roomNumber})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-stone-700">報修日期</label>
                            <input 
                                type="date"
                                name="reportDate" 
                                value={formData.reportDate} 
                                onChange={handleInputChange}
                                className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-stone-700">問題類別</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleInputChange}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            <option value="Appliance">家電 (Appliance)</option>
                            <option value="Plumbing">水電管路 (Plumbing)</option>
                            <option value="Electrical">電力系統 (Electrical)</option>
                            <option value="Filter">濾心/耗材 (Filter)</option>
                            <option value="Other">其他 (Other)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-stone-700">問題描述</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange}
                            placeholder="請簡述維修狀況..."
                            className="w-full p-2 border border-stone-300 rounded text-sm h-24 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-sm font-semibold text-stone-700">優先等級</label>
                            <select 
                                name="priority" 
                                value={formData.priority} 
                                onChange={handleInputChange}
                                className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                                <option value={Priority.LOW}>低 (Low)</option>
                                <option value={Priority.MEDIUM}>中 (Medium)</option>
                                <option value={Priority.HIGH}>高 (High)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-stone-700">目前狀態</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleInputChange}
                                className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                                <option value={MaintenanceStatus.OPEN}>處理中</option>
                                <option value={MaintenanceStatus.IN_PROGRESS}>維修中</option>
                                <option value={MaintenanceStatus.COMPLETED}>已完成</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-stone-700">維修費用 (TWD)</label>
                        <input 
                            type="number"
                            name="cost" 
                            value={formData.cost} 
                            onChange={handleInputChange}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="0"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-sm font-semibold text-stone-700">備註</label>
                        <input 
                            name="notes" 
                            value={formData.notes || ''} 
                            onChange={handleInputChange}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="處理細節或備註..."
                        />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-stone-100 mt-2">
                        {editingTicketId ? (
                             <button 
                                type="button"
                                onClick={() => handleDelete(editingTicketId)}
                                className="text-rose-600 hover:text-rose-700 text-sm font-semibold flex items-center gap-1"
                            >
                                <Trash2 size={16} /> 刪除紀錄
                            </button>
                        ) : <div></div>}
                       
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm text-stone-600 bg-stone-100 rounded hover:bg-stone-200 transition"
                            >
                                取消
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 text-sm text-white bg-amber-600 rounded hover:bg-amber-700 transition flex items-center gap-2 shadow-sm"
                            >
                                <Save size={16} /> 儲存
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;