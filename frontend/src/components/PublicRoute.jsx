import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading...</p>
            </div>
        );
    }

    if (user) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        if (user.role === 'author') {
            return <Navigate to="/dashboard" replace />;
        }
        // Readers or other roles might go to a different place, or stay here if allowed?
        // Requirement says "Redirect them directly to their respective dashboard".
        // Assuming 'reader' also goes to /application-status or similar if they are an applicant.
        if (user.role === 'reader') {
            return <Navigate to="/application-status" replace />;
        }

        // Default fallback
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
