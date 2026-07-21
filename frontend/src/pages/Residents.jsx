import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Phone, Mail, Home, Shield, CheckCircle, Clock, UserPlus } from 'lucide-react';

export default function Residents() {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/residents');
      setResidents(res.data.residents);
    } catch (err) {
      setError('Failed to load resident directory');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToggle = async (residentId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/residents/${residentId}/approve`, {
        isApproved: !currentStatus
      });
      fetchResidents();
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const filteredResidents = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.flat_number && r.flat_number.toLowerCase().includes(search.toLowerCase())) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-400" />
            Resident Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified members, flat numbers, and society contact directory
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by flat, name or email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading resident directory...</div>
      ) : filteredResidents.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">No residents found</p>
          <p className="text-slate-500 text-xs">Try adjusting your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResidents.map((resItem) => (
            <div
              key={resItem.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-4 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-sm">
                    {resItem.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{resItem.name}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Home className="w-3 h-3 text-sky-400" /> Flat {resItem.flat_number || 'N/A'}
                    </span>
                  </div>
                </div>

                {resItem.role === 'ADMIN' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Secretary
                  </span>
                ) : resItem.role === 'SECURITY' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Security
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Resident
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{resItem.email}</span>
                </div>
                {resItem.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{resItem.phone}</span>
                  </div>
                )}
              </div>

              {/* Admin Approval Toggle */}
              {user.role === 'ADMIN' && resItem.id !== user.id && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Approval Status:</span>
                  <button
                    onClick={() => handleApproveToggle(resItem.id, resItem.is_approved)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                      resItem.is_approved
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {resItem.is_approved ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-400" /> Approve Resident
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
