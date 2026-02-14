import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Check, ClipboardList, BookOpen, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CreatorApplication = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        qualification: '',
        contact_number: '',
        reason: '',
        social_link: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/users/application`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Redirect to status page
            navigate('/application-status');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application');
            setSubmitting(false);
        }
    };

    if (!user) return null; // Or redirect

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="bg-primary-600 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <ClipboardList className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Creator Application</h2>
                    <p className="text-primary-100">Complete your profile to request author access</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Full Name"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qualification (LLB Details) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="qualification"
                                    required
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    placeholder="e.g. LLB, University of Delhi"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    required
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                    placeholder="+91 9876543210"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Bio & Reason <span className="text-red-500">*</span></label>
                            <textarea
                                name="reason"
                                required
                                rows="4"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Tell us about your legal background and what you plan to write about..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Social Profile (LinkedIn/Twitter) <span className="text-slate-400">(Optional)</span></label>
                            <input
                                type="url"
                                name="social_link"
                                value={formData.social_link}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={logout}
                                className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Log Out
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-[2] py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatorApplication;
