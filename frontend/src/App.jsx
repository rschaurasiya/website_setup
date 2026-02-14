import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const CreateBlog = lazy(() => import('./pages/CreateBlog'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const RequestAuthor = lazy(() => import('./pages/RequestAuthor'));
const CreatorApplication = lazy(() => import('./pages/CreatorApplication'));
const ApplicationStatus = lazy(() => import('./pages/ApplicationStatus'));
const Terms = lazy(() => import('./pages/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const About = lazy(() => import('./pages/About'));
const ManageLegal = lazy(() => import('./pages/admin/ManageLegal'));
const OurTeam = lazy(() => import('./pages/OurTeam'));
const Authors = lazy(() => import('./pages/Authors'));
const Topics = lazy(() => import('./pages/Topics'));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'));

// Loading Fallback
const PageLoader = () => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
    </div>
);


// Smart Redirect Component for /dashboard
const DashboardRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return <PageLoader />;

    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'author') return <Navigate to={`/profile/${user.username}/dashboard`} replace />;
        // Readers or others go home
        return <Navigate to="/" replace />;
    }

    return <Navigate to="/?auth=login" replace />;
};

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <ThemeProvider>
                    <Router>
                        <div className="flex flex-col min-h-screen transition-colors duration-300">
                            <Navbar />
                            <main className="flex-grow relative">
                                <ErrorBoundary>
                                    <Suspense fallback={<PageLoader />}>
                                        <Routes>
                                            <Route path="/" element={
                                                <PublicRoute>
                                                    <Home />
                                                </PublicRoute>
                                            } />
                                            <Route path="/about" element={
                                                <PublicRoute>
                                                    <About />
                                                </PublicRoute>
                                            } />
                                            <Route path="/our-team" element={
                                                <PublicRoute>
                                                    <OurTeam />
                                                </PublicRoute>
                                            } />
                                            <Route path="/authors" element={
                                                <PublicRoute>
                                                    <Authors />
                                                </PublicRoute>
                                            } />
                                            <Route path="/author/:id" element={
                                                <PublicRoute>
                                                    <AuthorProfile />
                                                </PublicRoute>
                                            } />
                                            <Route path="/topics" element={
                                                <PublicRoute>
                                                    <Topics />
                                                </PublicRoute>
                                            } />
                                            <Route path="/contact" element={
                                                <PublicRoute>
                                                    <Contact />
                                                </PublicRoute>
                                            } />
                                            <Route path="/blogs" element={
                                                <PublicRoute>
                                                    <BlogList />
                                                </PublicRoute>
                                            } />
                                            <Route path="/blogs/id/:id" element={
                                                <PublicRoute>
                                                    <BlogDetail />
                                                </PublicRoute>
                                            } />

                                            {/* Creator Application Routes */}
                                            <Route path="/apply" element={
                                                <ProtectedRoute allowedRoles={['reader']}>
                                                    <CreatorApplication />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/application-status" element={
                                                <ProtectedRoute allowedRoles={['reader']}>
                                                    <ApplicationStatus />
                                                </ProtectedRoute>
                                            } />

                                            <Route path="/terms-and-conditions" element={
                                                <PublicRoute>
                                                    <Terms />
                                                </PublicRoute>
                                            } />
                                            <Route path="/privacy-policy" element={
                                                <PublicRoute>
                                                    <PrivacyPolicy />
                                                </PublicRoute>
                                            } />

                                            {/* Protected Routes */}
                                            <Route path="/admin" element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <AdminDashboard />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/profile/:username" element={
                                                <ProtectedRoute allowedRoles={['author']}>
                                                    <Navigate to="dashboard" replace />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/profile/:username/:tab" element={
                                                <ProtectedRoute allowedRoles={['author']}>
                                                    <UserDashboard />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/profile/:username/create-blog" element={
                                                <ProtectedRoute allowedRoles={['author']}>
                                                    <CreateBlog />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/profile/:username/edit-blog/:blogId" element={
                                                <ProtectedRoute allowedRoles={['author']}>
                                                    <CreateBlog />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/admin/legal" element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <ManageLegal />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/admin/create-blog" element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <CreateBlog />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/admin/edit-blog/:id" element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <CreateBlog />
                                                </ProtectedRoute>
                                            } />

                                            {/* DEPRECATED ROUTES REDIRECT */}
                                            <Route path="/become-creator" element={<Navigate to="/apply" replace />} />
                                            <Route path="/request-author" element={<Navigate to="/apply" replace />} />
                                            <Route path="/login" element={<Navigate to="/?auth=login" replace />} />

                                            <Route path="/dashboard" element={<DashboardRedirect />} />

                                        </Routes>
                                    </Suspense>
                                </ErrorBoundary>
                            </main>
                            <Footer />
                        </div>
                    </Router>
                </ThemeProvider>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
