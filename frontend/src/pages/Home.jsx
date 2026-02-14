import React from 'react'; // Explicit React import for useState/useEffect
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExploreSection from '../components/ExploreSection';
import api from '../services/api';
import { stripHtml } from '../utils/textUtils';

const Home = () => {
    const [recentBlogs, setRecentBlogs] = React.useState([]);
    const [settings, setSettings] = React.useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Settings
                try {
                    const settingsRes = await api.get('/settings');
                    setSettings(settingsRes.data);
                } catch (e) {
                    console.error("Failed to fetch settings", e);
                }

                // Fetch Blogs
                const blogsRes = await fetch('/api/blogs');
                const blogsData = await blogsRes.json();
                setRecentBlogs(blogsData.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    // Default values if no settings found
    const heroHeadline = settings?.headline || 'Decoding the Law, <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Simplifying Justice</span>';
    const heroSubheadline = settings?.subheadline || 'A definitive resource for legal professionals and students. access in-depth analyses of the IPC, CrPC, Constitution, and landmark judicial precedents.';
    const heroCtaText = settings?.cta_text || 'Read Articles';
    const bgUrl = settings?.background_url ? (settings.background_url.startsWith('http') ? settings.background_url : settings.background_url) : 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';
    const bgType = settings?.background_type || 'image';
    const overlayOpacity = settings?.overlay_opacity !== undefined ? settings.overlay_opacity : 0.5;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
                {/* Background Media with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    {bgType === 'video' ? (
                        <video
                            src={bgUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={bgUrl}
                            alt="Law Background"
                            className="w-full h-full object-cover"
                        />
                    )}
                    {/* Dynamic Overlay + Standard Gradient */}
                    <div className="absolute inset-0 bg-slate-900" style={{ opacity: overlayOpacity }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900"></div>
                </div>

                <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
                    <div className="inline-block mb-4 px-4 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                        <span className="text-primary-400 font-medium text-sm tracking-wide uppercase">Premier Legal Insights Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight text-white leading-tight" dangerouslySetInnerHTML={{ __html: heroHeadline }}>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        {heroSubheadline}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/blogs" className="group btn-primary inline-flex items-center justify-center px-8 py-4 text-lg rounded-full shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 transition-all duration-300">
                            {heroCtaText}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/about" className="group inline-flex items-center justify-center px-8 py-4 text-lg rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white hover:bg-white/10 transition-all duration-300">
                            About Me
                        </Link>
                    </div>
                </div>
            </section>

            {/* Explore Section */}
            <ExploreSection />

            {/* Recent Posts Section */}
            <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300 border-t border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <span className="text-primary-600 dark:text-primary-400 font-semibold tracking-wider uppercase text-sm mb-2 block">Latest Updates</span>
                            <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-3">Recent Insights</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">Stay informed with our latest articles, case analyses, and legal updates.</p>
                        </div>
                        <Link to="/blogs" className="hidden sm:inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg group">
                            View All
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {recentBlogs.length > 0 ? (
                            recentBlogs.map((blog) => (
                                <Link to={`/blogs/id/${blog.id}`} key={blog.id} className="group cursor-pointer flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:border-primary-100 dark:hover:border-slate-700">
                                    <div className="aspect-w-16 aspect-h-9 bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10 duration-300"></div>
                                        <img
                                            src={blog.image || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'}
                                            alt={blog.title}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-bold rounded-full shadow-sm uppercase tracking-wide">
                                                {blog.category_name || 'Legal'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mb-3 space-x-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{blog.author_name || 'Admin'}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span>{new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                                            {blog.title}
                                        </h3>

                                        <div className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                                            {(() => {
                                                try {
                                                    let content = blog.content;
                                                    // Try to parse if it's a JSON string representing structured content
                                                    try {
                                                        const parsed = JSON.parse(blog.content);
                                                        if (Array.isArray(parsed)) {
                                                            const textBlock = parsed.find(b => b.type === 'text');
                                                            if (textBlock) content = textBlock.content;
                                                        }
                                                    } catch (e) {
                                                        // Not JSON, treat as string
                                                    }

                                                    // Strip HTML tags and decode entities
                                                    const cleanText = stripHtml(content);
                                                    return cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : '');
                                                } catch (e) {
                                                    console.error("Error processing blog content snippet:", e);
                                                    return 'View content...';
                                                }
                                            })()}
                                        </div>

                                        <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-700/50 flex items-center text-primary-600 dark:text-primary-400 text-sm font-semibold group/link">
                                            Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-slate-500 dark:text-slate-400">No recent posts found.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center sm:hidden">
                        <Link to="/blogs" className="btn-secondary w-full justify-center">View All Posts &rarr;</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
