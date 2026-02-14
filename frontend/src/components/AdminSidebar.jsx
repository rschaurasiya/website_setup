import React, { useState } from 'react';
import {
    LayoutDashboard, FileText, Users, UserPlus, Shield, User,
    MessageSquare, MessageCircle, List, Settings, Info, Scale,
    LogOut, ChevronDown, ChevronRight, Menu, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activeTab, setActiveTab, user, logout, pendingRequestsCount = 0 }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
    const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

    const NavItem = ({ id, label, icon: Icon, badge, onClick }) => {
        const isActive = activeTab === id;
        return (
            <button
                onClick={() => {
                    if (onClick) onClick();
                    else setActiveTab(id);
                    setIsMobileOpen(false); // Close mobile menu on select
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1
                    ${isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                    <span>{label}</span>
                </div>
                {badge > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {badge}
                    </span>
                )}
            </button>
        );
    };

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden mb-4">
                <button
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 shadow-sm w-full"
                >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    <span className="font-medium">Menu</span>
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-auto md:min-h-[calc(100vh-80px)]
                ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
            `}>
                <div className="h-full overflow-y-auto p-4 flex flex-col">

                    {/* Primary Features */}
                    <div className="space-y-1 mb-6">
                        <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors mb-2">
                            <Scale className="w-5 h-5" />
                            <span>Back to Home</span>
                        </Link>

                        <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main</h3>
                        <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
                        <NavItem id="blogs" label="Manage Blogs" icon={FileText} />

                        {user?.role === 'admin' && (
                            <>
                                <NavItem id="users" label="Users" icon={Users} />
                                <NavItem id="requests" label="Creator Requests" icon={UserPlus} badge={pendingRequestsCount} />
                                <NavItem id="team" label="Manage Team" icon={Shield} />
                            </>
                        )}
                        <NavItem id="profile" label="My Profile" icon={User} />
                    </div>

                    {/* Secondary Features (Collapsible) */}
                    {user?.role === 'admin' && (
                        <div className="space-y-1">
                            <button
                                onClick={toggleSettings}
                                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <span>Advanced & Settings</span>
                                {isSettingsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {/* Collapsible Content */}
                            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isSettingsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <NavItem id="messages" label="Messages" icon={MessageSquare} />
                                <NavItem id="comments" label="Comments" icon={MessageCircle} />
                                <NavItem id="categories" label="Categories" icon={List} />
                                <NavItem id="settings" label="Homepage Settings" icon={Settings} />
                                <NavItem id="about" label="Manage About Page" icon={Info} />
                                {/* Legal Pages is a Link, slightly different */}
                                <Link
                                    to="/admin/legal"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
                                >
                                    <Scale className="w-5 h-5 text-slate-400" />
                                    <span>Manage Legal Pages</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="flex-1"></div>

                    {/* Footer / Logout */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>

                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}
        </>
    );
};

export default AdminSidebar;
