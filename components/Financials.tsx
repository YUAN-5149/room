import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PaymentRecord, PaymentStatus } from '../types';
import { generatePaymentReminder } from '../services/geminiService';
import { CheckCircle, FileSpreadsheet, MessageSquare } from 'lucide-react';

interface FinancialsProps {
  payments: PaymentRecord[];
  onUpdatePayment: (id: string, status: PaymentStatus) => void;
}

const Financials: React.FC<FinancialsProps> = ({ payments, onUpdatePayment }) => {
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<{ id: string; text: string } | null>(null);

  const filteredPayments = payments.filter(p => filter === 'ALL' || p.status === filter);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredPayments.map(p => ({
      租客姓名: p.tenantName,
      金額: p.amount,
      到期日: p.dueDate,
      狀態: p.status,
      類型: p.type
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financials");
    XLSX.writeFile(wb, "Rent_Report.xlsx");
  };

  const handleDraftReminder = async (record: PaymentRecord) => {
    setGeneratingId(record.id);
    const today = new Date();
    const due = new Date(record.dueDate);
    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const message = await generatePaymentReminder(record, diffDays);
    setReminderMessage({ id: record.id, text: message });
    setGeneratingId(null);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">租客</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">項目</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">金額</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">到期日</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-orange-50">
            {filteredPayments.map((payment) => (
              <React.Fragment key={payment.id}>
                <tr className="hover:bg-orange-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800">{payment.tenantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{payment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 font-semibold">${payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{payment.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${payment.status === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-800' : 
                        payment.status === PaymentStatus.OVERDUE ? 'bg-rose-100 text-rose-800' : 
                        'bg-amber-100 text-amber-800'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 flex items-center gap-2">
                    {payment.status !== PaymentStatus.PAID && (
                      <button 
                        onClick={() => onUpdatePayment(payment.id, PaymentStatus.PAID)}
                        className="text-emerald-600 hover:text-emerald-800"
                        title="標記為已繳"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {payment.status === PaymentStatus.OVERDUE && (
                      <button 
                        onClick={() => handleDraftReminder(payment)}
                        className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                        disabled={generatingId === payment.id}
                      >
                        {generatingId === payment.id ? (
                          <span className="animate-spin text-xs">...</span>
                        ) : (
                          <MessageSquare size={18} />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
                {reminderMessage?.id === payment.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-amber-50">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-amber-900">建議催繳訊息：</label>
                        <textarea 
                          readOnly 
                          className="w-full p-2 text-sm border border-amber-200 rounded text-stone-700 h-24 bg-white"
                          value={reminderMessage.text}
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigator.clipboard.writeText(reminderMessage.text)}
                            className="text-xs bg-white border border-amber-200 text-stone-600 px-3 py-1 rounded hover:bg-orange-100"
                          >
                            複製文字
                          </button>
                          <button 
                            onClick={() => setReminderMessage(null)}
                            className="text-xs text-stone-500 px-3 py-1 hover:text-stone-700"
                          >
                            關閉
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Financials;