import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, Scale, BookOpen, User, LogOut, UserPlus, Settings, PenTool, Sun, Moon, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginModal from './LoginModal';
import AuthModal from './AuthModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Check for auth query param
    useEffect(() => {
        const authParam = searchParams.get('auth');
        if (authParam === 'login' && !user) {
            setIsLoginModalOpen(true);
        } else if (authParam === 'signup' && !user) {
            setIsSignupModalOpen(true);
        }
    }, [searchParams, user]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const openLogin = () => {
        setSearchParams({ auth: 'login' });
        // State will be updated by useEffect
    };

    const openSignup = () => {
        // Internal switch only - keeps URL as is (e.g. ?auth=login)
        setIsSignupModalOpen(true);
        setIsLoginModalOpen(false);
    };

    const closeAll = () => {
        setIsLoginModalOpen(false);
        setIsSignupModalOpen(false);
        // Clean up URL
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.delete('auth');
            return newParams;
        });
    };

    // Hide Navbar for Admin Dashboard / User Dashboard routes OR if user is logged in (Restrict Public Access)
    const isDashboardRoute = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/dashboard');

    if (isDashboardRoute || user) {
        return null;
    }

    return (
        <>
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <Scale className="h-8 w-8 text-primary-600" />
                                <span className="ml-2 text-xl font-serif font-bold text-slate-900 dark:text-white">LawBlog</span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:ml-6 md:flex md:items-center md:space-x-5">
                            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md font-medium transition-colors">Home</Link>
                            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md font-medium transition-colors">About</Link>
                            <div className="relative group">
                                <Link to="/blogs" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md font-medium transition-colors flex items-center">
                                    <BookOpen className="w-4 h-4 mr-1" />
                                    Blogs
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </Link>

                                {/* Dropdown Menu */}
                                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                                    <div className="py-2">
                                        <Link to="/blogs" className="block px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                                            All Posts
                                        </Link>

                                        {/* Law */}
                                        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Law</div>
                                        <Link to="/blogs?category=constitutional-law" className="block px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Constitutional Law</Link>
                                        <Link to="/blogs?category=criminal-law" className="block px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Criminal Law</Link>
                                        <Link to="/blogs?category=civil-law" className="block px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Civil Law</Link>

                                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                        {/* Legal Studies */}
                                        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Legal Studies</div>
                                        <Link to="/blogs?category=legal-research-methodology" className="block px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Legal Research</Link>
                                        <Link to="/blogs?category=moot-court-advocacy" className="block px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Moot Court</Link>

                                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                        {/* Political */}
                                        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Political & Social</div>
                                        <Link to="/blogs?category=political-analysis" className="block px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800">Political Analysis</Link>
                                    </div>
                                </div>
                            </div>
                            <Link to="/blogs" className="md:hidden text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md font-medium transition-colors">
                                <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-1" />
                                    Blogs
                                </div>
                            </Link>

                            <Link to="/contact" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md font-medium transition-colors">Contact</Link>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <div className="ml-4 flex items-center space-x-3 relative">
                                {!user ? (
                                    <>
                                        <button
                                            onClick={openLogin}
                                            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            aria-label="Login"
                                        >
                                            <User className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Author/Admin: Create Post */}
                                        {(user.role === 'author' || user.role === 'admin') && (
                                            <Link to="/admin/create-blog" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center">
                                                <PenTool className="w-4 h-4 mr-1" />
                                                Create Post
                                            </Link>
                                        )}

                                        {/* Reader: Request Author Access */}
                                        {user.role === 'reader' && (
                                            <button
                                                onClick={openLogin}
                                                className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
                                            >
                                                <UserPlus className="w-4 h-4 mr-1" />
                                                Become a Creator
                                            </button>
                                        )}

                                        {/* Admin: Dashboard */}
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center">
                                                <Settings className="w-4 h-4 mr-1" />
                                                Dashboard
                                            </Link>
                                        )}
                                        {user.role === 'author' && (
                                            <Link to={`/profile/${user.username}/dashboard`} className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center">
                                                <Settings className="w-4 h-4 mr-1" />
                                                Dashboard
                                            </Link>
                                        )}

                                        {/* Logout */}
                                        <button onClick={handleLogout} className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center">
                                            <LogOut className="w-4 h-4 mr-1" />
                                            Logout
                                        </button>

                                        <span className="text-sm text-slate-500 dark:text-slate-400">({user.name})</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button - Add Toggle here too or inside menu */}
                        <div className="flex items-center md:hidden gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {
                    isOpen && (
                        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>Home</Link>
                                <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>About</Link>
                                <Link to="/blogs" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>Blogs</Link>
                                <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>Contact</Link>

                                {!user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                toggleMenu();
                                                openLogin();
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => {
                                                toggleMenu();
                                                openLogin();
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            Become a Creator
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {(user.role === 'author' || user.role === 'admin') && (
                                            <Link to="/admin/create-blog" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>Create Post</Link>
                                        )}

                                        {user.role === 'reader' && (
                                            <button
                                                onClick={() => { toggleMenu(); openLogin(); }}
                                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                                Become a Creator
                                            </button>
                                        )}

                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>Dashboard</Link>
                                        )}
                                        {user.role === 'author' && (
                                            <Link to={`/profile/${user.id}/dashboard`} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={toggleMenu}>Dashboard</Link>
                                        )}

                                        <button onClick={() => { handleLogout(); toggleMenu(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800">Logout</button>
                                        <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Logged in as: {user.name}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                }
            </nav >
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeAll}
                onSwitchToSignup={openSignup}
            />
            <AuthModal
                isOpen={isSignupModalOpen}
                onClose={closeAll}
                onSwitchToLogin={openLogin}
                mode="signup"
            />
        </>
    );
};

export default Navbar;
