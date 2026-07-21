import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  AlertCircle,
  Bell,
  CreditCard,
  QrCode,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              {user.society_name || 'Nivaas Society Platform'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Good day, {user.name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Here is what's happening across your society today. Track entries, active notices, resident requests, and maintenance schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.role === 'RESIDENT' && (
              <Link
                to="/visitors"
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Create Visitor Pass
              </Link>
            )}

            {user.role === 'ADMIN' && (
              <Link
                to="/notices"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
              >
                <Bell className="w-4 h-4" /> Post Society Notice
              </Link>
            )}

            {user.role === 'SECURITY' && (
              <Link
                to="/security-gate"
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Gatekeeper Verification
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Complaints</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">4 Pending</span>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> 2 resolved today
            </span>
          </div>
          <Link to="/complaints" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
            View complaints <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gate Visitors Today</span>
            <QrCode className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">12 Visitors</span>
            <span className="text-xs text-sky-400">8 Exited</span>
          </div>
          <Link to="/visitors" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
            Track visitors <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Notice Announcements</span>
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">3 Active</span>
            <span className="text-xs text-purple-400">1 Urgent</span>
          </div>
          <Link to="/notices" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
            Read notices <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Maintenance Dues</span>
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">₹3,500</span>
            <span className="text-xs text-slate-400">Due 30th Jul</span>
          </div>
          <Link to="/payments" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
            Manage billing <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Access Action Hub */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          Quick Operations Hub ({user.role})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/complaints"
            className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300">Complaint Portal</h3>
              <p className="text-xs text-slate-400">Report maintenance issues, plumbing, noise, or electrical problems.</p>
            </div>
          </Link>

          <Link
            to="/visitors"
            className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300">Guest & QR Pass</h3>
              <p className="text-xs text-slate-400">Generate digital QR passes for delivery, visitors, or contractors.</p>
            </div>
          </Link>

          <Link
            to="/notices"
            className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300">Society Notices</h3>
              <p className="text-xs text-slate-400">Stay up to date with water cuts, AGM meetings, and society rules.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
