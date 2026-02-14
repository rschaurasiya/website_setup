import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ApplicationStatus = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/users/application/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatus(response.data);
            } catch (err) {
                console.error("Fetch status error", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            // If user is already author, redirect
            if (user.role === 'author' || user.role === 'admin') {
                navigate('/admin'); // Dashboard
            }
            fetchStatus();
        }
    }, [user, navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Loading...</div>;
    }

    // If no application found, redirect to apply
    if (!status && !loading) {
        navigate('/apply');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 p-8 text-center">

                {status.status === 'pending' && (
                    <>
                        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Submitted</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            Thank you for submitting your application. <br />
                            Our team will review your request and you will receive an approval or rejection email within <strong>2 working days</strong>.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-6 text-sm text-slate-500 dark:text-slate-400">
                            Until approval, dashboard access will remain unavailable.
                        </div>
                    </>
                )}

                {status.status === 'rejected' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Status Update</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Your application has been reviewed and was unfortunately rejected.
                        </p>
                        {status.rejection_reason && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-6 text-left border border-red-100 dark:border-red-900/50">
                                <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider block mb-1">Reason</span>
                                <p className="text-red-700 dark:text-red-300 text-sm">{status.rejection_reason}</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/apply')}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium mb-4 w-full"
                        >
                            Re-Apply
                        </button>
                    </>
                )}

                <button
                    onClick={logout}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-2 mx-auto transition-colors mt-4"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default ApplicationStatus;
