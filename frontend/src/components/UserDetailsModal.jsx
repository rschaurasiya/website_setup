import React from 'react';
import { X, Mail, Phone, MapPin, Briefcase, BookOpen, Clock, CheckCircle, Shield } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, user, loading }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        User Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-red-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : user ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Left Column - Profile Card */}
                            <div className="col-span-1">
                                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-4">
                                        <img
                                            src={user.profile_photo ? (user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo) : 'https://via.placeholder.com/150'}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">{user.name}</h3>
                                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize
                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                            user.role === 'author' ? 'bg-blue-100 text-blue-600' :
                                                'bg-green-100 text-green-600'}`}>
                                        {user.role}
                                    </span>

                                    <div className="w-full mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Phone className="w-4 h-4" />
                                            <span>{user.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <span>Joined {formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Card */}
                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Blogs Written</p>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{user.blogCount}</p>
                                        </div>
                                        <BookOpen className="w-8 h-8 text-blue-500 opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Details */}
                            <div className="col-span-1 md:col-span-2 space-y-6">

                                {/* Professional Info */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Professional Information</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <Briefcase className="w-4 h-4" />
                                                <span className="text-xs font-medium">Current Position</span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-medium">{user.position || 'Not provided'}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-xs font-medium">College / Institution</span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-medium">{user.college || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Bio / About</h4>
                                    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {user.bio || 'No bio provided yet.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Creator Status */}
                                {user.creatorRequest && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Creator Application Status</h4>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
                                                    ${user.creatorRequest.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        user.creatorRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'}`}>
                                                    {user.creatorRequest.status === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                                                    {user.creatorRequest.status ? (user.creatorRequest.status.charAt(0).toUpperCase() + user.creatorRequest.status.slice(1)) : 'Unknown'}
                                                </span>
                                                <p className="text-xs text-slate-500 mt-2">Applied on {formatDate(user.creatorRequest.created_at)}</p>
                                            </div>
                                            {/* Action buttons could go here if needed */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-12">User details not found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
