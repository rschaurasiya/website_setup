import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { Lock, Mail, X } from 'lucide-react';
import { getFirebaseErrorMessage, getApiErrorMessage } from '../utils/errorUtils';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
    const [mode, setMode] = useState('LOGIN'); // LOGIN, FORGOT_EMAIL, FORGOT_OTP, RESET_PASSWORD

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password State
    const [resetEmail, setResetEmail] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMode('LOGIN');
            setError('');
            setSuccess('');
            setEmail('');
            setPassword('');
            setResetEmail('');
        }
    }, [isOpen]);

    // Handle redirection/closing when user is authenticated
    useEffect(() => {
        if (isOpen && user) {
            console.log('LoginModal: User detected, closing and redirecting:', user);
            onClose();
            // Optional: Redirect if on a public page, or just stay if that is preferred?
            // The user wanted to go to Dashboard.
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'author') {
                navigate(`/profile/${user.username}/dashboard`);
            } else {
                // For readers, maybe just close modal or go to home?
                // navigate('/'); // Optional, might already be on home
            }
        }
    }, [user, isOpen, navigate, onClose]);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            sessionStorage.setItem('justLoggedIn', 'true');
            // login() no longer returns user, it updates AuthContext state
            await login(email, password);
            // Navigation/Close is now handled by useEffect above
        } catch (err) {
            console.error("Login Modal Error:", err);
            const msg = getFirebaseErrorMessage(err) || getApiErrorMessage(err);
            setError(msg);
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await authService.forgotPassword(resetEmail);
            setSuccess('Security code sent to your email.');
            setTimeout(() => {
                setSuccess('');
                setMode('FORGOT_OTP');
            }, 1500);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.verifyOtp(resetEmail, otp);
            setMode('RESET_PASSWORD');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.resetPassword(resetEmail, otp, newPassword);
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                setMode('LOGIN');
                setSuccess('');
                setEmail(resetEmail); // Pre-fill login email
            }, 2000);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl transform transition-all p-6 sm:p-8 border border-slate-100 dark:border-slate-700">

                {/* Close Button */}
                <button
                    type="button"
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                    onClick={onClose}
                >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                </button>

                {/* --- MODE: LOGIN --- */}
                {mode === 'LOGIN' && (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please sign in to your account</p>
                        </div>
                        <form className="space-y-5" onSubmit={handleLogin}>
                            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">{error}</div>}
                            {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm text-center">{success}</div>}

                            <div>
                                <label className="sr-only">Email address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="sr-only">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end">
                                <button type="button" onClick={() => setMode('FORGOT_EMAIL')} className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">Forgot Password?</button>
                            </div>
                            <button type="submit" className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all">Sign in</button>
                        </form>
                        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?
                            <button
                                onClick={() => { onClose(); onSwitchToSignup(); }}
                                className="font-medium text-primary-600 dark:text-primary-400 hover:underline ml-1"
                            >
                                Sign Up
                            </button>
                        </div>
                    </>
                )}

                {/* --- MODE: FORGOT_EMAIL --- */}
                {mode === 'FORGOT_EMAIL' && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Enter your email to receive a verification code.</p>
                        </div>
                        <form className="space-y-5" onSubmit={handleSendCode}>
                            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">{error}</div>}
                            {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm text-center">{success}</div>}
                            <input
                                type="email"
                                required
                                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                            <button disabled={loading} type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">{loading ? 'Sending...' : 'Send Code'}</button>
                            <button type="button" onClick={() => setMode('LOGIN')} className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 text-sm">Back to Login</button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
};

export default LoginModal;
