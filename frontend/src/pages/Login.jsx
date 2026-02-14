import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const { login, user } = useAuth(); // Get user from context
    const navigate = useNavigate();

    // Redirect when user is authenticated
    React.useEffect(() => {
        if (user) {
            console.log('Login: User detected in context:', user);
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'author') {
                navigate(`/profile/${user.id}/dashboard`);
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log("Login form submitted");

        try {
            // Use the login function from AuthContext which handles Firebase + Sync
            await login(email, password);
            console.log("Login successful (handled by AuthContext)");
            // Navigation handled by useEffect
        } catch (err) {
            console.error("Login Error:", err);
            // DEBUG: Show full error to user for screenshot
            let errorMessage = `Login failed: ${err.message || JSON.stringify(err)}`;

            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = `Invalid email or password. (${err.code})`;
            }

            // FORCE ALERT TO USER
            alert(errorMessage);

            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-serif font-bold text-slate-900 dark:text-white">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100 dark:border-slate-800 transition-colors">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">{error}</div>}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md py-2 border transition-colors focus:outline-none focus:ring-2"
                                    placeholder="admin@lawblog.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md py-2 border transition-colors focus:outline-none focus:ring-2"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                Forgot your password?
                            </button>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account? <Link to="/become-creator" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 hover:underline">Sign Up</Link>
                    </div>
                </div>
            </div>
            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
            />
        </div>
    );
};

export default Login;
