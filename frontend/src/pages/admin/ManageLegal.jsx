import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Lock, Scale, ShieldCheck } from 'lucide-react';
import legalService from '../../services/legalService';

const ManageLegal = () => {
    const [activeTab, setActiveTab] = useState('terms');
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPageData(activeTab);
    }, [activeTab]);

    const fetchPageData = async (type) => {
        try {
            setLoading(true);
            const data = await legalService.getLegalPage(type);
            setSections(data.sections || []);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch legal page data');
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = (index, content) => {
        const newSections = [...sections];
        newSections[index].content = content;
        setSections(newSections);
    };

    const handleSave = async () => {
        if (!window.confirm(`Save changes to ${activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}?`)) return;

        try {
            setSaving(true);
            await legalService.updateLegalPage(activeTab, sections);
            alert('Changes saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Legal Pages Management</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage the content for Terms & Conditions and Privacy Policy. Section titles are fixed to ensure legal structure.
                </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'terms' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <Scale className="w-5 h-5" /> Terms & Conditions
                </button>
                <button
                    onClick={() => setActiveTab('privacy')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'privacy' ? 'bg-green-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <ShieldCheck className="w-5 h-5" /> Privacy Policy
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="booking-container space-y-8 animate-in fade-in duration-300">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center h-16">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    {section.title}
                                </h3>
                                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                                    <Lock className="w-3 h-3" /> Fixed Title
                                </div>
                            </div>
                            <div className="p-6">
                                <ReactQuill
                                    theme="snow"
                                    value={section.content || ''}
                                    onChange={(val) => handleContentChange(index, val)}
                                    className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="fixed bottom-8 right-8 z-50">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-6 h-6" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLegal;
