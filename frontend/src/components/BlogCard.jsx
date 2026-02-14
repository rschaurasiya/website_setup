import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogCard = ({ blog }) => {
    // Helper to get full image URL
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        // If it's a blob (local preview), return as is
        if (path.startsWith('blob:')) return path;

        // Ensure path starts with / if relative
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        // Use environment variable or default to localhost:5000 if not set (or relative if proxy handles it)
        // Since we are fixing broken images, likely they are relative paths from backend
        // Assuming backend is on port 5000 based on standard setup or configured proxy
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${cleanPath}`;
    };

    // Default image if none provided
    const imagePath = blog.image || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
    const imageUrl = getImageUrl(imagePath);

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-lg flex flex-col h-full">
            <Link to={`/blogs/id/${blog.id}`} className="block relative aspect-[16/10] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={blog.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'; }}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-white text-sm font-medium flex items-center">
                        Read Article <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                </div>
            </Link>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4 text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    <span className="text-primary-600 dark:text-primary-400">
                        {blog.category_name || (blog.category ? blog.category.name : 'Legal')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>
                        {new Date(blog.created_at || blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                <h3 className="text-xl font-serif font-bold mb-3 text-slate-900 dark:text-white leading-snug group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                    <Link to={`/blogs/id/${blog.id}`}>
                        {blog.title}
                    </Link>
                </h3>

                <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
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
                                    // Find first text block
                                    const textBlock = parsed.find(block => block.type === 'text');
                                    contentHtml = textBlock ? textBlock.content : '';
                                } else {
                                    contentHtml = blog.content; // Legacy/String content
                                }
                            } catch (e) {
                                contentHtml = blog.content; // Raw content if not JSON
                            }

                            return stripHtml(contentHtml).substring(0, 150) + (contentHtml.length > 150 ? '...' : '');
                        } catch (e) {
                            return "Read more...";
                        }
                    })()}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <Link to={`/author/${blog.author_username || (blog.author?.username) || blog.author_id || (blog.author?.id)}`} className="flex items-center gap-2 group/author">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold overflow-hidden">
                                {(blog.author_photo || (blog.author?.profile_photo)) ? (
                                    <img
                                        src={getImageUrl(blog.author_photo || blog.author?.profile_photo)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = (blog.author_name || 'A').charAt(0); }}
                                    />
                                ) : (
                                    (blog.author_name || (blog.author ? blog.author.name : 'A')).charAt(0)
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/author:text-primary-600 transition-colors">
                                {blog.author_name || (blog.author ? blog.author.name : 'Admin')}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
