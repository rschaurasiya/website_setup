import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Using axios instance directly for user fetch
import blogService from '../services/blogService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Calendar, MapPin, Briefcase, BookOpen, Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';

const AuthorProfile = () => {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Author Public Profile
                // This supports both UUID and Username thanks to backend update
                const userRes = await api.get(`/users/${id}/profile`);
                setAuthor(userRes.data);

                // 2. Fetch Author's Blogs using the specific Author ID
                if (userRes.data && userRes.data.id) {
                    const blogRes = await blogService.getBlogs({ author: userRes.data.id });
                    setBlogs(blogRes.data || blogRes);
                }
            } catch (err) {
                console.error("Failed to load author profile", err);
                setError("Author not found or failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !author) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Author Not Found</h2>
                <Link to="/blogs" className="text-primary-600 hover:underline">Back to Blogs</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header / Profile Cover */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="flex-shrink-0 group relative z-10">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 relative z-10">
                                {author.profile_photo ? (
                                    <img
                                        src={author.profile_photo.startsWith('http') ? author.profile_photo : author.profile_photo}
                                        alt={author.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                                        {author.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Social Media Links - Overlapping Bottom with Hover Effect */}
                            {author.social_links && author.social_links.length > 0 && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    {author.social_links.map((link, index) => {
                                        const platform = link.platform.toLowerCase();
                                        let Icon = User;
                                        // Colors can be kept or unified like OurTeam (slate-600 -> hover primary)
                                        // User asked to look "just like the team member", so I will use the OurTeam style primarily but keep the specific icons I already imported.

                                        if (platform === 'facebook') Icon = Facebook;
                                        else if (platform === 'instagram') Icon = Instagram;
                                        else if (platform === 'linkedin') Icon = Linkedin;
                                        else if (platform === 'youtube') Icon = Youtube;
                                        else if (platform === 'twitter') Icon = Twitter;

                                        return (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full shadow-md hover:bg-primary-600 hover:text-white transition-colors"
                                                title={link.platform}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-grow text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                                {author.name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                                {author.college && (
                                    <div className="flex items-center">
                                        <Briefcase className="w-4 h-4 mr-1" />
                                        {author.college}
                                    </div>
                                )}
                                {author.role && (
                                    <div className="flex items-center uppercase tracking-wider text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        {author.role}
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-1" />
                                    {blogs.length} Article{blogs.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {author.bio && (
                                <p className="text-slate-700 dark:text-slate-300 max-w-2xl text-lg leading-relaxed">
                                    {author.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Articles Section */}
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                    Articles from {author.name}
                </h2>

                {blogs.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 italic">No articles published yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                        {blogs.map(blog => (
                            <Link to={`/blogs/id/${blog.id}`} key={blog.id} className="group block bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                                        {blog.image ? (
                                            <img
                                                src={blog.image.startsWith('http') ? blog.image : blog.image}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                <span className="text-slate-400">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 md:w-2/3 flex flex-col justify-center">
                                        <div className="flex items-center text-xs text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wide">
                                            {blog.category_name || 'General'}
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                            {(() => {
                                                try {
                                                    // Helper to strip HTML and decode entities
                                                    const stripHtml = (html) => {
                                                        const doc = new DOMParser().parseFromString(html, 'text/html');
                                                        return doc.body.textContent || "";
                                                    };

                                                    let contentHtml = '';
                                                    try {
                                                        const parsed = JSON.parse(blog.content);
                                                        if (Array.isArray(parsed)) {
                                                            const textBlock = parsed.find(block => block.type === 'text');
                                                            contentHtml = textBlock ? textBlock.content : '';
                                                        } else {
                                                            contentHtml = blog.content;
                                                        }
                                                    } catch (e) {
                                                        contentHtml = blog.content;
                                                    }

                                                    return stripHtml(contentHtml).substring(0, 150) + (contentHtml.length > 150 ? '...' : '');
                                                } catch (e) {
                                                    return "Read more...";
                                                }
                                            })()}
                                        </p>
                                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-500 mt-auto">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorProfile;
