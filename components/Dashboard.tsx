import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PaymentRecord, PaymentStatus } from '../types';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  payments: PaymentRecord[];
}

// Warm Amber Theme Colors
const COLORS = ['#d97706', '#f59e0b', '#78350f']; // Amber-600, Amber-400, Amber-900

const Dashboard: React.FC<DashboardProps> = ({ payments }) => {
  // Prepare data for charts
  const totalPaid = payments.filter(p => p.status === PaymentStatus.PAID).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = payments.filter(p => p.status === PaymentStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = payments.filter(p => p.status === PaymentStatus.OVERDUE).reduce((acc, curr) => acc + curr.amount, 0);

  const pieData = [
    { name: '已收租金', value: totalPaid },
    { name: '待收租金', value: totalPending },
    { name: '逾期租金', value: totalOverdue },
  ];

  // Mock monthly data for Bar Chart
  const barData = [
    { name: '7月', rent: 45000, maintenance: 2500 },
    { name: '8月', rent: 45500, maintenance: 0 },
    { name: '9月', rent: 45500, maintenance: 500 },
    { name: '10月', rent: 31500, maintenance: 2000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <h3 className="text-stone-500 text-sm font-medium">已收總額 (本月)</h3>
          <p className="text-3xl font-bold text-stone-800 mt-2">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-400">
          <h3 className="text-stone-500 text-sm font-medium">待收帳款</h3>
          <p className="text-3xl font-bold text-stone-800 mt-2">${totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-rose-500">
          <h3 className="text-stone-500 text-sm font-medium">逾期帳款</h3>
          <p className="text-3xl font-bold text-stone-800 mt-2">${totalOverdue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-amber-600" /> 收支趨勢
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="name" stroke="#78716c" />
                <YAxis stroke="#78716c" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d', color: '#78350f' }}
                  itemStyle={{ color: '#78350f' }}
                />
                <Legend />
                <Bar dataKey="rent" name="租金收入" fill="#d97706" />
                <Bar dataKey="maintenance" name="維修支出" fill="#a8a29e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-600" /> 收租狀況佔比
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;