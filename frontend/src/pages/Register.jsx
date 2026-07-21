import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Mail, Key, Phone, Home, Shield, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [role, setRole] = useState('RESIDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [societyCode, setSocietyCode] = useState('');

  // Society creation fields (for Admin role)
  const [newSocietyName, setNewSocietyName] = useState('');
  const [newSocietyAddress, setNewSocietyAddress] = useState('');
  const [newSocietyCity, setNewSocietyCity] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let activeSocietyCode = societyCode;

      // If Secretary is registering a NEW society, create society first
      if (role === 'ADMIN' && newSocietyName) {
        const socRes = await axios.post('http://localhost:5000/api/societies/create', {
          name: newSocietyName,
          address: newSocietyAddress,
          city: newSocietyCity
        });
        activeSocietyCode = socRes.data.society.code;
      }

      await register({
        name,
        email,
        phone,
        password,
        role,
        societyCode: activeSocietyCode,
        flatNumber
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-1">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Nivaas Account</h1>
          <p className="text-xs text-slate-400">Join your society or set up a new society hub</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('RESIDENT')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              role === 'RESIDENT' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏡 Resident
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              role === 'ADMIN' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👑 Secretary
          </button>
          <button
            type="button"
            onClick={() => setRole('SECURITY')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              role === 'SECURITY' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Security
          </button>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Roy"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Resident or Security specifics */}
            {role !== 'ADMIN' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Society Code</label>
                  <input
                    type="text"
                    value={societyCode}
                    onChange={(e) => setSocietyCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GH101"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Flat / Unit Number</label>
                  <input
                    type="text"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    placeholder="e.g. B-402"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Admin specifics: Create new society */}
            {role === 'ADMIN' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-purple-400">Society Setup Information</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Society Name</label>
                  <input
                    type="text"
                    value={newSocietyName}
                    onChange={(e) => setNewSocietyName(e.target.value)}
                    placeholder="e.g. Green Heights Society"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={newSocietyCity}
                      onChange={(e) => setNewSocietyCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Flat Number</label>
                    <input
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="A-101"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-sky-400 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
