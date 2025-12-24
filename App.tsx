import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, FileText, Wrench, Menu, X } from 'lucide-react';

import Dashboard from './components/Dashboard';
import Financials from './components/Financials';
import Contracts from './components/Contracts';
import Maintenance from './components/Maintenance';

import { mockPayments, mockTenants, mockTickets, mockFilters } from './services/mockData';
import { PaymentRecord, PaymentStatus, MaintenanceTicket, MaintenanceStatus } from './types';

// Sidebar Navigation Component
const Sidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '總覽看板', icon: LayoutDashboard },
    { path: '/financials', label: '財務管理', icon: DollarSign },
    { path: '/contracts', label: '合約文件', icon: FileText },
    { path: '/maintenance', label: '維修管理', icon: Wrench },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-stone-900 text-stone-100 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}>
      <div className="flex items-center justify-between p-6 border-b border-stone-700">
        <h1 className="text-xl font-bold tracking-wider text-amber-500">SmartLandlord</h1>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-stone-400">
          <X size={24} />
        </button>
      </div>
      <nav className="p-4 space-y-2">
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
      <div className="absolute bottom-0 w-full p-6 border-t border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white shadow-md">L</div>
          <div>
            <p className="text-sm font-medium text-stone-200">房東 Admin</p>
            <p className="text-xs text-stone-500">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(mockTickets);

  // Handlers for updating state (in a real app, these would call an API)
  const handleUpdatePayment = (id: string, status: PaymentStatus) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleUpdateTicket = (id: string, status: MaintenanceStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-orange-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        
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
              <Route path="/financials" element={<Financials payments={payments} onUpdatePayment={handleUpdatePayment} />} />
              <Route path="/contracts" element={<Contracts tenants={mockTenants} />} />
              <Route path="/maintenance" element={<Maintenance tickets={tickets} filters={mockFilters} onUpdateTicketStatus={handleUpdateTicket} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;