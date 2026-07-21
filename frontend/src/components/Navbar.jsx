import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, ShieldCheck, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Secretary / Admin</span>;
      case 'SECURITY':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Security Guard</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">Resident</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Nivaas <Sparkles className="w-4 h-4 text-sky-400" />
          </span>
          <p className="text-xs text-slate-400 hidden sm:block">Smart Society Platform</p>
        </div>
      </div>

      {/* Center / User Details */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>{user.society_name || 'No Society'}</span>
            {user.society_code && (
              <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-sky-300 font-semibold border border-slate-700">
                Code: {user.society_code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {getRoleBadge(user.role)}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-200">{user.name}</div>
                <div className="text-slate-400">{user.flat_number ? `Flat ${user.flat_number}` : user.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
