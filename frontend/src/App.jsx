import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Complaints from './pages/Complaints';
import Notices from './pages/Notices';
import Visitors from './pages/Visitors';
import SecurityDashboard from './pages/SecurityDashboard';
import Payments from './pages/Payments';
import AdminAnalytics from './pages/AdminAnalytics';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/residents"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT']}>
                <MainLayout>
                  <Residents />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT']}>
                <MainLayout>
                  <Complaints />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT', 'SECURITY']}>
                <MainLayout>
                  <Notices />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT']}>
                <MainLayout>
                  <Visitors />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/security-gate"
            element={
              <ProtectedRoute allowedRoles={['SECURITY', 'ADMIN']}>
                <MainLayout>
                  <SecurityDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT']}>
                <MainLayout>
                  <Payments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout>
                  <AdminAnalytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback & Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
