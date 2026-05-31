import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  HardHat, 
  Package, 
  Receipt,
  LogOut,
  Settings,
  FileText,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

import logoImg from '../assets/BB Builder Logo.png';

export default function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Super Admin', 'Admin', 'Site Manager', 'Accountant', 'Client', 'Worker'] },
    { path: '/analytics', icon: BarChart3, label: 'AI Analytics', roles: ['Super Admin', 'Admin'] },
    { path: '/clients', icon: Users, label: 'Clients', roles: ['Super Admin', 'Admin'] },
    { path: '/projects', icon: Briefcase, label: 'Projects', roles: ['Super Admin', 'Admin'] },
    { path: '/sites', icon: HardHat, label: 'Sites', roles: ['Super Admin', 'Admin', 'Site Manager'] },
    { path: '/workers', icon: Users, label: 'Workers', roles: ['Super Admin', 'Admin', 'Site Manager'] },
    { path: '/attendance', icon: Package, label: 'Attendance', roles: ['Super Admin', 'Admin', 'Site Manager'] },
    { path: '/worker-portal', icon: LayoutDashboard, label: 'My Portal', roles: ['Worker'] },
    { path: '/materials', icon: Package, label: 'Inventory', roles: ['Super Admin', 'Admin', 'Site Manager', 'Accountant'] },
    { path: '/equipment', icon: HardHat, label: 'Equipment', roles: ['Super Admin', 'Admin', 'Site Manager'] },
    { path: '/finance', icon: Receipt, label: 'Finance & Payroll', roles: ['Super Admin', 'Admin', 'Accountant'] },
    { path: '/invoice-generator', icon: FileSpreadsheet, label: 'Invoice Gen', roles: ['Super Admin', 'Admin', 'Accountant'] },
    { path: '/documents', icon: FileText, label: 'Documents', roles: ['Super Admin', 'Admin', 'Site Manager', 'Client', 'Accountant'] },
  ];

  const allowedItems = menuItems.filter(item => user && (item.roles.includes(user.role) || user.role === 'Super Admin'));

  return (
    <div className="flex h-screen bg-slate-50 print:h-auto print:bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col overflow-hidden print:hidden">
        <div className="h-16 flex items-center justify-center border-b border-slate-200 bg-white overflow-hidden p-2 shrink-0">
          <img 
            src={logoImg} 
            alt="BB Builders" 
            className="h-full w-full object-contain scale-110 mix-blend-multiply" 
            style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-blue-200" : "text-slate-400"} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                {user?.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
            
            <div className="mt-4 pt-4 border-t border-slate-800/50 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Developed by Zestflow</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm print:hidden">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible relative z-0">
          {/* Watermark */}
          <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center opacity-10 ml-64 mt-16 print:hidden">
            <img src={logoImg} alt="" className="w-2/3 max-w-3xl object-contain grayscale" />
          </div>
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
