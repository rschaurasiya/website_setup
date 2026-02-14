import React, { useState, useEffect } from 'react';
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Globe, Github, Mail, Users } from 'lucide-react';
import teamService from '../services/teamService';

const OurTeam = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await teamService.getAllMembers();
                setTeamMembers(data);
            } catch (error) {
                console.error("Failed to fetch team members", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pt-24 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">Meet Our Experts</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Dedicated professionals committed to providing exceptional legal insights and services.
                    </p>
                </div>

                {loading ? (
                    <div className="min-h-[50vh] flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : teamMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                {/* Image Container with Social Overlay */}
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-lg mx-auto relative z-10 bg-slate-100 dark:bg-slate-800">
                                        {member.image ? (
                                            <img
                                                src={member.image.startsWith('http') ? member.image : member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                                                <Users className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Social Icons Overlay - Only showing if links exist */}
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        {(member.social_links ? (typeof member.social_links === 'string' ? JSON.parse(member.social_links) : member.social_links) : []).map((link, idx) => {
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
                                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full shadow-md hover:bg-primary-600 hover:text-white transition-colors">
                                                    <Icon className="w-4 h-4" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{member.name}</h3>
                                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3 uppercase tracking-wide">{member.role}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ongoing Updates</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            No information has been updated yet. Please check back later as we are building our team page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OurTeam;
