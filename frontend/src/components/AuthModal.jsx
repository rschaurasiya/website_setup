import React, { useState, useEffect } from 'react';
import { X, Mail, Check, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, onSwitchToLogin, mode = 'signup' }) => { // Removed initialReason
    const [step, setStep] = useState(1); // 1: Auth, 2: Profile (Name)
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { firebaseSignup } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setError('');
            setFirebaseUser(null);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            // Check if user exists in backend via firebaseSignup (re-used for login/signup sync)
            const userBackend = await firebaseSignup({
                name: user.displayName || '',
                email: user.email || '',
                firebaseUid: user.uid,
                profile_photo: user.photoURL
            });
            onClose();

            if (userBackend.role === 'admin') {
                navigate('/admin');
            } else if (userBackend.role === 'author') {
                navigate('/dashboard');
            }
            // Else stay on current page (standard behavior for new signups/readers)
        } catch (err) {
            console.error("Google Login Error:", err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign in cancelled.');
            } else {
                const cleanMsg = err.message.replace('Firebase: Error (', '').replace(').', '');
                setError(cleanMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = result.user;
            setFirebaseUser(user);
            setStep(2); // Go to Profile Step to get Name
        } catch (err) {
            console.error("Signup Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use. Please login instead.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else {
                // Remove "Firebase: Error (" prefix if present for cleaner default message
                const cleanMsg = err.message.replace('Firebase: Error (', '').replace(').', '');
                setError(cleanMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await firebaseSignup({
                name: formData.name,
                email: formData.email, // confirmed email
                firebaseUid: firebaseUser.uid,
                profile_photo: firebaseUser.photoURL,
                role: 'reader'
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to finish signup');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">

                {/* Header */}
                <div className="border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {step === 1 ? 'Get Started' : 'Complete Profile'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-primary-600 transition-all duration-300 ease-out"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium shadow-sm"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                Continue with Google
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-md shadow-primary-600/20 transition-all disabled:opacity-70 flex justify-center items-center"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Start'}
                                </button>
                            </form>

                            <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
                                Already have an account?
                                <button
                                    onClick={() => { onClose(); onSwitchToLogin(); }}
                                    className="font-medium text-primary-600 dark:text-primary-400 hover:underline ml-1"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-md shadow-primary-600/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Complete Signup'}
                                {!loading && <Check size={18} />}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
