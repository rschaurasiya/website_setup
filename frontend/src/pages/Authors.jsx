import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { User, BookOpen, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe, Github } from 'lucide-react';

const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await api.get('/users/values/authors');
                setAuthors(response.data);
            } catch (error) {
                console.error("Failed to fetch authors", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">Our Authors</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Meet the voices behind our insightful articles and legal analysis.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-slate-500 dark:text-slate-400">Loading authors...</div>
                ) : authors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {authors.map((author) => (
                            <Link to={`/author/${author.username || author.id}`} key={author.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-slate-200 dark:border-slate-800 flex flex-col items-center p-8 text-center">
                                <div className="relative mb-8">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 group-hover:border-primary-100 dark:group-hover:border-primary-900/30 transition-colors">
                                        {author.profile_photo ? (
                                            <img
                                                src={author.profile_photo.startsWith('http') ? author.profile_photo : author.profile_photo}
                                                alt={author.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Social Media Links - Absolute Positioned at Bottom */}
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex justify-center gap-2 w-max z-10">
                                        {(author.social_links ? (typeof author.social_links === 'string' ? JSON.parse(author.social_links) : author.social_links) : []).map((link, idx) => {
                                            // Normalize platform string to handle case differences
                                            const platformKey = link.platform.toLowerCase();
                                            const Icon = {
                                                'linkedin': Linkedin,
                                                'twitter': Twitter,
                                                'facebook': Facebook,
                                                'instagram': Instagram,
                                                'youtube': Youtube,
                                                'github': Github,
                                                'website': Globe
                                            }[platformKey] || Globe;

                                            return (
                                                <a
                                                    key={idx}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-white dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-primary-600 dark:hover:bg-primary-600 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm transition-all duration-200 hover:-translate-y-1"
                                                    onClick={(e) => e.stopPropagation()} // Prevent navigation
                                                    title={link.platform}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{author.name}</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-4">{author.role}</p>

                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                                    {author.bio || "Contributing author sharing insights on legal matters."}
                                </p>

                                <div className="mt-auto flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <span>{author.article_count || 0} Articles</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Authors Yet</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            No information has been updated yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Authors;
