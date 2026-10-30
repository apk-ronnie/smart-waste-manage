import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trash2,
  Navigation,
  Sparkles,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Radio,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSimulate?: () => void;
  isSimulating?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onSimulate,
  isSimulating = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSimulating, setLocalSimulating] = useState(false);

  const handleGlobalSimulate = async () => {
    if (onSimulate) {
      onSimulate();
      return;
    }
    setLocalSimulating(true);
    try {
      await api.post('/bins/simulate');
      window.dispatchEvent(new CustomEvent('bins-updated'));
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setTimeout(() => setLocalSimulating(false), 400);
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bins', label: 'Dustbin Fleet', icon: Trash2 },
    { to: '/route-optimization', label: 'Route Planner', icon: Navigation },
    { to: '/ai-assistant', label: 'AI Operations', icon: Sparkles },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const simulatingState = isSimulating || localSimulating;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white">Smart Waste Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGlobalSimulate}
            disabled={simulatingState}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 disabled:opacity-50"
            title="Simulate Sensors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulatingState ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
              SW
            </div>
            <div>
              <h1 className="font-semibold text-sm text-white leading-tight">
                Smart Waste Monitor
              </h1>
              <p className="text-[11px] text-slate-400">Campus Facility System</p>
            </div>
          </div>
        </div>

        {/* Global Action: Simulate */}
        <div className="p-3">
          <button
            onClick={handleGlobalSimulate}
            disabled={simulatingState}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${simulatingState ? 'animate-spin' : ''}`} />
            {simulatingState ? 'Simulating...' : 'Simulate Sensors'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-200' : 'text-slate-400'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* System Status & User Profile Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
            <span>Sensors Status</span>
            <span className="text-slate-300">Active (10 nodes)</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Manager'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'manager@campus.edu'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
