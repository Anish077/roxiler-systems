import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';

// User Pages
import UserStores from './pages/user/UserStores';
import ChangePassword from './pages/common/ChangePassword';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Layout
import AppLayout from './components/common/AppLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner spinner-lg" />
      <p>Loading...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }
  return children;
};

const getDefaultRoute = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'owner') return '/owner/dashboard';
  return '/user/stores';
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRoute(user.role)} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stores" element={<AdminStores />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Normal User */}
      <Route path="/user" element={
        <ProtectedRoute allowedRoles={['user']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="stores" element={<UserStores />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Store Owner */}
      <Route path="/owner" element={
        <ProtectedRoute allowedRoles={['owner']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181f',
              color: '#f0f0f8',
              border: '1px solid #2a2a38',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#43e97b', secondary: '#18181f' } },
            error: { iconTheme: { primary: '#ff4d6d', secondary: '#18181f' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
