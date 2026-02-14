import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Loading...</div>;
    }

    // Fail-safe: If user is null but localStorage has user, we previously tried to reload.
    // However, if backend sync fails repeatedly, this causes an infinite loop.
    // Better to just let it redirect to login so the user can try again.
    if (!user) {
        return <Navigate to="/?auth=login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log('ProtectedRoute: Role Mismatch', { userRole: user?.role, allowed: allowedRoles });
        // If user is 'reader' (not approved yet), redirect to status or apply
        if (user.role === 'reader') {
            return <Navigate to="/application-status" replace />;
        }
        // If user is 'author' attempting to access admin routes, redirect to dashboard
        if (user.role === 'author') {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    console.log('ProtectedRoute: Access Granted', { userRole: user?.role, path: window.location.pathname });
    return children;
};

export default ProtectedRoute;
