import React, { useState, useEffect } from 'react';
import aboutService from '../services/aboutService';
import { Save, Upload, X, Linkedin, Facebook, Twitter, Instagram, Youtube, Github, Eye, EyeOff, Layout, Type, Image as ImageIcon, Briefcase, Users, Plus, Trash2 } from 'lucide-react';
import ImageCropper from '../components/ImageCropper';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';

const EditAbout = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        email: '',
        phone: '',
        social_links: [],
        sections: [], // { id, title, content, isVisible }
        education: [], // Legacy support
        admissions: [], // Legacy support
        speaking_engagements: [], // Legacy support
        publications: [] // Legacy support
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);

    // Tabs for Admin Interface
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await aboutService.getAboutData();
            if (data && Object.keys(data).length > 0) {
                const parseField = (field) => {
                    if (typeof field === 'string') {
                        try { return JSON.parse(field); } catch (e) { return []; }
                    }
                    return field || [];
                };

                setFormData({
                    name: data.name || '',
                    title: data.title || '',
                    bio: data.bio || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    social_links: parseField(data.social_links),
                    sections: parseField(data.sections),
                    education: parseField(data.education),
                    admissions: parseField(data.admissions),
                    speaking_engagements: parseField(data.speaking_engagements),
                    publications: parseField(data.publications)
                });
                if (data.image) {
                    setImagePreview(data.image.startsWith('http') ? data.image : data.image);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBioChange = (value) => {
        setFormData(prev => ({ ...prev, bio: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob) => {
        setImageFile(croppedBlob);
        setImagePreview(URL.createObjectURL(croppedBlob));
        setShowCropper(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });
        if (imageFile) data.append('image', imageFile);

        try {
            await aboutService.updateAboutData(data);
            alert('About Information Updated Successfully!');
        } catch (error) {
            alert('Failed to update information. check console.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    // --- Dynamic Sections Logic ---
    const addSection = (type = 'text') => {
        const newSection = {
            id: Date.now(),
            title: 'New Section',
            isVisible: true,
            type: type, // 'text' or 'cards'
            content: '', // for text type
            items: [] // for cards type: { id, title, description, image }
        };
        setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    };

    const updateSection = (index, key, value) => {
        const newSections = [...formData.sections];
        newSections[index][key] = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeSection = (index) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            const newSections = [...formData.sections];
            newSections.splice(index, 1);
            setFormData(prev => ({ ...prev, sections: newSections }));
        }
    };

    // Card Section Handlers
    const addCardItem = (sectionIndex) => {
        const newSections = [...formData.sections];
        if (!newSections[sectionIndex].items) newSections[sectionIndex].items = [];

        newSections[sectionIndex].items.push({
            id: Date.now(),
            title: '',
            description: '',
            image: ''
        });
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const updateCardItem = (sectionIndex, itemIndex, key, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].items[itemIndex][key] = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeCardItem = (sectionIndex, itemIndex) => {
        if (window.confirm('Delete this card?')) {
            const newSections = [...formData.sections];
            newSections[sectionIndex].items.splice(itemIndex, 1);
            setFormData(prev => ({ ...prev, sections: newSections }));
        }
    };

    const handleCardImageUpload = async (e, sectionIndex, itemIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            setLoading(true);
            // Use existing generic upload route
            const res = await axios.post('/api/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateCardItem(sectionIndex, itemIndex, 'image', res.data.url);
        } catch (error) {
            console.error('Image upload failed', error);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    // --- Legacy Array Logic (Social, Education etc) ---
    const handleArrayChange = (field, index, key, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index] = { ...updatedArray[index], [key]: value };
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    // Social Helper
    const socialPlatforms = [
        { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" /> },
        { name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
        { name: 'Twitter', icon: <Twitter className="w-5 h-5" /> },
        { name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
        { name: 'YouTube', icon: <Youtube className="w-5 h-5" /> },
        { name: 'GitHub', icon: <Github className="w-5 h-5" /> }
    ];

    const getSocialLink = (platform) => {
        return formData.social_links.find(l => l.platform.toLowerCase() === platform.toLowerCase())?.url || '';
    };



    const handleSocialLinkUpdate = (platform, url) => {
        let links = [...formData.social_links];
        const index = links.findIndex(l => l.platform.toLowerCase() === platform.toLowerCase());

        // Max 2 Validation
        if (url.trim() !== '' && index === -1 && links.length >= 2) {
            alert('You can only add a maximum of 2 social links for the main profile.');
            return;
        }

        if (url.trim() === '') {
            if (index !== -1) links.splice(index, 1);
        } else {
            if (index !== -1) links[index].url = url;
            else links.push({ platform, url });
        }
        setFormData(prev => ({ ...prev, social_links: links }));
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
                <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white px-2">About Editor</h2>
                <nav className="space-y-1">
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Type className="w-5 h-5 mr-3" /> Profile & Bio
                    </button>
                    <button onClick={() => setActiveTab('social')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'social' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Layout className="w-5 h-5 mr-3" /> Social Links
                    </button>
                    <button onClick={() => setActiveTab('sections')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'sections' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Briefcase className="w-5 h-5 mr-3" /> Custom Sections
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                {showCropper && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden max-w-2xl w-full">
                            <ImageCropper imageSrc={cropImageSrc} onCropComplete={handleCropComplete} onCancel={() => setShowCropper(false)} />
                        </div>
                    </div>
                )}




                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {activeTab === 'profile' && 'Profile Details'}
                            {activeTab === 'social' && 'Social Connections'}
                            {activeTab === 'sections' && 'Page Sections'}
                        </h1>
                        {activeTab !== 'team' && (
                            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2">
                                {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        )}

                    </div>



                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="space-y-3">
                                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Profile Image</span>
                                    <div className="relative group w-40 h-52 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-slate-300" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <label className="cursor-pointer text-white flex flex-col items-center">
                                                <Upload className="w-6 h-6 mb-1" />
                                                <span className="text-xs">Change</span>
                                                <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label">Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" placeholder="e.g. John Doe" />
                                        </div>
                                        <div>
                                            <label className="input-label">Title / Designation</label>
                                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" placeholder="e.g. Senior Legal Consultant" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="input-label">Public Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="input-field w-full"
                                                placeholder="contact@example.com"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Displayed on profile page</p>
                                        </div>
                                        <div>
                                            <label className="input-label">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="input-field w-full"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="input-label">About / Biography</label>
                                <div className="prose-editor">
                                    <ReactQuill theme="snow" value={formData.bio} onChange={handleBioChange} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SOCIAL TAB */}
                    {activeTab === 'social' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                            {socialPlatforms.map((p) => {
                                const currentUrl = getSocialLink(p.name);
                                const isFilled = !!currentUrl;
                                // Enforce Max 2: Disable if not filled and we already have 2
                                const isLimitReached = formData.social_links.length >= 2;
                                const isDisabled = !isFilled && isLimitReached;

                                return (
                                    <div key={p.name} className={`p-4 border rounded-xl transition-all ${isDisabled ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'} ${isFilled ? 'border-primary-200 bg-primary-50 dark:bg-primary-900/10 dark:border-primary-900' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${isFilled ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                                {p.icon}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 block">{p.name}</span>
                                                {isDisabled && <span className="text-[10px] text-red-500 font-medium">Limit Reached</span>}
                                            </div>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder={`Paste ${p.name} URL`}
                                            value={currentUrl}
                                            onChange={(e) => handleSocialLinkUpdate(p.name, e.target.value)}
                                            disabled={isDisabled}
                                            className="w-full text-sm p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* SECTIONS TAB */}
                    {activeTab === 'sections' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-xl gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">Add New Section</h3>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        Choose a layout type for your new content section.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => addSection('text')} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm">
                                        <Type className="w-4 h-4" /> Rich Text
                                    </button>
                                    <button onClick={() => addSection('cards')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md shadow-blue-500/20">
                                        <Layout className="w-4 h-4" /> Card Grid
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {formData.sections.map((section, index) => (
                                    <div key={section.id} className={`border rounded-xl overflow-hidden transition-all shadow-sm ${section.isVisible ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-75'}`}>

                                        {/* Section Header */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-3 flex-1 mr-4">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
                                                    {section.type === 'cards' ? <Layout className="w-5 h-5" /> : <Type className="w-5 h-5" />}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                                                    className="flex-1 text-lg font-bold bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 rounded px-2 -ml-2 transition-colors"
                                                    placeholder="Section Title (e.g. key Highlights)"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateSection(index, 'isVisible', !section.isVisible)}
                                                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${section.isVisible ? 'text-green-600' : 'text-slate-400'}`}
                                                    title={section.isVisible ? "Visible on public page" : "Hidden"}
                                                >
                                                    {section.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => removeSection(index)}
                                                    className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Delete Section"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Section Content Editor */}
                                        <div className="p-6">
                                            {(!section.type || section.type === 'text') && (
                                                <ReactQuill
                                                    theme="snow"
                                                    value={section.content}
                                                    onChange={(val) => updateSection(index, 'content', val)}
                                                    className="bg-white dark:bg-slate-800"
                                                    placeholder="Write your content here..."
                                                />
                                            )}

                                            {section.type === 'cards' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(section.items || []).map((item, itemIndex) => (
                                                            <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/50 relative group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">

                                                                <button
                                                                    onClick={() => removeCardItem(index, itemIndex)}
                                                                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>

                                                                <div className="flex gap-4">
                                                                    {/* Card Image */}
                                                                    <div className="shrink-0">
                                                                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                                                                            {item.image ? (
                                                                                <img src={item.image.startsWith('http') ? item.image : item.image} alt="Preview" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="flex items-center justify-center w-full h-full text-slate-300">
                                                                                    <ImageIcon className="w-8 h-8" />
                                                                                </div>
                                                                            )}
                                                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                                                                                <Upload className="w-6 h-6 text-white" />
                                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCardImageUpload(e, index, itemIndex)} />
                                                                            </label>
                                                                        </div>
                                                                    </div>

                                                                    {/* Card Text Inputs */}
                                                                    <div className="flex-1 space-y-3">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Card Title"
                                                                            value={item.title}
                                                                            onChange={(e) => updateCardItem(index, itemIndex, 'title', e.target.value)}
                                                                            className="w-full text-sm font-semibold bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-0 px-0 pb-1"
                                                                        />
                                                                        <textarea
                                                                            placeholder="Short description..."
                                                                            value={item.description}
                                                                            onChange={(e) => updateCardItem(index, itemIndex, 'description', e.target.value)}
                                                                            className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded p-2 focus:ring-blue-500 focus:border-blue-500 h-16 resize-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Add Card Button */}
                                                        <button
                                                            onClick={() => addCardItem(index)}
                                                            className="flex flex-col items-center justify-center h-full min-h-[140px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                                                        >
                                                            <Plus className="w-8 h-8 mb-2" />
                                                            <span className="font-medium text-sm">Add Card Item</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {formData.sections.length === 0 && (
                                    <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                            <Layout className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No custom sections yet</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Create custom sections to highlight achievements, events, or specific information.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default EditAbout;
