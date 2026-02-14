import React, { useEffect, useState } from 'react';
import { Mail, Phone, ExternalLink, Linkedin, Facebook, Twitter, Instagram, Youtube, Github, CheckCircle2, Award, Users, BookOpen, ArrowRight, Globe } from 'lucide-react';
import aboutService from '../services/aboutService';
import teamService from '../services/teamService';
import DOMPurify from 'dompurify';

const About = () => {
    const [data, setData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]); // New state for dynamic team
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutResult, teamResult] = await Promise.all([
                    aboutService.getAboutData(),
                    teamService.getAllMembers()
                ]);
                setData(aboutResult);
                setTeamMembers(teamResult);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-950">
                <p className="text-slate-600 dark:text-slate-400">About page information is not yet available.</p>
            </div>
        );
    }

    // Helper to parser JSON fields if needed (though existing service might handle it, being safe)
    const parseField = (field) => {
        if (typeof field === 'string') {
            try { return JSON.parse(field); } catch (e) { return []; }
        }
        return field || [];
    };

    const sections = parseField(data.sections).filter(s => s.isVisible);
    const socialLinks = parseField(data.social_links);

    // Social Icon Helper
    const getSocialIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
        if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
        if (p.includes('twitter')) return <Twitter className="w-5 h-5" />;
        if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
        if (p.includes('youtube')) return <Youtube className="w-5 h-5" />;
        if (p.includes('github')) return <Github className="w-5 h-5" />;
        return <ExternalLink className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-300 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
            {/* Hero Section - Author Profile */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 -z-10 transform -skew-y-2 origin-top-left scale-110"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Profile Image */}
                        <div className="mb-10 relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 dark:opacity-40 animate-pulse"></div>
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                                <img
                                    src={data.image ? (data.image.startsWith('http') ? data.image : data.image) : 'https://via.placeholder.com/400x400'}
                                    alt={data.name}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                            {/* Social Icons - Floating below */}
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-xl border border-slate-100 dark:border-slate-700 z-10">
                                {(socialLinks || []).slice(0, 4).map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-slate-900 dark:text-slate-400 dark:hover:bg-primary-600 transition-all duration-300"
                                        title={link.platform}
                                    >
                                        {getSocialIcon(link.platform)}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Text Content */}
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight break-words">
                            {data.name}
                        </h1>
                        <p className="text-lg md:text-xl text-primary-700 dark:text-primary-400 font-medium mb-8 uppercase tracking-widest text-opacity-80 break-words">
                            {data.title}
                        </p>

                        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto leading-relaxed text-slate-600 dark:text-slate-300 break-words text-justify">
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.bio) }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Dynamic Sections (Experience, Education, etc.) */}
            {(() => {
                const validSections = sections.filter(section => {
                    if (!section.isVisible) return false;
                    if (section.type === 'cards') return section.items && section.items.length > 0;
                    const textContent = section.content.replace(/<[^>]*>/g, '').trim();
                    return textContent.length > 0;
                });

                if (validSections.length === 0) return null;

                return (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
                        {validSections.map((section, idx) => (
                            <section key={section.id} className={`max-w-6xl mx-auto ${idx % 2 === 0 ? '' : ''}`}>
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
                                            {section.title}
                                        </h2>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                    </div>

                                    {section.type === 'cards' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {(section.items || []).map((item) => (
                                                <div key={item.id} className="group flex bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 h-full">
                                                    {item.image && (
                                                        <div className="shrink-0 mr-6">
                                                            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
                                                                <img
                                                                    src={item.image.startsWith('http') ? item.image : item.image}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm break-words">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 columns-1 md:columns-2 gap-12 break-words text-justify"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                                        />
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>
                );
            })()}

            {/* Team Section */}
            {teamMembers.length > 0 && (
                <section className="bg-slate-50 dark:bg-slate-900/30 py-24 border-t border-slate-200 dark:border-slate-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="text-center mb-16 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                                The Legal Team
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                Meet the dedicated professionals behind our insights and analysis.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            {teamMembers.map(member => (
                                <div key={member.id} className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 group text-center flex flex-col items-center">

                                    {/* Circular Avatar - Contained Inside */}
                                    <div className="relative mb-6">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-200 dark:bg-slate-700 relative z-10 ring-1 ring-slate-100 dark:ring-slate-700">
                                            {member.image ? (
                                                <img
                                                    src={member.image.startsWith('http') ? member.image : member.image}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl font-serif">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Social Icons - Floating at bottom of avatar */}
                                        {member.social_links && (typeof member.social_links === 'string' ? JSON.parse(member.social_links) : member.social_links).length > 0 && (
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-full shadow-md border border-slate-100 dark:border-slate-700 whitespace-nowrap">
                                                {(typeof member.social_links === 'string' ? JSON.parse(member.social_links) : member.social_links).map((link, idx) => {
                                                    const Icon = {
                                                        'LinkedIn': Linkedin,
                                                        'Twitter': Twitter,
                                                        'Facebook': Facebook,
                                                        'Instagram': Instagram,
                                                        'YouTube': Youtube,
                                                        'GitHub': Github,
                                                        'Website': Globe
                                                    }[link.platform] || Globe;
                                                    return (
                                                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-slate-900 dark:text-slate-400 dark:hover:bg-primary-600 transition-all duration-300">
                                                            <Icon className="w-4 h-4" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-serif">{member.name}</h3>
                                        <p className="text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-4 inline-block px-4">{member.role}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-4 leading-relaxed break-words px-2">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default About;
