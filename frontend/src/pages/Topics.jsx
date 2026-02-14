import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Hash } from 'lucide-react';

const Topics = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupedBlogs, setGroupedBlogs] = useState({});

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs'); // Assuming this returns all blogs
                const allBlogs = response.data;

                // Sort alphabetically by title
                allBlogs.sort((a, b) => a.title.localeCompare(b.title));

                // Group by first letter
                const grouped = allBlogs.reduce((acc, blog) => {
                    const firstLetter = blog.title.charAt(0).toUpperCase();
                    if (!acc[firstLetter]) acc[firstLetter] = [];
                    acc[firstLetter].push(blog);
                    return acc;
                }, {});

                setBlogs(allBlogs);
                setGroupedBlogs(grouped);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching blogs for topics:", error);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">Topics A-Z</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Browse all our legal resources alphabetically.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div>
                        {/* Alphabet Filter */}
                        <div className="flex flex-wrap justify-center gap-2 mb-16 sticky top-20 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm py-4 z-10">
                            {alphabet.map(letter => (
                                <a
                                    key={letter}
                                    href={`#${letter}`}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${groupedBlogs[letter]
                                            ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600'
                                            : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                        }`}
                                >
                                    {letter}
                                </a>
                            ))}
                        </div>

                        {/* Grouped Content */}
                        <div className="space-y-12">
                            {Object.keys(groupedBlogs).sort().map(letter => (
                                <div key={letter} id={letter} className="scroll-mt-32">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl">
                                            {letter}
                                        </h2>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groupedBlogs[letter].map(blog => (
                                            <Link
                                                key={blog.id}
                                                to={`/blogs/id/${blog.id}`}
                                                className="group block bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 hover:shadow-md transition-all"
                                            >
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors mb-2">
                                                    {blog.title}
                                                </h3>
                                                <div className="flex items-center text-xs text-slate-500 gap-2">
                                                    <span className="uppercase tracking-wider">{blog.category_name || 'Legal'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {Object.keys(groupedBlogs).length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                No topics found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topics;
