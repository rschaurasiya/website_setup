import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import blogService from '../services/blogService';
import BlogCard from '../components/BlogCard';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBlogs, setTotalBlogs] = useState(0);

    // Data for Dropdowns
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);

    // Fetch filters data on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const cats = await blogService.getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Error loading filters", err);
            }
        };
        fetchFilters();
    }, []);

    // Sync URL with Category State
    useEffect(() => {
        setSelectedCategory(searchParams.get('category') || '');
        setCurrentPage(1); // Reset page on category change
    }, [searchParams]);

    // Fetch Blogs with Filters
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const params = {
                    category: selectedCategory,
                    search: searchTerm,
                    date: selectedDate,
                    sort: sortOrder,
                    page: currentPage,
                    limit: 9
                };
                const data = await blogService.getBlogs(params);

                if (data.blogs && data.pagination) {
                    setBlogs(data.blogs);
                    setTotalPages(data.pagination.pages);
                    setTotalBlogs(data.pagination.total);
                } else if (Array.isArray(data)) {
                    setBlogs(data);
                    setTotalPages(1);
                    setTotalBlogs(data.length);
                }
            } catch (error) {
                console.error("Error fetching blogs", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchBlogs();
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedCategory, searchTerm, selectedDate, sortOrder, selectedAuthor, currentPage]);

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-20 pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                    <span className="text-primary-600 dark:text-primary-400 font-bold tracking-widest uppercase text-xs mb-4 block">
                        Our Latest Thoughts
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        Legal Insights & Analysis
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        Explore expert perspectives on the latest legal developments, case studies, and industry trends.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Unified Toolbar */}
                <div className="sticky top-4 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 mb-12 max-w-5xl mx-auto flex flex-col md:flex-row gap-2 transition-all duration-300">
                    {/* Search */}
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-500 focus:ring-0 text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-px md:h-auto md:w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                    {/* Filters Group */}
                    <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
                        {/* Category Select */}
                        <div className="relative min-w-[160px]">
                            <select
                                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    if (e.target.value === '') setSearchParams({});
                                    else setSearchParams({ category: e.target.value });
                                }}
                            >
                                <option value="">All Categories</option>
                                {categories.filter(c => !c.parent_id).map(mainCat => (
                                    <optgroup key={mainCat.id} label={mainCat.name}>
                                        <option value={mainCat.slug}>{mainCat.name} (All)</option>
                                        {categories
                                            .filter(sub => sub.parent_id === mainCat.id)
                                            .map(sub => (
                                                <option key={sub.id} value={sub.slug}>{sub.name}</option>
                                            ))
                                        }
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>

                        {/* Date Filter */}
                        <div className="relative min-w-[140px]">
                            <input
                                type="date"
                                className="w-full pl-4 pr-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        {/* Sort Select */}
                        <div className="relative min-w-[140px]">
                            <select
                                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Clear Button */}
                    {(searchTerm || selectedCategory || selectedDate || sortOrder !== 'newest') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('');
                                setSelectedDate('');
                                setSortOrder('newest');
                                setSearchParams({});
                            }}
                            className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Clear Filters"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden h-[450px]">
                                <div className="h-48 bg-slate-200 dark:bg-slate-800"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map(blog => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            We couldn't find any articles matching your search. Try adjusting your filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('');
                                setSelectedDate('');
                                setSortOrder('newest');
                                setSearchParams({});
                            }}
                            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
