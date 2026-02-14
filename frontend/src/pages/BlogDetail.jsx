import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import blogService from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';

import SEO from '../components/SEO';

const BlogDetail = () => {
    const { id } = useParams();
    // ... existing initialization ...
    const { user } = useAuth();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentData, setCommentData] = useState({ content: '', guestName: '', guestEmail: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchBlogAndComments = async () => {
            try {
                const blogRes = await blogService.getBlogById(id);
                setBlog(blogRes);

                // Fetch comments independently
                const commentsRes = await api.get(`/comments/${blogRes.id}`);
                setComments(commentsRes.data);
            } catch (error) {
                console.error("Error fetching blog/comments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogAndComments();
    }, [id]);

    // ... existing handleCommentSubmit ...
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/comments', {
                ...commentData,
                blogId: blog.id
            });

            // Refresh comments
            const commentsRes = await api.get(`/comments/${blog.id}`);
            setComments(commentsRes.data);

            // Reset form (keep email/name if guest? Maybe reset content only)
            setCommentData(prev => ({ ...prev, content: '' }));
            alert('Comment submitted!');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to submit comment';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!blog) return <div className="text-center py-20">Blog not found</div>;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        if (path.startsWith('blob:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${cleanPath}`;
    };

    const imagePath = blog.image || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
    const imageUrl = getImageUrl(imagePath);

    // Normalize authors list
    const primaryAuthor = {
        id: blog.author_id,
        name: blog.author_name,
        profile_photo: blog.author_photo,
        role: blog.author_role || 'Author',
        college: blog.author_college,
        isPrimary: true
    };

    // Combine primary with co-authors, ensuring unique IDs just in case
    const coAuthors = blog.co_author_details || [];
    const allAuthors = [primaryAuthor, ...coAuthors.filter(ca => ca.id !== primaryAuthor.id)];

    // Strip HTML from content for meta description
    const plainTextDescription = blog.content ? DOMPurify.sanitize(blog.content, { ALLOWED_TAGS: [] }).substring(0, 160) : '';

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen pb-20 transition-colors duration-300">
            <SEO
                title={blog.title}
                description={plainTextDescription}
                image={imageUrl}
                url={`/blogs/id/${blog.id}`}
                type="article"
            />
            {/* Header / Hero */}
            <div className="w-full text-center py-10 container mx-auto px-4 max-w-4xl">
                <Link to="/blogs" className="inline-flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
                </Link>
                {blog.category_name && (
                    <div className="flex justify-center mb-4">
                        <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                            {blog.category_name}
                        </span>
                    </div>
                )}
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight mb-8">
                    {blog.title}
                </h1>

                {/* Author Section */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 border-t border-b border-slate-200 dark:border-slate-800 py-6">
                    {allAuthors.map(author => (
                        <Link
                            key={author.id}
                            to={`/author/${author.id}`}
                            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 ring-1 ring-transparent hover:ring-slate-200 dark:hover:ring-slate-700"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-primary-200 dark:group-hover:ring-primary-900 transition-all">
                                    {author.profile_photo ? (
                                        <img
                                            src={getImageUrl(author.profile_photo)}
                                            alt={author.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-lg uppercase">
                                            {author.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary-700 dark:group-hover:text-primary-400 decoration-primary-300 underline-offset-2 group-hover:underline transition-all">
                                    {author.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {author.isPrimary ? 'Author' : (author.role || author.college || 'Contributor')}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Metadata Separator (only if authors exist) */}
                    <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                    {/* Date & Time */}
                    <div className="text-left flex flex-col justify-center">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(blog.created_at || blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                            {Math.ceil(blog.content?.length / 1000) || 5} min read
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="container mx-auto px-4 max-w-5xl mb-12">
                <div className="w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-lg">
                    <img src={imageUrl} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 max-w-4xl">
                {/* Content */}
                <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    <div className="font-serif text-slate-800 dark:text-slate-200 leading-relaxed">
                        {(() => {
                            try {
                                const parsedContent = JSON.parse(blog.content);
                                if (Array.isArray(parsedContent)) {
                                    return parsedContent.map((block, index) => {
                                        if (block.type === 'text') {
                                            return (
                                                <div key={index} className="mb-6 blog-content-text prose prose-lg prose-slate dark:prose-invert max-w-none">
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content) }} />
                                                </div>
                                            );
                                        } else if (block.type === 'image') {
                                            return (
                                                <figure key={index} className="my-8">
                                                    <img src={block.url} alt={block.caption || 'Blog image'} className="rounded-lg shadow-sm w-full" />
                                                    {block.caption && <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2 italic">{block.caption}</figcaption>}
                                                </figure>
                                            );
                                        }
                                        return null;
                                    });
                                }
                                throw new Error('Not an array');
                            } catch (e) {
                                // Fallback for legacy content
                                return <div className="whitespace-pre-wrap prose prose-lg prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} />;
                            }
                        })()}
                    </div>
                </article>

                {/* Comments Section */}
                <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Comments ({comments.length})</h3>

                    <div className="space-y-6 mb-10">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center mb-2">
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {comment.user_name || comment.guest_name || 'Guest'}
                                        </div>
                                        <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 italic">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <h4 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Leave a Comment</h4>
                        <form onSubmit={handleCommentSubmit}>
                            {!user && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Name (Optional)"
                                        className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                                        value={commentData.guestName}
                                        onChange={(e) => setCommentData({ ...commentData, guestName: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email (Required)"
                                        className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                                        value={commentData.guestEmail}
                                        onChange={(e) => setCommentData({ ...commentData, guestEmail: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <textarea
                                className="w-full p-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-400 focus:outline-none h-32 mb-4 transition-colors"
                                placeholder="Write your comment here..."
                                value={commentData.content}
                                onChange={(e) => setCommentData({ ...commentData, content: e.target.value })}
                                required
                            ></textarea>
                            <button
                                type="submit"
                                className="btn-primary bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
