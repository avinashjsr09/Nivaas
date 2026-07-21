import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, PlusCircle, CheckCircle2, Clock, Download, ArrowUpRight, ShieldCheck, Sparkles, X } from 'lucide-react';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Bill creation form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [targetFlatNumber, setTargetFlatNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/payments');
      setPayments(res.data.payments);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/payments/create', {
        title,
        amount: parseFloat(amount),
        dueDate,
        targetFlatNumber
      });
      setTitle('');
      setAmount('');
      setDueDate('');
      setTargetFlatNumber('');
      setShowModal(false);
      fetchPayments();
      alert('Maintenance bill issued successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayBill = async (paymentId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/payments/${paymentId}/pay`);
      fetchPayments();
      setReceipt(res.data.payment);
    } catch (err) {
      alert('Failed to process payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            Maintenance & Utility Billing Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pay monthly society maintenance, water, club house dues & download instant digital receipts
          </p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Issue Maintenance Bill
          </button>
        )}
      </div>

      {/* Bill List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading billing records...</div>
      ) : payments.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">All dues cleared!</p>
          <p className="text-slate-500 text-xs">No pending maintenance bills found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                p.status === 'PAID'
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-lg'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-slate-400 font-semibold">{p.title}</span>
                  {p.status === 'PAID' ? (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PAID
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      DUE
                    </span>
                  )}
                </div>

                <div className="text-2xl font-extrabold text-white">
                  ₹{p.amount ? p.amount.toLocaleString() : '0'}
                </div>

                <div className="text-xs text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                  <div>Resident: <span className="text-slate-200 font-semibold">{p.resident_name || 'Resident'} (Flat {p.flat_number || 'N/A'})</span></div>
                  <div>Due Date: <span className="text-slate-300">{p.due_date || 'End of Month'}</span></div>
                  {p.transaction_ref && (
                    <div className="text-[11px] font-mono text-emerald-400">Ref: {p.transaction_ref}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                {p.status === 'PENDING' ? (
                  <button
                    onClick={() => handlePayBill(p.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CreditCard className="w-4 h-4" /> Pay Bill Now
                  </button>
                ) : (
                  <button
                    onClick={() => setReceipt(p)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> View Digital Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Maintenance Bill Modal (ADMIN) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Issue Maintenance Bill
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bill Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. August 2026 Society Maintenance"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="3500"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Flat (Leave blank for ALL residents)</label>
                <input
                  type="text"
                  value={targetFlatNumber}
                  onChange={(e) => setTargetFlatNumber(e.target.value)}
                  placeholder="e.g. B-402 or leave blank"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20"
                >
                  {submitting ? 'Issuing...' : 'Issue Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pb-3 border-b border-slate-800">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Payment Receipt Verified</h3>
              <p className="text-xs text-slate-400">Nivaas Smart Society Operations</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-emerald-400 font-bold">{receipt.transaction_ref || 'TXN-SUCCESS'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bill Description:</span>
                <span className="text-slate-200 font-medium">{receipt.title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="text-white font-bold text-sm">₹{receipt.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Date:</span>
                <span className="text-slate-300">{new Date(receipt.paid_at || Date.now()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">PAID & CONFIRMED</span>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Print / Save Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
