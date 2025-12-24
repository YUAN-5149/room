import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PaymentRecord, PaymentStatus, Tenant } from '../types';
import { FileSpreadsheet, Home } from 'lucide-react';

interface FinancialsProps {
  payments: PaymentRecord[];
  tenants: Tenant[]; // Added tenants prop for synchronization
  onUpdatePayment: (id: string, status: PaymentStatus) => void;
}

const Financials: React.FC<FinancialsProps> = ({ payments, tenants, onUpdatePayment }) => {
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const filteredPayments = payments.filter(p => filter === 'ALL' || p.status === filter);

  // Helper to get tenant info safely
  const getTenantInfo = (tenantId: string) => {
    return tenants.find(t => t.id === tenantId) || { name: '未知租客', roomNumber: '未知' };
  };

  const handleExportExcel = () => {
    const dataToExport = filteredPayments.map(p => {
        const tenant = getTenantInfo(p.tenantId);
        return {
            租客姓名: tenant.name,
            房號: tenant.roomNumber, // Sync Room Number
            金額: p.amount,
            到期日: p.dueDate,
            狀態: p.status,
            類別: p.type
        };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financials");
    XLSX.writeFile(wb, "Rent_Report.xlsx");
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.PAID: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case PaymentStatus.OVERDUE: return 'bg-rose-100 text-rose-800 border-rose-200';
        default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b-2 border-orange-100">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 sm:mb-0">財務管理</h2>
        <div className="flex gap-2">
          <select 
            className="border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-700 bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value as PaymentStatus | 'ALL')}
          >
            <option value="ALL">全部顯示</option>
            <option value={PaymentStatus.PAID}>已繳</option>
            <option value={PaymentStatus.PENDING}>待繳</option>
            <option value={PaymentStatus.OVERDUE}>逾期</option>
          </select>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm transition shadow-sm"
          >
            <FileSpreadsheet size={16} /> 匯出報表
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-orange-100">
          <thead className="bg-orange-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">房號</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">租客</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">金額</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">到期日</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">狀態 (可編輯)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-orange-50">
            {filteredPayments.map((payment) => {
              const tenant = getTenantInfo(payment.tenantId);
              return (
                <tr key={payment.id} className="hover:bg-orange-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-700 flex items-center gap-2">
                    <Home size={16} className="text-amber-400" />
                    {tenant.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800">
                    {tenant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-semibold">
                    ${payment.amount.toLocaleString()} 
                    <span className="text-xs text-stone-400 ml-1 font-normal">({payment.type === 'Rent' ? '租金' : payment.type})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{payment.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                        value={payment.status}
                        onChange={(e) => onUpdatePayment(payment.id, e.target.value as PaymentStatus)}
                        className={`text-sm font-semibold py-1 px-3 rounded-full border cursor-pointer outline-none transition appearance-none ${getStatusColor(payment.status)}`}
                    >
                        <option value={PaymentStatus.PENDING}>待繳</option>
                        <option value={PaymentStatus.PAID}>已繳</option>
                        <option value={PaymentStatus.OVERDUE}>逾期</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Financials;