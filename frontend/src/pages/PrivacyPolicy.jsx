import React, { useEffect, useState } from 'react';
import legalService from '../services/legalService';
import DOMPurify from 'dompurify';

const PrivacyPolicy = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrivacy = async () => {
            try {
                const data = await legalService.getLegalPage('privacy');
                setSections(data.sections || []);
            } catch (error) {
                console.error("Failed to load Privacy Policy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrivacy();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><div className="animate-spin w-10 h-10 border-b-2 border-primary-600 rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-600 dark:text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    {sections.map((section, idx) => (
                        <section key={idx} className="scroll-mt-24" id={`section-${idx}`}>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                                {section.title}
                            </h2>
                            <div
                                className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                            />
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
