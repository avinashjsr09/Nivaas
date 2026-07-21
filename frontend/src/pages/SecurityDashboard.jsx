import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, QrCode, PlusCircle, CheckCircle, XCircle, LogOut, Search, Clock, Home, Sparkles } from 'lucide-react';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrQuery, setQrQuery] = useState('');
  const [qrResult, setQrResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // New Gate Entry Form State
  const [guestName, setGuestName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Personal Visit');
  const [visitorCount, setVisitorCount] = useState(1);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/visitors');
      setVisitors(res.data.visitors);
    } catch (err) {
      console.error('Failed to fetch gate logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // QR Code Pass Verification
  const handleVerifyQr = async (e) => {
    e.preventDefault();
    if (!qrQuery) return;
    setVerifying(true);
    setQrResult(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/visitors/verify/${qrQuery.trim()}`);
      setQrResult(res.data);
    } catch (err) {
      setQrResult({ valid: false, error: err.response?.data?.error || 'Invalid QR Pass' });
    } finally {
      setVerifying(false);
    }
  };

  // Log Gate Entry Request (Security triggers request to Resident)
  const handleLogVisitor = async (e) => {
    e.preventDefault();
    setLogging(true);

    try {
      await axios.post('http://localhost:5000/api/visitors/create-pass', {
        guestName,
        flatNumber,
        phone,
        purpose,
        visitorCount
      });
      setGuestName('');
      setFlatNumber('');
      setPhone('');
      setPurpose('Personal Visit');
      setVisitorCount(1);
      fetchVisitors();
      alert('Visitor request logged! Waiting for resident approval.');
    } catch (err) {
      alert('Failed to log visitor entry');
    } finally {
      setLogging(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/visitors/${id}/status`, { status });
      fetchVisitors();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Security Guard Gatekeeper Command Hub
        </div>
        <h1 className="text-2xl font-extrabold text-white">Main Gate Operations</h1>
        <p className="text-xs text-slate-300">
          Verify digital QR passes, record live visitor entries, and track vehicle / guest exits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR Verification & New Entry Form */}
        <div className="space-y-6 lg:col-span-1">
          {/* QR Verification Scanner Widget */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-sky-400" /> Verify Digital QR Pass
            </h2>

            <form onSubmit={handleVerifyQr} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={qrQuery}
                  onChange={(e) => setQrQuery(e.target.value.toUpperCase())}
                  placeholder="Enter or scan pass e.g. NV-PASS-XXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-20 py-2.5 text-xs text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-semibold rounded-lg shadow transition-all"
                >
                  {verifying ? '...' : 'Verify'}
                </button>
              </div>
            </form>

            {qrResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                qrResult.valid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}>
                {qrResult.valid ? (
                  <>
                    <div className="font-bold flex items-center gap-1.5 text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" /> VERIFIED VALID PASS
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div>Guest: <span className="font-bold text-white">{qrResult.visitor.guest_name}</span></div>
                      <div>Host Flat: <span className="font-bold text-white">Flat {qrResult.visitor.flat_number || 'Resident'}</span></div>
                      <div>Status: <span className="font-bold text-sky-300">{qrResult.visitor.status}</span></div>
                    </div>
                    {qrResult.visitor.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(qrResult.visitor.id, 'INSIDE');
                          setQrResult(null);
                        }}
                        className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow"
                      >
                        Allow Entry into Gate
                      </button>
                    )}
                  </>
                ) : (
                  <div className="font-bold flex items-center gap-1.5 text-rose-400">
                    <XCircle className="w-4 h-4" /> {qrResult.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Log New Unannounced Visitor */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" /> Log Unannounced Gate Entry
            </h2>

            <form onSubmit={handleLogVisitor} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Resident Flat</label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. B-402"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Guest / Courier Name"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Persons</label>
                  <input
                    type="number"
                    min="1"
                    value={visitorCount}
                    onChange={(e) => setVisitorCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={logging}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs shadow transition-all disabled:opacity-50"
              >
                {logging ? 'Logging...' : 'Send Approval Request to Resident'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Gate Log Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" /> Live Gate Activity Log
            </h2>
            <button
              onClick={fetchVisitors}
              className="text-xs text-sky-400 hover:underline font-semibold"
            >
              Refresh Log
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading gate activity...</div>
          ) : visitors.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold text-sm">Gate log is clean</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{v.guest_name || v.guestName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-950 text-sky-300 rounded border border-slate-800">
                        {v.qr_code}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Home className="w-3 h-3 text-amber-400" /> Flat {v.flat_number || 'N/A'} ({v.resident_name || 'Resident'})
                      </span>
                      <span>• {v.purpose}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.status === 'PENDING' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Waiting Resident
                      </span>
                    )}

                    {v.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(v.id, 'INSIDE')}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-xl shadow"
                      >
                        Mark Entry (Inside)
                      </button>
                    )}

                    {v.status === 'INSIDE' && (
                      <button
                        onClick={() => handleUpdateStatus(v.id, 'EXITED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Mark Exited
                      </button>
                    )}

                    {v.status === 'EXITED' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Exited
                      </span>
                    )}

                    {v.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Denied
                      </span>
                    )}
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
