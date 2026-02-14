import React, { useState } from 'react';
import { User, Mail, Lock, Link as LinkIcon, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreatorRequest = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // If user is already a creator, redirect or show status
    if (user && (user.role === 'author' || user.role === 'admin')) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">You are a Creator!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        You already have author access. Go to your dashboard to start writing.
                    </p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
                <span className="inline-block py-1 px-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-6">
                    Join Our Community
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                    Become a Law Blog Creator
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Share your legal insights, build your reputation, and connect with a global audience of legal professionals and enthusiasts.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                    {[
                        { title: 'Publish Articles', desc: 'Write and manage your own legal articles and insights.' },
                        { title: 'Build Audience', desc: 'Grow your following and establish thought leadership.' },
                        { title: 'Earn Recognition', desc: 'Get featured on our homepage and newsletters.' }
                    ].map((item, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-lg font-medium px-8 py-3 rounded-full shadow-lg shadow-primary-600/20 transition-all transform hover:-translate-y-1"
                >
                    Start Application <ArrowRight size={20} />
                </button>
            </div>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="creator"
            />
        </div>
    );
};

export default CreatorRequest;
