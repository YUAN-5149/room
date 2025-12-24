import React, { useState } from 'react';
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
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // App Data State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(mockTickets);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);

  // Auth Handlers
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

  // --- Handlers for Data Updates ---
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

  const handleAddTenant = (newTenant: Tenant) => {
    setTenants(prev => [...prev, newTenant]);
    
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      tenantId: newTenant.id,
      tenantName: newTenant.name, 
      amount: newTenant.rentAmount,
      dueDate: new Date().toISOString().split('T')[0],
      status: PaymentStatus.PENDING,
      type: 'Rent'
    };
    setPayments(prev => [newPayment, ...prev]);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };

  const handleDeleteTenant = (id: string) => {
    if (window.confirm('確定要刪除這位租客資料嗎？此操作無法復原。')) {
      setTenants(prev => prev.filter(t => t.id !== id));
    }
  };

  // Render Login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  // Render Main App if authenticated
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
          {/* Top Header Mobile */}
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