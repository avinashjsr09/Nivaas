import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BarChart3, TrendingUp, Users, AlertCircle, QrCode, CreditCard, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading analytics & AI insights...</div>;
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-6 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          AI Roadmap & Operational Intelligence Module
        </div>
        <h1 className="text-2xl font-extrabold text-white">Society Analytics & Insights</h1>
        <p className="text-xs text-slate-300">
          Real-time metrics on resident complaints, collection revenue, gate traffic, and AI operational recommendations.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Residents</span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.total_residents || 0}</div>
          <span className="text-[11px] text-slate-400">Active verified flat accounts</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Revenue Collected</span>
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">₹{(stats.total_revenue_collected || 0).toLocaleString()}</div>
          <span className="text-[11px] text-amber-400 font-medium">Pending Dues: ₹{(stats.total_dues_pending || 0).toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Resolution Rate</span>
            <AlertCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {stats.total_complaints > 0
              ? `${Math.round((stats.resolved_complaints / stats.total_complaints) * 100)}%`
              : '100%'}
          </div>
          <span className="text-[11px] text-slate-400">{stats.resolved_complaints || 0} of {stats.total_complaints || 0} complaints resolved</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gate Visitors Logged</span>
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.total_visitors || 0}</div>
          <span className="text-[11px] text-slate-400">Processed through Security Hub</span>
        </div>
      </div>

      {/* AI Intelligence & Category Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations Box */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Operational Insights & Smart Recommendations
          </h2>

          <div className="space-y-3">
            {data?.ai_insights?.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold shrink-0">
                  #{idx + 1}
                </div>
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Category Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Complaint Breakdown
          </h2>

          {data?.category_breakdown?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No complaint breakdown data yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.category_breakdown?.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>{cat.category}</span>
                    <span className="text-sky-400 font-bold">{cat.count} ticket(s)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (stats.total_complaints || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
