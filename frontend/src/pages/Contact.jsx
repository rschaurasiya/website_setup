import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/contact', formData);
            setSubmitted(true);
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Failed to submit contact form', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
            {/* Header / Hero */}
            <div className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">Get in Touch</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Have a legal inquiry or want to discuss a potential collaboration? We're here to help.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20 pb-24">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row">

                    {/* Contact Info Sidebar */}
                    <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700/50">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 font-serif">Contact Information</h3>

                        <div className="space-y-8">
                            <div className="flex items-start">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <Phone size={20} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                    <a href="tel:+9779825245403" className="text-lg font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors">
                                        +977 9825245403
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <Mail size={20} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                    <a href="mailto:chaurasiyachand26@gmail.com" className="text-lg font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors break-all">
                                        chaurasiyachand26@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-primary-50 dark:bg-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <MapPin size={20} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Kathmandu, Nepal
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Preview */}
                        <div className="mt-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm h-48 grayscale hover:grayscale-0 transition-all duration-500">
                            <iframe
                                src="https://www.google.com/maps?q=Kathmandu,Nepal&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Location Map"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/3 p-10 lg:p-12 bg-white dark:bg-slate-900">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif">Send us a Message</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Fill out the form below and we'll get back to you as soon as possible.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white placeholder-slate-400"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-slate-900/10 dark:shadow-none"
                                >
                                    Send Message
                                </button>
                            </div>

                            {submitted && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-center font-medium border border-green-100 dark:border-green-900/50 animate-fade-in">
                                    Message sent successfully! We'll be in touch.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
