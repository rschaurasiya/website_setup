import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';
import userService from '../services/userService'; // Re-using user service for profile updates
import { Plus, Trash2, Edit, LogOut, User, FileText, Settings, Shield } from 'lucide-react';
import ImageCropper from '../components/ImageCropper';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase';

const UserDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const { username, tab } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // UI State
    const activeTab = tab || 'dashboard'; // Default to dashboard if no tab
    const setActiveTab = (newTab) => navigate(`/profile/${username}/${newTab}`);

    // Access Control: Redirect if logged-in user tries to access another user's dashboard
    useEffect(() => {
        if (user && username && user.username !== username) {
            console.warn(`Unauthorized access attempt to profile ${username} by user ${user.username}. Redirecting.`);
            navigate(`/profile/${user.username}/dashboard`, { replace: true });
        }
    }, [user, username, navigate]);

    const [pageLoading, setPageLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Data State
    const [blogs, setBlogs] = useState({ data: [], totalPages: 1, currentPage: 1 });

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
        phone: user?.phone || '',
        address: user?.address || '',
        college: user?.college || '',
        bio: user?.bio || '',
        password: '',
        confirmPassword: '',
        profile_photo: null,
        social_links: user?.social_links || []
    });
    const [profilePreview, setProfilePreview] = useState(user?.profile_photo ? (user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo) : null);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);

    // Social Link State
    const [newLink, setNewLink] = useState({ platform: 'facebook', url: '' });

    useEffect(() => {
        if (user) {
            setProfileForm(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                username: user.username || '',
                phone: user.phone || '',
                address: user.address || '',
                college: user.college || '',
                bio: user.bio || '',
                social_links: user.social_links || []
            }));
            if (user.profile_photo) {
                setProfilePreview(user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [user, navigate, activeTab]);

    const fetchData = async () => {
        try {
            setPageLoading(true);

            // 1. Fetch latest user details to ensure social links are up to date
            try {
                // Use getMe() to fetch current user data securely
                const freshUser = await userService.getMe();
                if (freshUser) {
                    console.log("Dashboard: Refreshed user data", freshUser);
                    updateUser(freshUser);
                }
            } catch (e) {
                console.error("Failed to refresh user profile", e);
            }

            // Fetch based on Tab
            if (activeTab === 'blogs' || activeTab === 'dashboard') {
                try {
                    const response = await blogService.getMyBlogs();
                    const data = Array.isArray(response) ? response : (response.blogs || response.data || []);
                    setBlogs({ data, totalPages: 1, currentPage: 1 });
                } catch (err) {
                    console.error("Error fetching my blogs", err);
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setPageLoading(false);
        }
    };

    // --- BLOG ACTIONS ---
    const handleDeleteBlog = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            try {
                await blogService.deleteBlog(id);
                setBlogs(prev => ({ ...prev, data: prev.data.filter(blog => blog.id !== id) }));
            } catch (error) {
                console.error("Failed to delete blog", error);
                alert("Failed to delete blog. You may not have permission.");
            }
        }
    };

    // --- PROFILE ACTIONS ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (profileForm.password) {
            if (profileForm.password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }
            if (profileForm.password !== profileForm.confirmPassword) {
                alert("Passwords do not match");
                return;
            }
        }

        setIsSaving(true);
        try {
            // 1. Update Password in Firebase (if provided)
            if (profileForm.password) {
                const user = auth.currentUser;
                if (user) {
                    try {
                        await updatePassword(user, profileForm.password);
                        console.log("Firebase password updated successfully");
                    } catch (firebaseError) {
                        console.error("Firebase Password Update Error:", firebaseError);
                        if (firebaseError.code === 'auth/requires-recent-login') {
                            alert("For security, please log out and log in again before changing your password.");
                            setIsSaving(false);
                            return;
                        } else {
                            throw new Error(`Failed to update password: ${firebaseError.message}`);
                        }
                    }
                }
            }

            // 2. Prepare Form Data for Backend
            if (profileForm.social_links && profileForm.social_links.length < 2) {
                alert("You must provide at least 2 social media links.");
                setIsSaving(false);
                return;
            }

            const formData = new FormData();
            formData.append('name', profileForm.name);
            if (profileForm.username) formData.append('username', profileForm.username);
            formData.append('bio', profileForm.bio);
            if (profileForm.phone) formData.append('phone', profileForm.phone);
            if (profileForm.address) formData.append('address', profileForm.address);
            if (profileForm.college) formData.append('college', profileForm.college);

            // Still send password to backend if you are maintaining a hash there (optional but keeps sync)
            // But since we use Firebase Auth, backend password might be less relevant unless you dual-write.
            // For now, let's NOT send it to backend to avoid confusion, or send it if your backend requires it.
            // Based on userController, it hashes and saves if provided. Let's keep it consistent.
            if (profileForm.password) {
                formData.append('password', profileForm.password);
            }
            if (profileForm.profile_photo) {
                formData.append('profile_photo', profileForm.profile_photo);
            }
            if (profileForm.social_links) {
                formData.append('social_links', JSON.stringify(profileForm.social_links));
            }

            // 3. Update Backend Profile
            const updatedUser = await userService.updateProfile(formData);
            updateUser(updatedUser);

            // Clear password fields on success
            setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            alert('Profile updated successfully!');

        } catch (error) {
            console.error("Profile Update Error:", error);
            // Construct a detailed error message
            const serverMsg = error.response?.data?.message;
            const serverError = error.response?.data?.error; // Specific error from backend

            let displayMsg = 'Failed to update profile';
            if (serverMsg) {
                displayMsg = serverMsg;
                if (serverError) {
                    displayMsg += `: ${serverError}`;
                }
            } else if (error.message) {
                displayMsg = error.message;
            }

            alert(`Error: ${displayMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTempImageSrc(url);
            setShowCropper(true);
            e.target.value = null; // reset input
        }
    };

    const handleCropComplete = (croppedBlob) => {
        const file = new File([croppedBlob], "profile_photo.jpg", { type: "image/jpeg" });
        setProfileForm({ ...profileForm, profile_photo: file });
        setProfilePreview(URL.createObjectURL(croppedBlob));
        setShowCropper(false);
        setTempImageSrc(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-serif font-bold flex items-center text-slate-800 dark:text-white">
                        <User className="w-6 h-6 mr-2 text-primary-600" />
                        Author Dashboard
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            {user?.profile_photo ? (
                                <img
                                    src={user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="text-sm hidden sm:block">
                                <div className="font-semibold text-slate-900 dark:text-white">{user?.name}</div>
                                <div className="text-slate-500 text-xs capitalize">{user?.role}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                        <nav className="flex flex-col">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-6 py-4 text-left font-medium border-b border-slate-100 dark:border-slate-800 transition-colors ${activeTab === 'dashboard' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 border-l-4 border-l-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >Overview</button>

                            <button
                                onClick={() => setActiveTab('blogs')}
                                className={`px-6 py-4 text-left font-medium border-b border-slate-100 dark:border-slate-800 transition-colors ${activeTab === 'blogs' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 border-l-4 border-l-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >My Blogs</button>

                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-6 py-4 text-left font-medium border-b border-slate-100 dark:border-slate-800 transition-colors ${activeTab === 'profile' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 border-l-4 border-l-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >My Profile</button>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={logout}
                                    className="w-full px-6 py-4 text-left font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Welcome back, {user?.name}!</h2>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to={`/profile/${username}/create-blog`} className="btn-primary inline-flex items-center justify-center">
                                        <Plus className="w-4 h-4 mr-2" /> Write New Article
                                    </Link>
                                    <button onClick={() => setActiveTab('profile')} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                                        Update Profile
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                                </div>
                                <div className="p-6">
                                    {blogs.data.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                                    <tr>
                                                        <th className="px-4 py-3">Title</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3">Date</th>
                                                        <th className="px-4 py-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {blogs.data.slice(0, 5).map(blog => (
                                                        <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white truncate max-w-xs">{blog.title}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                                    blog.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                                    }`}>
                                                                    {blog.status || 'draft'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">{new Date(blog.createdAt || blog.created_at).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3 flex space-x-3">
                                                                <Link to={`/profile/${username}/edit-blog/${blog.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                                    <Edit className="w-4 h-4" />
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 dark:text-slate-400">You haven't written any blogs yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BLOGS TAB */}
                    {activeTab === 'blogs' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Blogs</h2>
                                <Link to={`/profile/${username}/create-blog`} className="btn-primary flex items-center text-sm">
                                    <Plus className="w-4 h-4 mr-1" /> New Post
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3">Title</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {blogs.data.map(blog => (
                                            <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate" title={blog.title}>{blog.title}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                        blog.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                            blog.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                        {blog.status || 'draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{new Date(blog.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex items-center space-x-3">
                                                    <Link to={`/profile/${username}/edit-blog/${blog.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {blogs.data.length === 0 && (
                                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No blogs found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors max-w-2xl mx-auto">
                            <h2 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Profile Settings</h2>

                            {showCropper && (
                                <ImageCropper
                                    imageSrc={tempImageSrc}
                                    onCropComplete={handleCropComplete}
                                    onCancel={() => { setShowCropper(false); setTempImageSrc(null); }}
                                    aspect={1}
                                />
                            )}

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700  bg-slate-100 dark:bg-slate-800">
                                            {profilePreview ? (
                                                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 shadow-md transition-colors">
                                            <Edit size={14} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                                        </label>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Click icon to change photo</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                            required
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (Read-only)</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed"
                                                value={profileForm.email}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username (Unique URL)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                            value={profileForm.username}
                                            onChange={e => setProfileForm({ ...profileForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                            placeholder="username"
                                            required
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Your profile URL: {window.location.origin}/author/{profileForm.username || 'username'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">College Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                        value={profileForm.college}
                                        onChange={e => setProfileForm({ ...profileForm, college: e.target.value })}
                                        placeholder="Enter your college or university"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                            value={profileForm.phone}
                                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                            value={profileForm.address}
                                            onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                        rows="3"
                                        value={profileForm.bio}
                                        onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Social Media Links (Max 2)</h3>

                                    {/* List of Added Links */}
                                    <div className="space-y-3 mb-4">
                                        {profileForm.social_links?.map((link, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize w-24">{link.platform}</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400 truncate flex-1">{link.url}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newLinks = [...profileForm.social_links];
                                                        newLinks.splice(index, 1);
                                                        setProfileForm({ ...profileForm, social_links: newLinks });
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    title="Remove Link"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!profileForm.social_links || profileForm.social_links.length === 0) && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">No social media links added yet.</p>
                                        )}
                                    </div>

                                    {/* Add New Link Form */}
                                    {(!profileForm.social_links || profileForm.social_links.length < 2) && (
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed">
                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Platform</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                                                    value={newLink.platform}
                                                    onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                                                >
                                                    <option value="facebook">Facebook</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="linkedin">LinkedIn</option>
                                                    <option value="youtube">YouTube</option>
                                                    <option value="twitter">X (Twitter)</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-6">
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">URL</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                                                    value={newLink.url}
                                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const { platform, url } = newLink;

                                                        if (!url) return alert("Please enter a URL");
                                                        try {
                                                            new URL(url); // Basic validation
                                                        } catch (_) {
                                                            return alert("Please enter a valid URL (starting with http:// or https://)");
                                                        }

                                                        const currentLinks = profileForm.social_links || [];

                                                        // Check if platform already added
                                                        if (currentLinks.some(l => l.platform === platform)) {
                                                            return alert(`You have already added a link for ${platform}. Remove it first to update.`);
                                                        }

                                                        setProfileForm({
                                                            ...profileForm,
                                                            social_links: [...currentLinks, { platform, url }]
                                                        });

                                                        // Clear URL input but keep platform or reset? Resetting URL is enough.
                                                        setNewLink({ ...newLink, url: '' });
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {profileForm.social_links?.length >= 2 && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">
                                            Maximum of 2 social media links allowed. Remove one to add another.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Security</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password (optional)</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                                value={profileForm.password}
                                                onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                                value={profileForm.confirmPassword}
                                                onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70 flex items-center shadow-lg shadow-primary-600/20"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div >
        </div >
    );
};

export default UserDashboard;
