import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Bell, PlusCircle, Trash2, AlertTriangle, Calendar, User, X, Sparkles } from 'lucide-react';

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await api.getNotices();
      setNotices(data.notices);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createNotice({
        title,
        content,
        priority
      });
      setTitle('');
      setContent('');
      setPriority('NORMAL');
      setShowModal(false);
      fetchNotices();
    } catch (err) {
      alert('Failed to publish notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-400" />
            Society Notices & Announcements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official announcements, AGM meetings, maintenance alerts & rules
          </p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Publish Notice
          </button>
        )}
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">No notices published yet</p>
          <p className="text-slate-500 text-xs">New announcements from society secretary will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`p-6 rounded-2xl border transition-all ${
                n.priority === 'URGENT'
                  ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {n.priority === 'URGENT' ? (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> URGENT ANNOUNCEMENT
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      Notice
                    </span>
                  )}
                  <h3 className="font-bold text-slate-100 text-base">{n.title}</h3>
                </div>

                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors self-end sm:self-auto"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {n.content}
              </p>

              <div className="flex items-center justify-between gap-4 text-xs text-slate-400 pt-4 mt-4 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Issued by {n.author_name || 'Secretary'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" /> Publish Notice
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual General Body Meeting (AGM)"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="NORMAL">Normal Announcement</option>
                  <option value="URGENT">🚨 URGENT / Critical Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full notice content..."
                  rows={5}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                ></textarea>
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20"
                >
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
