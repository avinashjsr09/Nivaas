import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  AlertCircle,
  ShieldAlert,
  Bell,
  CreditCard,
  QrCode,
  BarChart3,
  Building
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RESIDENT', 'SECURITY'] },
    { label: 'Resident Directory', path: '/residents', icon: Users, roles: ['ADMIN', 'RESIDENT'] },
    { label: 'Complaints', path: '/complaints', icon: AlertCircle, roles: ['ADMIN', 'RESIDENT'] },
    { label: 'Notices Board', path: '/notices', icon: Bell, roles: ['ADMIN', 'RESIDENT', 'SECURITY'] },
    { label: 'Visitor Approvals', path: '/visitors', icon: QrCode, roles: ['ADMIN', 'RESIDENT'] },
    { label: 'Gatekeeper Hub', path: '/security-gate', icon: ShieldAlert, roles: ['SECURITY', 'ADMIN'] },
    { label: 'Maintenance Payments', path: '/payments', icon: CreditCard, roles: ['ADMIN', 'RESIDENT'] },
    { label: 'Analytics & AI Insights', path: '/analytics', icon: BarChart3, roles: ['ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Building className="w-4 h-4 text-sky-400" />
          <span>Nivaas SaaS v1.0</span>
        </div>
        <p className="text-[11px] text-slate-400">Smart Society Operations Central</p>
      </div>
    </aside>
  );
}
