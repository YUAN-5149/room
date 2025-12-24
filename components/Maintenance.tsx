import React, { useState } from 'react';
import { MaintenanceTicket, FilterSchedule, MaintenanceStatus, Priority } from '../types';
import { Wrench, Droplet, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MaintenanceProps {
  tickets: MaintenanceTicket[];
  filters: FilterSchedule[];
  onUpdateTicketStatus: (id: string, status: MaintenanceStatus) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ tickets, filters, onUpdateTicketStatus }) => {
  const [activeTab, setActiveTab] = useState<'REPAIR' | 'FILTER'>('REPAIR');

  const exportReport = () => {
    const data = activeTab === 'REPAIR' ? tickets : filters;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'REPAIR' ? "Repairs" : "Filters");
    XLSX.writeFile(wb, "Maintenance_Report.xlsx");
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
        <button 
          onClick={exportReport}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-md text-sm transition"
        >
          匯出紀錄 (Excel)
        </button>
      </div>

      {activeTab === 'REPAIR' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide
                    ${ticket.priority === Priority.HIGH ? 'bg-rose-100 text-rose-800' : 
                      ticket.priority === Priority.MEDIUM ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-stone-400">{ticket.reportDate}</span>
                </div>
                <h3 className="font-bold text-stone-800 text-lg mb-1">{ticket.category}: {ticket.description}</h3>
                <p className="text-sm text-stone-600 mb-4">回報人: {ticket.tenantName}</p>
                {ticket.notes && (
                  <div className="bg-orange-50 p-2 rounded text-xs text-stone-600 mb-4">
                    備註: {ticket.notes}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between border-t border-orange-100 pt-4">
                <span className={`flex items-center gap-1 text-sm font-medium
                   ${ticket.status === MaintenanceStatus.COMPLETED ? 'text-emerald-600' : 
                     ticket.status === MaintenanceStatus.IN_PROGRESS ? 'text-blue-600' : 'text-stone-500'}`}>
                   {ticket.status === MaintenanceStatus.COMPLETED ? <CheckCircle size={16}/> : 
                    ticket.status === MaintenanceStatus.IN_PROGRESS ? <Wrench size={16}/> : <AlertTriangle size={16}/>}
                   {ticket.status}
                </span>
                
                {ticket.status !== MaintenanceStatus.COMPLETED && (
                  <select 
                    className="text-xs border border-stone-200 rounded p-1 bg-white text-stone-700"
                    value={ticket.status}
                    onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as MaintenanceStatus)}
                  >
                    <option value={MaintenanceStatus.OPEN}>處理中</option>
                    <option value={MaintenanceStatus.IN_PROGRESS}>維修中</option>
                    <option value={MaintenanceStatus.COMPLETED}>已完成</option>
                  </select>
                )}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default Maintenance;