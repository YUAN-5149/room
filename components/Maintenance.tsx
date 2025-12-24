import React, { useState } from 'react';
import { MaintenanceTicket, FilterSchedule, MaintenanceStatus, Priority, Tenant } from '../types';
import { Wrench, Droplet, CheckCircle, AlertTriangle, Plus, Edit, Trash2, X, Save } from 'lucide-react';
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
  filters, 
  tenants,
  onUpdateTicketStatus,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket
}) => {
  const [activeTab, setActiveTab] = useState<'REPAIR' | 'FILTER'>('REPAIR');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  // Form State
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
    const data = activeTab === 'REPAIR' ? tickets : filters;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'REPAIR' ? "Repairs" : "Filters");
    XLSX.writeFile(wb, "Maintenance_Report.xlsx");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find tenant name if tenantId changed
    const selectedTenant = tenants.find(t => t.id === formData.tenantId);
    const tenantName = selectedTenant ? selectedTenant.name : (formData.tenantName || '未知租客');

    const ticketData = {
        ...formData,
        tenantName,
        // Ensure required fields for type safety
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

  const handleDelete = () => {
      if (editingTicketId && window.confirm('確定要刪除此維修紀錄嗎？')) {
          onDeleteTicket(editingTicketId);
          setIsModalOpen(false);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: name === 'cost' ? Number(value) : value
    }));
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-5 border-l-4 border-l-amber-500 flex flex-col justify-between group relative">
              <button 
                onClick={() => handleOpenEditModal(ticket)}
                className="absolute top-4 right-4 text-stone-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition"
              >
                  <Edit size={16} />
              </button>

              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide
                    ${ticket.priority === Priority.HIGH ? 'bg-rose-100 text-rose-800' : 
                      ticket.priority === Priority.MEDIUM ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-stone-400 mr-6">{ticket.reportDate}</span>
                </div>
                <h3 className="font-bold text-stone-800 text-lg mb-1">{ticket.category}: {ticket.description}</h3>
                <p className="text-sm text-stone-600 mb-4">回報人: {ticket.tenantName}</p>
                {ticket.notes && (
                  <div className="bg-orange-50 p-2 rounded text-xs text-stone-600 mb-4">
                    備註: {ticket.notes}
                  </div>
                )}
                {ticket.cost ? (
                    <p className="text-sm font-semibold text-stone-700">維修費用: ${ticket.cost.toLocaleString()}</p>
                ) : null}
              </div>
              
              <div className="flex items-center justify-between border-t border-orange-100 pt-4 mt-4">
                <span className={`flex items-center gap-1 text-sm font-medium
                   ${ticket.status === MaintenanceStatus.COMPLETED ? 'text-emerald-600' : 
                     ticket.status === MaintenanceStatus.IN_PROGRESS ? 'text-blue-600' : 'text-stone-500'}`}>
                   {ticket.status === MaintenanceStatus.COMPLETED ? <CheckCircle size={16}/> : 
                    ticket.status === MaintenanceStatus.IN_PROGRESS ? <Wrench size={16}/> : <AlertTriangle size={16}/>}
                   {ticket.status}
                </span>
                
                {ticket.status !== MaintenanceStatus.COMPLETED && (
                  <select 
                    className="text-xs border border-stone-200 rounded p-1 bg-white text-stone-700 cursor-pointer"
                    value={ticket.status}
                    onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as MaintenanceStatus)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value={MaintenanceStatus.OPEN}>處理中</option>
                    <option value={MaintenanceStatus.IN_PROGRESS}>維修中</option>
                    <option value={MaintenanceStatus.COMPLETED}>已完成</option>
                  </select>
                )}
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
              <div className="col-span-full p-12 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
                  尚無維修紀錄，請點擊「新增報修」。
              </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-orange-100">
             <thead className="bg-orange-100/50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">位置</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">上次更換</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">下次建議</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">狀態</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-orange-50">
               {filters.map(filter => (
                 <tr key={filter.id}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800 flex items-center gap-2">
                     <Droplet size={16} className="text-amber-400" />
                     {filter.location}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{filter.lastReplaced}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{filter.nextDue}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold 
                        ${filter.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 
                          filter.status === 'Due Soon' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {filter.status === 'Overdue' ? '逾期未換' : filter.status === 'Due Soon' ? '即將到期' : '狀況良好'}
                      </span>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
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
                                onClick={handleDelete}
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