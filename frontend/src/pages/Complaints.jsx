import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Wrench,
  X,
  User,
  Phone,
  Tag,
  Filter
} from 'lucide-react';

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Complaint Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/complaints', {
        title,
        description,
        category,
        priority
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('');
      setShowModal(false);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to lodge complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
        status: newStatus
      });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredComplaints = complaints.filter(c =>
    filterStatus === 'ALL' ? true : c.status === filterStatus
  );

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">🔥 Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">⚠️ High</span>;
      case 'Low':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30">Low</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">Medium</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Wrench className="w-3.5 h-3.5 animate-spin" /> In Progress</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <AlertCircle className="w-7 h-7 text-amber-400" />
            Complaint Management Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lodge maintenance issues, track resolution workflow, and AI priority tagging
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'ALL' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'PENDING' ? 'bg-amber-500 text-white font-semibold' : 'text-slate-400'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('RESOLVED')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filterStatus === 'RESOLVED' ? 'bg-emerald-500 text-white font-semibold' : 'text-slate-400'}`}
            >
              Resolved
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Lodge Complaint
          </button>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">No complaints found</p>
          <p className="text-slate-500 text-xs">All society maintenance tasks are currently smooth!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-sky-400 border border-slate-700">
                    {c.category}
                  </span>
                  {getPriorityBadge(c.priority)}
                  <h3 className="font-bold text-slate-100 text-base">{c.title}</h3>
                </div>

                <div>{getStatusBadge(c.status)}</div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {c.description}
              </p>

              {/* AI Auto Summary Box */}
              {c.ai_summary && (
                <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-xs text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <span>{c.ai_summary}</span>
                </div>
              )}

              {/* Footer / Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {c.resident_name || 'Resident'} (Flat {c.flat_number || 'N/A'})
                  </span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                {/* Admin Status Actions */}
                {user.role === 'ADMIN' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Update Status:</span>
                    <button
                      onClick={() => handleStatusUpdate(c.id, 'IN_PROGRESS')}
                      className="px-2 py-1 text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(c.id, 'RESOLVED')}
                      className="px-2 py-1 text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-400" /> Lodge New Complaint
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water leak from kitchen ceiling"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide full details of the maintenance or security issue..."
                  rows={4}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Nivaas AI will automatically analyze your issue, suggest priority tags, and alert society management.</span>
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
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
