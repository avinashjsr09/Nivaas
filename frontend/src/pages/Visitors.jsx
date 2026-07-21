import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { QrCode, PlusCircle, CheckCircle2, XCircle, Clock, ShieldCheck, User, Phone, X, Sparkles } from 'lucide-react';

export default function Visitors() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Guest Visit');
  const [visitorCount, setVisitorCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const data = await api.getVisitors();
      setVisitors(data.visitors);
    } catch (err) {
      console.error('Failed to fetch visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.createVisitorPass({
        guestName,
        phone,
        purpose,
        visitorCount
      });
      setGuestName('');
      setPhone('');
      setPurpose('Guest Visit');
      setVisitorCount(1);
      setShowModal(false);
      fetchVisitors();
      setSelectedPass(data.visitor);
    } catch (err) {
      alert('Failed to generate visitor pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusResponse = async (visitorId, newStatus) => {
    try {
      await api.updateVisitorStatus(visitorId, newStatus);
      fetchVisitors();
    } catch (err) {
      alert('Failed to update approval');
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Pre-Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Entry Denied</span>;
      case 'INSIDE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Inside Premises</span>;
      case 'EXITED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">Exited</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Waiting Approval</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-sky-400" />
            Visitor Approvals & QR Passes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pre-approve guests, issue digital QR entry passes & approve real-time gate requests
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Pre-Approve Guest
        </button>
      </div>

      {/* Real-time Approval Alert Box (If any pending visitors at gate) */}
      {visitors.some(v => v.status === 'PENDING') && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            Immediate Gate Action Required ({visitors.filter(v => v.status === 'PENDING').length} Pending Request)
          </div>
          <p className="text-xs text-slate-300">
            Security guard is requesting your approval for guests waiting at the main gate:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visitors.filter(v => v.status === 'PENDING').map(pending => (
              <div key={pending.id} className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-100 text-xs">{pending.guestName || pending.guest_name}</div>
                  <div className="text-[11px] text-slate-400">{pending.purpose} • {pending.visitorCount || pending.visitor_count || 1} Person(s)</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusResponse(pending.id, 'APPROVED')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg shadow"
                  >
                    Allow Entry
                  </button>
                  <button
                    onClick={() => handleStatusResponse(pending.id, 'REJECTED')}
                    className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visitor Passes & Logs */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading visitor logs...</div>
      ) : visitors.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
          <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">No visitor passes generated yet</p>
          <p className="text-slate-500 text-xs">Create a pre-approved QR pass for smooth gate entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitors.map((v) => (
            <div
              key={v.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{v.guest_name || v.guestName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-sky-400" /> {v.purpose || 'Visit'} ({v.visitor_count || v.visitorCount || 1} guest)
                  </p>
                </div>
                {getStatusBadge(v.status)}
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">QR Pass Code:</span>
                  <span className="font-mono text-sky-300 font-bold">{v.qr_code}</span>
                </div>
                {v.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span>{v.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Entry: {new Date(v.entry_time || v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {v.exit_time && <span>Exit: {new Date(v.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              </div>

              <button
                onClick={() => setSelectedPass(v)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-400" /> View Digital QR Pass
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pre-Approve Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-400" /> Issue Visitor QR Pass
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guest / Visitor Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={visitorCount}
                    onChange={(e) => setVisitorCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Visit</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                >
                  <option value="Guest Visit">Guest / Personal Visit</option>
                  <option value="Delivery (Amazon/Swiggy)">Delivery (Amazon / Swiggy / Zomato)</option>
                  <option value="Maintenance / Maid">Maintenance / Home Service</option>
                  <option value="Cab / Driver">Cab Driver / Drop-off</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20"
                >
                  {submitting ? 'Generating...' : 'Generate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital QR Pass Preview Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-5 text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedPass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Nivaas Gate Pass
              </div>
              <h3 className="text-lg font-extrabold text-white">{selectedPass.guest_name || selectedPass.guestName}</h3>
              <p className="text-xs text-slate-400">{selectedPass.purpose} • {selectedPass.visitor_count || selectedPass.visitorCount || 1} Person(s)</p>
            </div>

            {/* Generated QR Graphics */}
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-2 border-4 border-sky-500/40 shadow-xl mx-auto w-48 h-48">
              <QrCode className="w-32 h-32 text-slate-950" />
              <span className="font-mono text-[10px] font-bold text-slate-800 tracking-wider">
                {selectedPass.qr_code}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Pass Status:</span>
                <span className="font-bold text-emerald-400">{selectedPass.status}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Host Flat:</span>
                <span className="font-bold text-slate-200">{user.flat_number || 'Resident'}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Show this QR code or Pass ID to the security gate guard for instant seamless entry.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
