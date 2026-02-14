import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Github, Linkedin, Twitter, Facebook, Shield, FileText } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-slate-900 dark:text-slate-100 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-8 after:h-0.5 after:bg-primary-500">Quick Links</h3>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60"></span>Home</Link></li>
                            <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60"></span>About Me</Link></li>
                            <li><Link to="/blogs" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60"></span>Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60"></span>Contact</Link></li>
                            <li><Link to="/?auth=login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60"></span>Become a Creator</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-slate-900 dark:text-slate-100 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-8 after:h-0.5 after:bg-primary-500">Categories</h3>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li><Link to="/blogs?category=criminal-law" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Criminal Law</Link></li>
                            <li><Link to="/blogs?category=civil-law" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Civil Law</Link></li>
                            <li><Link to="/blogs?category=constitution" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Constitution</Link></li>
                            <li><Link to="/blogs?category=case-studies" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Case Studies</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-slate-900 dark:text-slate-100 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-8 after:h-0.5 after:bg-primary-500">Legal</h3>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li>
                                <Link to="/terms-and-conditions" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-slate-900 dark:text-slate-100 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-8 after:h-0.5 after:bg-primary-500">Contact</h3>
                        <ul className="space-y-4 text-slate-600 dark:text-slate-400 mb-6">
                            <li className="flex items-start">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 mr-3 shrink-0">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="text-sm">Kathmandu, Nepal</span>
                            </li>
                            <li className="flex items-start">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 mr-3 shrink-0">
                                    <Mail className="w-4 h-4 text-primary-600" />
                                </div>
                                <a href="mailto:chaurasiyachand26@gmail.com" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm break-all">chaurasiyachand26@gmail.com</a>
                            </li>
                            <li className="flex items-start">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 mr-3 shrink-0">
                                    <Phone className="w-4 h-4 text-primary-600" />
                                </div>
                                <a href="tel:+9779825245403" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">+977 9825245403</a>
                            </li>
                        </ul>

                        {/* Follow Us - Moved Here */}
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Follow Us</h4>
                        <div className="flex space-x-3">
                            <a href="https://x.com/CK_Chaurasiya" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-black transition-all shadow-sm border border-slate-100 dark:border-slate-700"><Twitter className="w-4 h-4" /></a>
                            <a href="https://www.linkedin.com/in/chand-chaurasiya" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-[#0077b5] transition-all shadow-sm border border-slate-100 dark:border-slate-700"><Linkedin className="w-4 h-4" /></a>
                            <a href="https://www.facebook.com/share/17VepZctx8/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-[#1877F2] transition-all shadow-sm border border-slate-100 dark:border-slate-700"><Facebook className="w-4 h-4" /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm">© {new Date().getFullYear()} LawBlog. All rights reserved.</p>
                    <p className="text-slate-500 text-sm mt-4 md:mt-0 font-medium">Chand Kumar Chaurasiya</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
