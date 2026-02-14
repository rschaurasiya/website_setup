import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const lastSent = localStorage.getItem('lastResetEmailSent');
            if (lastSent) {
                const secondsPassed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
                if (secondsPassed < 60) {
                    setCooldown(60 - secondsPassed);
                }
            }
        }
    }, [isOpen]);

    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cooldown > 0) return;

        setStatus('loading');
        setMessage('');

        try {
            // Directly send reset link (Standard Security Practice: Don't reveal user existence)
            const actionCodeSettings = {
                url: window.location.origin + '/login', // Redirect back to login after reset
                handleCodeInApp: true,
            };

            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            console.log("Password reset email sent successfully to:", email);

            localStorage.setItem('lastResetEmailSent', Date.now().toString());
            setStatus('success');
            setMessage('Password reset link sent. Please check your email.');
        } catch (error) {
            console.error("Forgot Password Error:", error);
            setStatus('error');
            if (error.code === 'auth/invalid-email') {
                setMessage('Please enter a valid email address.');
            } else if (error.code === 'auth/missing-android-pkg-name' || error.code === 'auth/missing-ios-bundle-id') {
                setMessage('Configuration error: Missing app package name.');
            } else {
                setMessage('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="mb-6 flex justify-center">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <Mail size={24} />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
                        Forgot Password?
                    </h3>
                    <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {status === 'success' ? (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-start gap-3 mb-6">
                            <CheckCircle className="shrink-0 mt-0.5" size={18} />
                            <div className="text-sm font-medium">{message}</div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    placeholder="name@example.com"
                                    disabled={status === 'loading'}
                                />
                            </div>

                            {status === 'error' && (
                                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || cooldown > 0}
                                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-md shadow-primary-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : cooldown > 0 ? (
                                    `Resend available in ${cooldown}s`
                                ) : (
                                    <>
                                        Send Reset Link <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {status === 'success' && (
                        <button
                            onClick={onClose}
                            className="w-full mt-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all"
                        >
                            Back to Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
