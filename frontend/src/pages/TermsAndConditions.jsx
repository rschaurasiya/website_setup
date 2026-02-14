import React from 'react';
import { Scale, CheckCircle, AlertCircle } from 'lucide-react';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-12 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                        <Scale className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                        Terms and Conditions
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        Please read these terms carefully before using LawBlog.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="p-8 md:p-12 space-y-8">

                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm mr-3">1</span>
                                Introduction
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Welcome to LawBlog. These Terms and Conditions govern your use of our website and services. By accessing or using LawBlog, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm mr-3">2</span>
                                Intellectual Property Rights
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                Other than the content you own, under these Terms, LawBlog and/or its licensors own all the intellectual property rights and materials contained in this Website.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                You are granted limited license only for purposes of viewing the material contained on this Website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm mr-3">3</span>
                                Restrictions
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                You are specifically restricted from all of the following:
                            </p>
                            <ul className="space-y-3 pl-4">
                                {[
                                    "Publishing any Website material in any other media without credit.",
                                    "Selling, sublicensing and/or otherwise commercializing any Website material.",
                                    "Publicly performing and/or showing any Website material.",
                                    "Using this Website in any way that is or may be damaging to this Website.",
                                    "Using this Website in any way that impacts user access to this Website."
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start text-slate-600 dark:text-slate-300">
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm mr-3">4</span>
                                Your Content
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                In these Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant LawBlog a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Your Content must be your own and must not be invading any third-party's rights. LawBlog reserves the right to remove any of Your Content from this Website at any time without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm mr-3">5</span>
                                No Warranties
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                This Website is provided "as is," with all faults, and LawBlog express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm mr-3">6</span>
                                Governing Law
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                These Terms will be governed by and interpreted in accordance with the laws of Nepal, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Nepal for the resolution of any disputes.
                            </p>
                        </section>

                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 text-center border-t border-slate-200 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-400">
                            If you have any questions about these Terms, please contact us at <a href="mailto:chaurasiyachand26@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">chaurasiyachand26@gmail.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
