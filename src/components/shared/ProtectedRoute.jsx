import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen bg-paper-white flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-ink-black border-t-brand-red rounded-full animate-spin shadow-brutal mb-4 bg-white"></div>
        <p class="font-heading font-black tracking-wider text-xl uppercase animate-pulse">Loading GlobivaLearn...</p>
      </div>
    );
  }

  if (!currentUser) {
    // If trying to access admin route, go to admin login. If employee, go to employee login.
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    } else {
      return <Navigate to="/employee/login" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect role mismatch to their correct home page
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
