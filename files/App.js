import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FounderDashboard from './pages/FounderDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import StartupDetail from './pages/StartupDetail';
import RegisterStartup from './pages/RegisterStartup';
import BrowseStartups from './pages/BrowseStartups';
import Connections from './pages/Connections';
import Profile from './pages/Profile';

// Protected route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard'} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)' }}>Loading Pitch & Groww...</p>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard'} />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard'} />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard'} />} />

      {/* Founder Routes */}
      <Route path="/founder/dashboard" element={
        <ProtectedRoute role="founder"><FounderDashboard /></ProtectedRoute>
      } />
      <Route path="/founder/startup/new" element={
        <ProtectedRoute role="founder"><RegisterStartup /></ProtectedRoute>
      } />
      <Route path="/founder/connections" element={
        <ProtectedRoute role="founder"><Connections /></ProtectedRoute>
      } />
      <Route path="/founder/profile" element={
        <ProtectedRoute role="founder"><Profile /></ProtectedRoute>
      } />

      {/* Investor Routes */}
      <Route path="/investor/dashboard" element={
        <ProtectedRoute role="investor"><InvestorDashboard /></ProtectedRoute>
      } />
      <Route path="/investor/browse" element={
        <ProtectedRoute role="investor"><BrowseStartups /></ProtectedRoute>
      } />
      <Route path="/investor/connections" element={
        <ProtectedRoute role="investor"><Connections /></ProtectedRoute>
      } />
      <Route path="/investor/profile" element={
        <ProtectedRoute role="investor"><Profile /></ProtectedRoute>
      } />

      {/* Shared Routes */}
      <Route path="/startup/:id" element={
        <ProtectedRoute><StartupDetail /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181f',
              color: '#f0f0f8',
              border: '1px solid #2a2a38',
              borderRadius: '10px'
            }
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
