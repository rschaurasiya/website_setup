import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';
import userService from '../services/userService';

import teamService from '../services/teamService';
import api from '../services/api';
import { Plus, Trash2, Edit, FileText, CheckCircle, XCircle, UserCheck, Lock, Unlock, Shield, Settings, Camera, Eye, LogOut, Users, MessageSquare } from 'lucide-react';
import UserDetailsModal from '../components/UserDetailsModal';
import AdminSidebar from '../components/AdminSidebar';
import ImageCropper from '../components/ImageCropper';
import EditAbout from './EditAbout';

const AdminDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // UI State
    const activeTab = searchParams.get('tab') || 'overview';
    const setActiveTab = (tab) => setSearchParams({ tab });

    const handleViewUser = async (userId) => {
        setIsUserDetailsOpen(true);
        setUserDetailsLoading(true);
        try {
            const data = await userService.getUserDetails(userId);
            setSelectedUser(data);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            alert("Failed to load user details");
            setIsUserDetailsOpen(false);
        } finally {
            setUserDetailsLoading(false);
        }
    };

    const [loading, setLoading] = useState(false);

    // Modal State for Back Button Logout
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        // Handle Back Button Logout Prompt
        if (location.state?.showLogoutPrompt) {
            setShowLogoutConfirm(true);
            // Clear the state so it doesn't persist on refresh
            window.history.replaceState({}, document.title);
        }

        // Clean up the login flag if it exists
        sessionStorage.removeItem('justLoggedIn');
    }, [location]);

    // Data State
    const [stats, setStats] = useState({ totalBlogs: 0, totalUsers: 0, totalComments: 0 });
    const [blogs, setBlogs] = useState({ data: [], totalPages: 1, currentPage: 1 });
    const [usersList, setUsersList] = useState({ data: [], totalPages: 1, currentPage: 1 });
    const [commentsList, setCommentsList] = useState({ data: [], totalPages: 1, currentPage: 1 });
    const [categories, setCategories] = useState([]);
    const [authorRequests, setAuthorRequests] = useState([]);

    const [messages, setMessages] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);

    // Pagination State
    const [pageUsers, setPageUsers] = useState(1);
    const [pageBlogs, setPageBlogs] = useState(1);
    const [pageComments, setPageComments] = useState(1);
    const limit = 10;

    // Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const [categoryForm, setCategoryForm] = useState({ show: false, mode: 'add', id: null, name: '', parent_id: '' });
    const [teamForm, setTeamForm] = useState({
        show: false,
        mode: 'add',
        id: null,
        name: '',
        role: '',
        bio: '',
        social_email: '',
        social_links: [], // Dynamic Array: { platform: 'LinkedIn', url: '' }
        image: null
    });

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        college: user?.college || '',
        position: user?.position || '',
        password: '',
        confirmPassword: '',
        profile_photo: null,
        social_links: user?.social_links || []
    });
    const [profilePreview, setProfilePreview] = useState(user?.profile_photo ? (user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo) : null);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [cropTarget, setCropTarget] = useState('profile'); // 'profile' | 'team'
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const [teamImagePreview, setTeamImagePreview] = useState(null);

    // Social New Link
    const [newLink, setNewLink] = useState({ platform: 'facebook', url: '' });

    useEffect(() => {
        if (user) {
            setProfileForm(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                username: user.username || '',
                bio: user.bio || '',
                phone: user.phone || '',
                college: user.college || '',
                position: user.position || '',
                social_links: user.social_links || []
            }));
            if (user.profile_photo) {
                setProfilePreview(user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo);
            }
        }
    }, [user]);

    // --- SETTINGS STATE ---
    const [homepageSettings, setHomepageSettings] = useState({
        headline: '',
        subheadline: '',
        cta_text: 'Read Articles',
        background_type: 'image',
        file: null,
        previewUrl: null,
        overlay_opacity: 0.5
    });

    useEffect(() => {
        fetchData();
    }, [user, navigate, activeTab, pageUsers, pageBlogs, pageComments]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Always fetch stats
            if (user.role === 'admin') {
                const statsRes = await api.get('/admin/stats');
                setStats(statsRes.data);
            }

            // Fetch Settings if tab is active
            if (user.role === 'admin' && activeTab === 'settings') {
                const settingsRes = await api.get('/settings');
                if (settingsRes.data) {
                    setHomepageSettings(prev => ({
                        ...prev,
                        headline: settingsRes.data.headline || '',
                        subheadline: settingsRes.data.subheadline || '',
                        cta_text: settingsRes.data.cta_text || 'Read Articles',
                        background_type: settingsRes.data.background_type || 'image',
                        previewUrl: settingsRes.data.background_url ? (settingsRes.data.background_url.startsWith('http') ? settingsRes.data.background_url : settingsRes.data.background_url) : null,
                        overlay_opacity: settingsRes.data.overlay_opacity || 0.5
                    }));
                }
            }

            // Fetch based on Tab
            if (activeTab === 'blogs' || activeTab === 'overview') {
                if (user.role === 'admin') {
                    const response = await blogService.getAdminBlogs(pageBlogs, limit);
                    const data = Array.isArray(response) ? response : (response.blogs || []);
                    const totalPages = response.totalPages || 1;
                    const currentPage = response.currentPage || 1;

                    setBlogs({ data, totalPages, currentPage });
                } else if (user.role === 'author') {
                    const response = await blogService.getMyBlogs();
                    const data = Array.isArray(response) ? response : (response.blogs || response.data || []);
                    setBlogs({ data, totalPages: 1, currentPage: 1 });
                }
            }

            if (user.role === 'admin') {
                // Always fetch pending requests for badge
                try {
                    const requestsRes = await api.get('/users/admin/applications');
                    setAuthorRequests(requestsRes.data);
                } catch (err) {
                    console.error("Failed to fetch requests", err);
                }

                if (activeTab === 'users') {
                    const response = await userService.getAllUsers(pageUsers, limit);
                    const data = Array.isArray(response) ? response : (response.users || []);
                    const totalPages = response.totalPages || 1;
                    const currentPage = response.currentPage || 1;

                    setUsersList({ data, totalPages, currentPage });
                }
                if (activeTab === 'comments') {
                    const commentsRes = await api.get(`/comments/admin/all?page=${pageComments}&limit=${limit}`);
                    const data = commentsRes.data.comments || [];
                    const totalPages = commentsRes.data.totalPages || 1;
                    const currentPage = commentsRes.data.currentPage || 1;

                    setCommentsList({ data, totalPages, currentPage })
                }
                if (activeTab === 'categories') {
                    const catsData = await blogService.getCategories();
                    setCategories(catsData);
                }
                if (activeTab === 'messages') {
                    const msgRes = await api.get('/contact');
                    setMessages(msgRes.data);
                }
                if (activeTab === 'team') {
                    const teamData = await teamService.getAllMembers();
                    setTeamMembers(teamData);
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- SETTINGS ACTIONS ---
    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('headline', homepageSettings.headline);
            formData.append('subheadline', homepageSettings.subheadline);
            formData.append('cta_text', homepageSettings.cta_text);
            formData.append('background_type', homepageSettings.background_type);
            formData.append('overlay_opacity', homepageSettings.overlay_opacity);

            if (homepageSettings.file) {
                formData.append('file', homepageSettings.file);
            }

            // Debug FormData
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await api.put('/settings', formData);
            console.log("Update response:", response);
            alert('Homepage settings updated successfully!');
            fetchData(); // Refresh to ensure preview is synced
        } catch (error) {
            console.error("Error updating settings", error);
            const errMsg = error.response?.data?.message || error.message || "Failed to update settings";
            alert(`Error: ${errMsg}\nCheck console for details.`);
        } finally {
            setLoading(false);
        }
    };

    // --- BLOG ACTIONS ---
    const handleDeleteBlog = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            await blogService.deleteBlog(id);
            setBlogs(prev => ({ ...prev, data: prev.data.filter(blog => blog.id !== id) }));
        }
    };

    // --- USER ACTIONS ---


    // --- USER ACTIONS ---
    const handleBlockUser = async (userItem) => {
        const confirmMsg = userItem.is_blocked
            ? `Are you sure you want to unblock ${userItem.name}?`
            : "Are you sure you want to block this user?\nThe user will lose access, but their data will remain stored.";

        if (window.confirm(confirmMsg)) {
            try {
                await userService.updateUserStatus(userItem.id, null, !userItem.is_blocked);
                // Refresh list locally
                const updatedUsers = usersList.data.map(u =>
                    u.id === userItem.id ? { ...u, is_blocked: !userItem.is_blocked } : u
                );
                setUsersList(prev => ({ ...prev, data: updatedUsers }));
            } catch (error) {
                console.error("Failed to update user status", error);
                alert("Failed to update user");
            }
        }
    };

    const handleChangeRole = async (userItem, newRole) => {
        if (window.confirm(`Promote ${userItem.name} to ${newRole}?`)) {
            try {
                await userService.updateUserStatus(userItem.id, newRole, undefined);
                fetchData(); // Refetch to be safe
            } catch (error) {
                alert("Failed to change role");
            }
        }
    }

    // --- CATEGORY ACTIONS ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (categoryForm.mode === 'add') {
                await blogService.createCategory(categoryForm.name, categoryForm.parent_id || null);
            } else {
                await blogService.updateCategory(categoryForm.id, categoryForm.name, categoryForm.parent_id || null);
            }
            setCategoryForm({ show: false, mode: 'add', id: null, name: '', parent_id: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to save category");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await blogService.deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                alert("Failed to delete category");
            }
        }
    };

    // --- COMMENT ACTIONS ---
    // Note: Assuming deletion is an option, otherwise just viewing
    // If delete functionality is needed, we'd need a delete endpoint in backend (not requested but good to have)

    // --- AUTHOR REQUEST ACTIONS ---
    // --- REVIEW ACTIONS (Application & Blog) ---
    const handleApproveRequest = async (requestId) => {
        if (!window.confirm('Approve this application?')) return;
        setLoading(true);
        try {
            await api.put(`/users/application/${requestId}/review`, { action: 'approve' });
            fetchData();
            alert('Application approved!');
        } catch (error) {
            alert('Failed to approve');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedRequest.type === 'blog') {
                await api.put(`/blogs/${selectedRequest.id}/review`, { action: 'reject', reason: rejectionReason });
                alert('Blog rejected');
            } else {
                await api.put(`/users/application/${selectedRequest.id}/review`, { action: 'reject', reason: rejectionReason });
                alert('Application rejected');
            }
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedRequest(null);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to reject');
        } finally {
            setLoading(false);
        }
    };

    // --- TEAM ACTIONS ---
    const handleTeamSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Submitting Team Form:', teamForm); // Debug Log
        try {
            const formData = new FormData();
            formData.append('name', teamForm.name);
            formData.append('role', teamForm.role);
            formData.append('bio', teamForm.bio);
            formData.append('social_email', teamForm.social_email);
            formData.append('social_links', JSON.stringify(teamForm.social_links));

            // Debug Image
            if (teamForm.image) {
                console.log('Appending Image:', teamForm.image.name, teamForm.image.size, teamForm.image.type);
                const filename = teamForm.image.name || 'team_image.jpg';
                formData.append('image', teamForm.image, filename);
            } else {
                console.log('No Image to append');
            }

            if (false) { // Disabled old block to prevent duplicate appending
                // If it's a File object (from standard input) or Blob (from cropper)
                const filename = teamForm.image.name || 'team_image.jpg';
                formData.append('image', teamForm.image, filename);
            }

            if (teamForm.mode === 'add') {
                await teamService.addMember(formData);
            } else {
                await teamService.updateMember(teamForm.id, formData);
            }

            setTeamForm({
                show: false, mode: 'add', id: null,
                name: '', role: '', bio: '',
                social_email: '', social_links: [],
                image: null
            });
            setTeamImagePreview(null);
            fetchData();
            alert('Team member saved successfully');
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to save team member';
            alert(`Error: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeamMember = async (id) => {
        if (window.confirm('Delete this team member?')) {
            try {
                await teamService.deleteMember(id);
                setTeamMembers(prev => prev.filter(m => m.id !== id));
            } catch (error) {
                alert("Failed to delete member");
            }
        }
    };

    // --- PROFILE ACTIONS ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', profileForm.name);
            if (profileForm.username) formData.append('username', profileForm.username);
            formData.append('bio', profileForm.bio);
            if (profileForm.phone) formData.append('phone', profileForm.phone);
            if (profileForm.college) formData.append('college', profileForm.college);
            if (profileForm.position) formData.append('position', profileForm.position);

            if (profileForm.social_links) {
                if (profileForm.social_links.length < 2) {
                    alert("You must provide at least 2 social media links.");
                    setLoading(false);
                    return;
                }
                formData.append('social_links', JSON.stringify(profileForm.social_links));
            }

            if (profileForm.password) {
                formData.append('password', profileForm.password);
            }
            if (profileForm.profile_photo) {
                formData.append('profile_photo', profileForm.profile_photo);
            }

            const updatedUser = await userService.updateProfile(formData);
            updateUser(updatedUser);
            // alert('Profile updated successfully!'); // Removed duplicate alert
            alert('Profile updated successfully!');
            // window.location.reload(); // Removed to prevent full page reload, state is updated via context
        } catch (error) {
            console.error("Profile Update Error Details:", error);
            if (error.response) {
                console.error("Response Data:", error.response.data);
                console.error("Response Status:", error.response.status);
            }
            const errMsg = error.response?.data?.message || `Failed to update profile (${error.response?.status || 'Unknown Status'})`;
            alert(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e, target) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTempImageSrc(url);
            setCropTarget(target);
            setShowCropper(true);
            e.target.value = null; // reset input
        }
    };

    // Alias for deprecated handlePhotoChange to keep compatibility if I missed any usage (optional)
    const handlePhotoChange = (e) => handleImageSelect(e, 'profile');

    const handleCropComplete = (croppedBlob) => {
        const file = new File([croppedBlob], `${cropTarget}_photo.jpg`, { type: "image/jpeg" });

        if (cropTarget === 'profile') {
            setProfileForm({ ...profileForm, profile_photo: file });
            setProfilePreview(URL.createObjectURL(croppedBlob));
        } else if (cropTarget === 'team') {
            setTeamForm({ ...teamForm, image: file });
            setTeamImagePreview(URL.createObjectURL(croppedBlob));
        } else if (cropTarget === 'settings') {
            setHomepageSettings(prev => ({
                ...prev,
                file: file,
                previewUrl: URL.createObjectURL(croppedBlob)
            }));
        }

        setShowCropper(false);
        setTempImageSrc(null);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImageSrc(null);
    };

    const pendingRequests = authorRequests.filter(r => r.status === 'pending');

    const PaginationControls = ({ currentPage, totalPages, setPage }) => (
        <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
            <button
                disabled={currentPage === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-white border rounded hover:bg-slate-50 disabled:opacity-50"
            >
                Previous
            </button>
            <span className="text-sm font-medium text-slate-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 bg-white border rounded hover:bg-slate-50 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="bg-slate-900 dark:bg-slate-950 text-white shadow-md border-b border-slate-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-serif font-bold flex items-center truncate max-w-[200px] md:max-w-none">
                        <Shield className="w-6 h-6 mr-2 text-primary-400 shrink-0" />
                        {user?.role === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}
                    </h1>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            {user?.profile_photo ? (
                                <img
                                    src={user.profile_photo.startsWith('http') ? user.profile_photo : user.profile_photo}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="text-sm hidden md:block">
                                <div className="font-semibold max-w-[150px] truncate" title={user?.name}>{user?.name}</div>
                                <div className="text-slate-400 capitalize">{user?.role}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={user}
                    logout={logout}
                    pendingRequestsCount={pendingRequests.length}
                />

                {/* Main Content Area */}
                <main className="flex-1">
                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors">
                            <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                    <Settings className="w-5 h-5 mr-2" /> Homepage Settings
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage the hero section background and text.</p>
                            </div>

                            <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl">
                                {/* Text Content */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headline (HTML Allowed)</label>
                                        <input
                                            type="text"
                                            value={homepageSettings.headline}
                                            onChange={(e) => setHomepageSettings({ ...homepageSettings, headline: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g. Decoding the Law..."
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Use <code>&lt;span class="text-amber-400"&gt;text&lt;/span&gt;</code> for highlight colors.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subheadline</label>
                                        <textarea
                                            value={homepageSettings.subheadline}
                                            onChange={(e) => setHomepageSettings({ ...homepageSettings, subheadline: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CTA Button Text</label>
                                        <input
                                            type="text"
                                            value={homepageSettings.cta_text}
                                            onChange={(e) => setHomepageSettings({ ...homepageSettings, cta_text: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Media Settings */}
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Background Media</h3>

                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="bg_type"
                                                value="image"
                                                checked={homepageSettings.background_type === 'image'}
                                                onChange={() => setHomepageSettings({ ...homepageSettings, background_type: 'image' })}
                                                className="form-radio text-primary-600"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">Image</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="bg_type"
                                                value="video"
                                                checked={homepageSettings.background_type === 'video'}
                                                onChange={() => setHomepageSettings({ ...homepageSettings, background_type: 'video' })}
                                                className="form-radio text-primary-600"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">Video</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload File</label>
                                        <div className="flex items-center space-x-4">
                                            <label className="cursor-pointer btn-secondary">
                                                <Camera className="w-4 h-4 mr-2 inline" /> Choose File
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept={homepageSettings.background_type === 'image' ? "image/*" : "video/mp4,video/webm"}
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (homepageSettings.background_type === 'image') {
                                                                handleImageSelect(e, 'settings');
                                                            } else {
                                                                setHomepageSettings({
                                                                    ...homepageSettings,
                                                                    file: file,
                                                                    previewUrl: URL.createObjectURL(file)
                                                                });
                                                            }
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <span className="text-sm text-slate-500">{homepageSettings.file ? homepageSettings.file.name : 'No file chosen'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Overlay Opacity: {homepageSettings.overlay_opacity}
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.1"
                                            value={homepageSettings.overlay_opacity}
                                            onChange={(e) => setHomepageSettings({ ...homepageSettings, overlay_opacity: parseFloat(e.target.value) })}
                                            className="w-full accent-primary-600"
                                        />
                                    </div>

                                    {/* Preview */}
                                    {homepageSettings.previewUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative h-48 bg-slate-100 dark:bg-slate-800">
                                            {homepageSettings.background_type === 'image' ? (
                                                <img src={homepageSettings.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={homepageSettings.previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                            )}
                                            <div className="absolute inset-0 bg-slate-900 pointer-events-none" style={{ opacity: homepageSettings.overlay_opacity }}></div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
                                                <div>
                                                    <h1 className="text-xl font-bold text-white mb-2" dangerouslySetInnerHTML={{ __html: homepageSettings.headline }}></h1>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {user?.role === 'author' && (
                                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Recent Blogs</h2>
                                        <Link to="/admin/create-blog" className="btn-primary flex items-center text-sm">
                                            <Plus className="w-4 h-4 mr-1" /> Create New Post
                                        </Link>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="px-6 py-3">Title</th>
                                                    <th className="px-6 py-3">Category</th>
                                                    <th className="px-6 py-3">Date</th>
                                                    <th className="px-6 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {blogs.data.slice(0, 5).map(blog => (
                                                    <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{blog.title}</td>
                                                        <td className="px-6 py-4">{blog.category_name || '-'}</td>
                                                        <td className="px-6 py-4">{new Date(blog.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 flex space-x-3">
                                                            <Link to={`/admin/edit-blog/${blog.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><Edit className="w-4 h-4" /></Link>
                                                            <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {blogs.data.length === 0 && (
                                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">You haven't written any blogs yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {blogs.data.length > 0 && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 text-center">
                                            <button onClick={() => setActiveTab('blogs')} className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm">View All My Blogs</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {user?.role === 'admin' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        onClick={() => setActiveTab('blogs')}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center cursor-pointer hover:shadow-md dark:hover:bg-slate-800 transition-all"
                                    >
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mr-4"><FileText className="w-6 h-6" /></div>
                                        <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Blogs</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBlogs}</p></div>
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('users')}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center cursor-pointer hover:shadow-md dark:hover:bg-slate-800 transition-all"
                                    >
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mr-4"><Users className="w-6 h-6" /></div>
                                        <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p></div>
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('comments')}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center cursor-pointer hover:shadow-md dark:hover:bg-slate-800 transition-all"
                                    >
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mr-4"><MessageSquare className="w-6 h-6" /></div>
                                        <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Comments</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalComments}</p></div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Quick Actions</h2>
                                <Link to="/admin/create-blog" className="btn-primary inline-flex items-center">
                                    <Plus className="w-4 h-4 mr-2" /> Write New Article
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* BLOGS TAB */}
                    {activeTab === 'blogs' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Blogs</h2>
                                <Link to="/admin/create-blog" className="btn-primary flex items-center text-sm">
                                    <Plus className="w-4 h-4 mr-1" /> Create New Post
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3">Title</th>
                                            <th className="px-6 py-3">Category</th>
                                            <th className="px-6 py-3">Author</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {blogs.data.map(blog => (
                                            <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate" title={blog.title}>{blog.title}</td>
                                                <td className="px-6 py-4">{blog.category_name || '-'}</td>
                                                <td className="px-6 py-4">{blog.author_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                        blog.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                            blog.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                        {blog.status === 'draft' ? 'Draft' :
                                                            blog.status === 'pending' ? 'Pending Review' :
                                                                blog.status === 'published' ? 'Published' :
                                                                    blog.status === 'rejected' ? 'Rejected' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{new Date(blog.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex items-center space-x-3">
                                                    <Link to={`/admin/edit-blog/${blog.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit"><Edit className="w-4 h-4" /></Link>
                                                    <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" title="Delete"><Trash2 className="w-4 h-4" /></button>

                                                    {/* Admin Review Actions */}
                                                    {user.role === 'admin' && (blog.status === 'pending' || blog.status === 'draft') && (
                                                        <div className="flex gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('Are you sure you want to approve and publish this blog?')) {
                                                                        await api.put(`/blogs/${blog.id}/review`, { action: 'approve' });
                                                                        fetchData();
                                                                    }
                                                                }}
                                                                className="text-green-600 hover:text-green-800" title="Approve & Publish"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequest({ id: blog.id, type: 'blog' });
                                                                    setShowRejectModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-800" title="Reject"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {blogs.data.length === 0 && (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No blogs found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {user?.role === 'admin' && blogs.totalPages > 1 && (
                                <PaginationControls
                                    currentPage={blogs.currentPage}
                                    totalPages={blogs.totalPages}
                                    setPage={setPageBlogs}
                                />
                            )}
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {usersList.data.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name}</td>
                                                <td className="px-6 py-4">{u.email}</td>
                                                <td className="px-6 py-4 capitalize">{u.role}</td>
                                                <td className="px-6 py-4">
                                                    {u.is_blocked ? (
                                                        <span className="text-red-500 font-semibold flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded w-fit">
                                                            <Lock className="w-3 h-3 mr-1" /> Inactive
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 font-semibold flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleViewUser(u.id)}
                                                        className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockUser(u)}
                                                        className={`${u.is_blocked ? 'text-green-600 hover:text-green-700' : 'text-slate-500 hover:text-red-600'} hover:underline text-xs font-semibold flex items-center border border-current px-2 py-1 rounded`}
                                                    >
                                                        {u.is_blocked ? 'Remove Block' : 'Block'}
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm("Are you sure you want to permanently delete this user?\nThis action is irreversible and will remove the user from authentication, database, and all associated records.")) {
                                                                try {
                                                                    await userService.deleteUser(u.id);
                                                                    // Refresh list
                                                                    setUsersList(prev => ({ ...prev, data: prev.data.filter(user => user.id !== u.id) }));
                                                                    alert("User permanently deleted.");
                                                                } catch (error) {
                                                                    alert(error.response?.data?.message || 'Failed to delete user');
                                                                }
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 title='Delete User'"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    {/* Role Change Logic (Hidden for simplicity as per requirements emphasis, but keeping if needed) */}
                                                    {/* The user didn't ask to remove role changing, just to add delete/block. keeping role change is fine. */}
                                                    {u.role !== 'admin' && ( // Redundant check since admins are filtered out, but safe
                                                        <div className="relative group">
                                                            <button className="text-blue-600 text-xs hover:underline">Change Role</button>
                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded border border-slate-200 dark:border-slate-700 p-1 z-10 w-32">
                                                                <button onClick={() => handleChangeRole(u, 'author')} className="text-left px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs">Author</button>
                                                                <button onClick={() => handleChangeRole(u, 'reader')} className="text-left px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs">Reader</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {usersList.totalPages > 1 && (
                                <PaginationControls
                                    currentPage={usersList.currentPage}
                                    totalPages={usersList.totalPages}
                                    setPage={setPageUsers}
                                />
                            )}
                        </div>
                    )}

                    {/* COMMENTS TAB */}
                    {activeTab === 'comments' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comments</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3">Content</th>
                                            <th className="px-6 py-3">Author</th>
                                            <th className="px-6 py-3">Blog</th>
                                            <th className="px-6 py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {commentsList.data.map(comment => (
                                            <tr key={comment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 max-w-xs truncate">{comment.content}</td>
                                                <td className="px-6 py-4">
                                                    {comment.user_name || comment.guest_name}
                                                    {comment.guest_email && <div className="text-xs text-slate-400 dark:text-slate-500">({comment.guest_email})</div>}
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate">{comment.blog_title}</td>
                                                <td className="px-6 py-4">{new Date(comment.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {commentsList.data.length === 0 && (
                                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No comments found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {commentsList.totalPages > 1 && (
                                <PaginationControls
                                    currentPage={commentsList.currentPage}
                                    totalPages={commentsList.totalPages}
                                    setPage={setPageComments}
                                />
                            )}
                        </div>
                    )}

                    {/* CATEGORIES TAB */}
                    {activeTab === 'categories' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Categories</h2>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Categories</h2>
                                <button onClick={() => setCategoryForm({ show: true, mode: 'add', name: '', id: null, parent_id: '' })} className="btn-primary text-sm flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Category
                                </button>
                            </div>

                            {categoryForm.show && (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <form onSubmit={handleCategorySubmit} className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category Name</label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                                                value={categoryForm.name}
                                                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Parent Category (Optional)</label>
                                            <select
                                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                                                value={categoryForm.parent_id}
                                                onChange={e => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                                            >
                                                <option value="">None (Main Category)</option>
                                                {categories.filter(c => !c.parent_id && c.id !== categoryForm.id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="btn-primary whitespace-nowrap">Save</button>
                                            <button type="button" onClick={() => setCategoryForm({ ...categoryForm, show: false })} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Slug</th>
                                            <th className="px-6 py-3">Parent</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {categories
                                            .sort((a, b) => (a.parent_id || 0) - (b.parent_id || 0)) // Sort parents first roughly
                                            .map(c => {
                                                const parent = categories.find(p => p.id === c.parent_id);
                                                return (
                                                    <tr key={c.id}>
                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                            {c.parent_id && <span className="text-slate-400 mr-2">↳</span>}
                                                            {c.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{c.slug}</td>
                                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                            {parent ? <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">{parent.name}</span> : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 flex space-x-3">
                                                            <button onClick={() => setCategoryForm({ show: true, mode: 'edit', id: c.id, name: c.name, parent_id: c.parent_id || '' })} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* REQUESTS TAB */}
                    {activeTab === 'requests' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Author Requests</h2>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {authorRequests.map(request => (
                                    <div key={request.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center mb-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white mr-2">{request.name}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${!request.status ? 'bg-gray-100 text-gray-700' :
                                                            request.status.toLowerCase() === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                                request.status.toLowerCase() === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                                    request.status.toLowerCase() === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                        'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {request.status ? request.status.toUpperCase() : 'UNKNOWN'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{request.email}</p>
                                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 text-sm mb-2 text-slate-700 dark:text-slate-300">
                                                    <span className="font-medium">Reason: </span> {request.reason}
                                                </div>
                                                {request.social_link && (
                                                    <a href={request.social_link} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View Social Profile</a>
                                                )}
                                            </div>
                                            {request.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleApproveRequest(request.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors">Approve</button>
                                                    <button onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {authorRequests.length === 0 && <p className="p-6 text-center text-slate-500 dark:text-slate-400">No requests.</p>}
                            </div>
                        </div>
                    )}
                    {/* MESSAGES TAB */}
                    {activeTab === 'messages' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Messages</h2>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {messages.map(msg => (
                                    <div key={msg.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{msg.first_name} {msg.last_name}</h3>
                                                <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{msg.email}</a>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                            {msg.message}
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Delete message?')) {
                                                        await api.delete(`/contact/${msg.id}`);
                                                        setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                    }
                                                }}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs flex items-center"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && <p className="p-6 text-center text-slate-500 dark:text-slate-400">No messages found.</p>}
                            </div>
                        </div>
                    )}

                    {/* TEAM TAB */}
                    {activeTab === 'team' && user?.role === 'admin' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Team</h2>
                                <button
                                    onClick={() => {
                                        setTeamForm({
                                            show: true, mode: 'add', id: null,
                                            name: '', role: '', bio: '',
                                            social_email: '', social_links: [],
                                            image: null
                                        });
                                        setTeamImagePreview(null);
                                    }}
                                    className="btn-primary text-sm flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Member
                                </button>
                            </div>

                            {teamForm.show && (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <form onSubmit={handleTeamSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2"
                                                    value={teamForm.name}
                                                    onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Role</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2"
                                                    value={teamForm.role}
                                                    onChange={e => setTeamForm({ ...teamForm, role: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Bio</label>
                                            <textarea
                                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2 h-20"
                                                value={teamForm.bio}
                                                onChange={e => setTeamForm({ ...teamForm, bio: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email (Public)</label>
                                                <input
                                                    type="email"
                                                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2"
                                                    value={teamForm.social_email}
                                                    onChange={e => setTeamForm({ ...teamForm, social_email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Dynamic Social Links */}
                                        <div className="space-y-3 bg-slate-100 dark:bg-slate-700/30 p-4 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Social Media Links</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setTeamForm(prev => ({ ...prev, social_links: [...prev.social_links, { platform: 'LinkedIn', url: '' }] }))}
                                                    className="text-xs btn-secondary px-2 py-1 flex items-center"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Add Link
                                                </button>
                                            </div>

                                            {teamForm.social_links.map((link, idx) => (
                                                <div key={idx} className="flex gap-2 items-start">
                                                    <select
                                                        className="w-1/3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-2 py-2 text-sm"
                                                        value={link.platform}
                                                        onChange={(e) => {
                                                            const newLinks = [...teamForm.social_links];
                                                            newLinks[idx].platform = e.target.value;
                                                            setTeamForm({ ...teamForm, social_links: newLinks });
                                                        }}
                                                    >
                                                        <option value="LinkedIn">LinkedIn</option>
                                                        <option value="Twitter">Twitter/X</option>
                                                        <option value="Facebook">Facebook</option>
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="YouTube">YouTube</option>
                                                        <option value="Website">Website</option>
                                                        <option value="GitHub">GitHub</option>
                                                    </select>
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-3 py-2 text-sm"
                                                        value={link.url}
                                                        onChange={(e) => {
                                                            const newLinks = [...teamForm.social_links];
                                                            newLinks[idx].url = e.target.value;
                                                            setTeamForm({ ...teamForm, social_links: newLinks });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newLinks = teamForm.social_links.filter((_, i) => i !== idx);
                                                            setTeamForm({ ...teamForm, social_links: newLinks });
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {teamForm.social_links.length === 0 && <p className="text-xs text-slate-500 italic">No social links added.</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Image</label>
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0">
                                                    {teamImagePreview ? (
                                                        <img src={teamImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full text-slate-400">
                                                            <Users className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label htmlFor="team-image-upload" className="cursor-pointer btn-secondary text-sm px-3 py-1.5 flex items-center">
                                                        <Camera className="w-4 h-4 mr-2" />
                                                        {teamImagePreview ? 'Change Photo' : 'Upload Photo'}
                                                    </label>
                                                    <input
                                                        id="team-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageSelect(e, 'team')}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Click to crop and upload.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setTeamForm({ ...teamForm, show: false })}
                                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            >Cancel</button>
                                            <button type="submit" className="btn-primary">Save Member</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {member.image ? (
                                                <img src={member.image.startsWith('http') ? member.image : member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-lg">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => {
                                                    setTeamForm({
                                                        show: true,
                                                        mode: 'edit',
                                                        id: member.id,
                                                        name: member.name,
                                                        role: member.role,
                                                        bio: member.bio || '',
                                                        social_email: member.social_email || '',
                                                        social_links: typeof member.social_links === 'string' ? JSON.parse(member.social_links) : (member.social_links || []),
                                                        image: null
                                                    });
                                                    setTeamImagePreview(member.image ? (member.image.startsWith('http') ? member.image : member.image) : null);
                                                }}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTeamMember(member.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {teamMembers.length === 0 && <p className="p-6 text-center text-slate-500 dark:text-slate-400">No team members added yet.</p>}
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'about' && user?.role === 'admin' && (
                        <EditAbout />
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden max-w-2xl mx-auto transition-colors">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                            </div>
                            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                                {/* Photo Upload */}
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                                <Users className="w-10 h-10" />
                                            </div>
                                        )}
                                        <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
                                            <Camera className="w-4 h-4" />
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageSelect(e, 'profile')}
                                            className="hidden"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email Address (Read-only)</label>
                                        <input
                                            type="email"
                                            className="w-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded px-3 py-2 cursor-not-allowed"
                                            value={profileForm.email}
                                            disabled
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Username (Unique URL)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                            value={profileForm.username}
                                            onChange={e => setProfileForm({ ...profileForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                            placeholder="username"
                                            required
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Your profile will be: /author/{profileForm.username || 'username'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                                value={profileForm.phone}
                                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Current Position / Role</label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                                value={profileForm.position}
                                                onChange={e => setProfileForm({ ...profileForm, position: e.target.value })}
                                                placeholder="e.g. Legal Associate, Law Student"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">College / Institution</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                            value={profileForm.college}
                                            onChange={e => setProfileForm({ ...profileForm, college: e.target.value })}
                                            placeholder="e.g. National Law University, Delhi"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Bio / About Me</label>
                                        <textarea
                                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                            rows="4"
                                            value={profileForm.bio}
                                            onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                                            placeholder="Tell us a bit about yourself..."
                                        ></textarea>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <h4 className="font-medium text-slate-900 dark:text-white mb-4">Social Media Links (Min 2)</h4>

                                        {/* List of Added Links */}
                                        <div className="space-y-3 mb-4">
                                            {profileForm.social_links && profileForm.social_links.map((link, index) => (
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
                                        {(!profileForm.social_links || profileForm.social_links.length < 5) && (
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed">
                                                <div className="md:col-span-4">
                                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Platform</label>
                                                    <select
                                                        value={newLink.platform}
                                                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                                                            try { new URL(url); } catch (_) { return alert("Invalid URL"); }

                                                            const currentLinks = profileForm.social_links || [];
                                                            if (currentLinks.some(l => l.platform === platform)) return alert("Platform already added");

                                                            setProfileForm({
                                                                ...profileForm,
                                                                social_links: [...currentLinks, { platform, url }]
                                                            });
                                                            setNewLink({ ...newLink, url: '' });
                                                        }}
                                                        className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {profileForm.social_links && profileForm.social_links.length < 2 && (
                                            <p className="text-xs text-red-500 mt-2 font-medium">Please add at least 2 social media links.</p>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <h4 className="font-medium text-slate-900 dark:text-white mb-4">Change Password (Optional)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                                    value={profileForm.password}
                                                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-3 py-2 focus:ring focus:ring-blue-200 transition-colors"
                                                    value={profileForm.confirmPassword}
                                                    onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-8 py-2 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </main>
            </div >

            {/* Reject Modal */}
            {
                showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Reject {selectedRequest?.type === 'blog' ? 'Blog' : 'Application'}</h2>
                            <form onSubmit={handleRejectSubmit}>
                                <textarea
                                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 mb-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                    rows="4"
                                    placeholder="Rejection reason..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    required
                                ></textarea>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(false)}
                                        className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Logout Confirmation Modal */}
            {
                showLogoutConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                            <h2 className="text-xl font-bold mb-3 font-serif text-slate-900 dark:text-white">Confirm Logout</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to logout and leave the dashboard?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Image Cropper Modal */}
            {
                showCropper && tempImageSrc && (
                    <ImageCropper
                        imageSrc={tempImageSrc}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                        aspect={cropTarget === 'settings' ? 16 / 9 : 1}
                    />
                )
            }

            {/* User Details Modal */}
            <UserDetailsModal
                isOpen={isUserDetailsOpen}
                onClose={() => setIsUserDetailsOpen(false)}
                user={selectedUser}
                loading={userDetailsLoading}
            />
        </div >
    );
};

export default AdminDashboard;
