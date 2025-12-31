import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, FileText, Wrench, Menu, X, LogOut } from 'lucide-react';

import Dashboard from './components/Dashboard';
import Financials from './components/Financials';
import Contracts from './components/Contracts';
import Maintenance from './components/Maintenance';
import Login from './components/Login';

import { mockPayments, mockTenants, mockTickets, mockFilters } from './services/mockData';
import { verifyUser, User } from './services/authMock';
import { PaymentRecord, PaymentStatus, MaintenanceTicket, MaintenanceStatus, Tenant } from './types';

// Sidebar Navigation Component
const Sidebar = ({ 
  mobileOpen, 
  setMobileOpen, 
  user, 
  onLogout 
}: { 
  mobileOpen: boolean, 
  setMobileOpen: (open: boolean) => void,
  user: User,
  onLogout: () => void
}) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '總覽看板', icon: LayoutDashboard },
    { path: '/financials', label: '財務管理', icon: DollarSign },
    { path: '/contracts', label: '合約與租客', icon: FileText },
    { path: '/maintenance', label: '維修管理', icon: Wrench },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-stone-900 text-stone-100 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto flex flex-col`}>
      <div className="flex items-center justify-between p-6 border-b border-stone-700">
        <h1 className="text-xl font-bold tracking-wider text-amber-500">SmartLandlord</h1>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-stone-400">
          <X size={24} />
        </button>
      </div>
      <nav className="p-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path) ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-stone-700 bg-stone-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-200">{user.name}</p>
            <p className="text-xs text-stone-500">{user.role === 'ADMIN' ? '系統管理員' : '一般用戶'}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-xs text-stone-400 hover:text-rose-400 hover:bg-stone-800 py-2 rounded transition"
        >
          <LogOut size={14} /> 登出系統
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(mockTickets);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);

  const handleLogin = (phone: string) => {
    const verifiedUser = verifyUser(phone);
    if (verifiedUser) {
      setUser(verifiedUser);
      setLoginError(null);
    } else {
      setLoginError('此手機號碼無存取權限，請聯繫系統管理員。');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginError(null);
  };

  const handleUpdatePayment = (id: string, status: PaymentStatus) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleDeletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const handleAddTicket = (ticket: MaintenanceTicket) => {
    setTickets(prev => [ticket, ...prev]);
  };

  const handleUpdateTicket = (updatedTicket: MaintenanceTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleUpdateTicketStatus = (id: string, status: MaintenanceStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTicket = (id: string) => {
     setTickets(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTenant = (newTenant: Tenant, options?: { genRent: boolean, genDeposit: boolean }) => {
    const tenantId = newTenant.id || `t-${Date.now()}`;
    const tenantWithId = { ...newTenant, id: tenantId };
    
    setTenants(prev => [...prev, tenantWithId]);
    
    const newPayments: PaymentRecord[] = [];

    // 隨機後綴確保 ID 絕對不重複
    const randomSuffix = () => Math.floor(Math.random() * 1000).toString();

    // 根據房東選擇決定是否產生帳單
    if (options?.genRent) {
      newPayments.push({
        id: `pay-r-${Date.now()}-${randomSuffix()}`,
        tenantId: tenantId,
        tenantName: newTenant.name, 
        amount: newTenant.rentAmount,
        dueDate: new Date().toISOString().split('T')[0],
        status: PaymentStatus.PENDING,
        type: 'Rent'
      });
    }
    
    if (options?.genDeposit) {
      newPayments.push({
        id: `pay-d-${Date.now()}-${randomSuffix()}`,
        tenantId: tenantId,
        tenantName: newTenant.name, 
        amount: newTenant.deposit,
        dueDate: new Date().toISOString().split('T')[0],
        status: PaymentStatus.PENDING,
        type: 'Deposit'
      });
    }
    
    if (newPayments.length > 0) {
      setPayments(prev => [...newPayments, ...prev]);
    }
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    setPayments(prev => prev.map(p => p.tenantId === updatedTenant.id ? { 
      ...p, 
      tenantName: updatedTenant.name,
      amount: (p.type === 'Rent' && p.status !== PaymentStatus.PAID) ? updatedTenant.rentAmount : p.amount
    } : p));
  };

  const handleDeleteTenant = (id: string) => {
    if (window.confirm('確定要刪除這位租客資料嗎？此操作將同步刪除該租客的所有財務紀錄與報修單，且無法復原。')) {
      setTenants(prev => prev.filter(t => t.id !== id));
      setPayments(prev => prev.filter(p => p.tenantId !== id));
      setTickets(prev => prev.filter(t => t.tenantId !== id));
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-orange-50">
        <Sidebar 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen} 
          user={user}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-20 border-b border-orange-100">
             <h1 className="font-bold text-stone-800">SmartLandlord Pro</h1>
             <button onClick={() => setMobileOpen(true)} className="text-stone-600">
               <Menu size={24} />
             </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard payments={payments} />} />
              <Route path="/financials" element={
                <Financials 
                    payments={payments} 
                    tenants={tenants}
                    onUpdatePayment={handleUpdatePayment}
                    onDeletePayment={handleDeletePayment}
                />
              } />
              <Route path="/contracts" element={
                <Contracts 
                  tenants={tenants} 
                  payments={payments} 
                  onAddTenant={handleAddTenant}
                  onUpdateTenant={handleUpdateTenant}
                  onDeleteTenant={handleDeleteTenant}
                />
              } />
              <Route path="/maintenance" element={
                <Maintenance 
                  tickets={tickets} 
                  filters={mockFilters} 
                  tenants={tenants}
                  onAddTicket={handleAddTicket}
                  onUpdateTicket={handleUpdateTicket}
                  onDeleteTicket={handleDeleteTicket}
                  onUpdateTicketStatus={handleUpdateTicketStatus} 
                />
              } />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;