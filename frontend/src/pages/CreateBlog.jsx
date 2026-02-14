import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';
import api from '../services/api';
import { ArrowLeft, Save, Plus, Image as ImageIcon, X, Trash2, Type, Eye } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageCropper from '../components/ImageCropper';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
];

const CreateBlog = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id, blogId } = useParams();
    const activeBlogId = id || blogId;
    const isEditing = !!activeBlogId;

    // const isEditing = !!id; // Removed duplicate
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([{ type: 'text', content: '' }]); // Initial block
    const [categoryId, setCategoryId] = useState('');
    const [mainCategoryId, setMainCategoryId] = useState(''); // New state for 2-step selection
    // Cover image logic remains the same
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

    // For Diffing
    const [initialData, setInitialData] = useState(null);

    // Co-Author State
    const [users, setUsers] = useState([]);
    const [coAuthors, setCoAuthors] = useState([]); // Array of user IDs
    const [showUserSelect, setShowUserSelect] = useState(false);

    // Cropper State
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await blogService.getCategories();
            setCategories(data);
        };

        const fetchUsers = async () => {
            try {
                // Fetch all potential authors (simple implementation: fetch all users)
                // In production, optimize to fetch only authors/admins or search endpoint
                const res = await api.get('/users/values/authors');
                // Assuming admin endpoint returns { users: [] } or just [] depending on implementation
                // Adjust based on actual API
                const userList = res.data.users || res.data || [];
                setUsers(userList.filter(u => u.id !== user?.id)); // Exclude self
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };
        fetchCategories();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isEditing) {
            const fetchBlogDetails = async () => {
                setInitialLoading(true);
                try {
                    const response = await blogService.getBlogById(activeBlogId);
                    const data = response.data || response;

                    setTitle(data.title);
                    const catId = data.category_id || data.categoryId || '';
                    setCategoryId(catId);
                    // Find parent to set mainCategoryId
                    // We need categories loaded first or checking against loaded categories
                    // Data fetching race condition: categories might not be loaded yet.
                    // effectively we set it in the effect dependent on categories.

                    // Actually, let's just set categoryId. The UI will derive the parent if we look it up.
                    // But for the dropdown `value`, we need `mainCategoryId`.
                    // We'll calculate it in an effect or render.
                    if (data.created_at) {
                        setCustomDate(new Date(data.created_at).toISOString().split('T')[0]);
                    }
                    if (data.co_authors) {
                        setCoAuthors(data.co_authors);
                    }
                    if (data.image) {
                        setImagePreview(data.image);
                    }

                    // Parse content: If JSON array, use it. Else, wrap legacy text in a block.
                    let contentBlocks = [{ type: 'text', content: data.content || '' }];
                    try {
                        const parsedContent = JSON.parse(data.content);
                        if (Array.isArray(parsedContent)) {
                            contentBlocks = parsedContent;
                        }
                    } catch (e) {
                        // Fallback maintained
                    }
                    setBlocks(contentBlocks);

                    // Store initial state for diffing
                    setInitialData({
                        title: data.title,
                        categoryId: data.category_id || data.categoryId || '',
                        content: JSON.stringify(contentBlocks),
                        image: data.image, // Current Image URL
                        coAuthors: data.co_authors || [],
                        status: data.status,
                        created_at: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : ''
                    });

                } catch (error) {
                    console.error("Failed to fetch blog details", error);
                    alert("Failed to load blog details");
                    alert("Failed to load blog details");
                    navigate(user?.role === 'admin' ? '/admin' : `/profile/${user?.username}/dashboard`);
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchBlogDetails();
        }

    }, [activeBlogId, isEditing, navigate, user]);

    // Sync Main Category when categoryId is loaded (for Edit mode)
    useEffect(() => {
        if (categoryId && categories.length > 0 && !mainCategoryId) {
            const cat = categories.find(c => c.id == categoryId);
            if (cat) {
                if (cat.parent_id) {
                    setMainCategoryId(cat.parent_id);
                } else {
                    // If it is a main category
                    setMainCategoryId(cat.id);
                }
            }
        }
    }, [categoryId, categories, mainCategoryId]);



    const updateBlock = (index, field, value) => {
        const newBlocks = [...blocks];
        newBlocks[index][field] = value;
        setBlocks(newBlocks);
    };

    const removeBlock = (index) => {
        if (blocks.length === 1) return; // Prevent deleting the last block
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Use the new generic upload endpoint
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateBlock(index, 'url', res.data.url);
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        const strBlocks = JSON.stringify(blocks);

        // Status Logic: Admin -> Published, Author -> Pending (Default)
        // If editing, we generally want to keep existing status unless explicitly changed or if it's a re-submission
        // For simplicity in this fix, we'll re-assert status based on role logic if it's a new post, 
        // OR if it's an update we might let the backend determine if it needs to go back to pending.
        // The requirement says "Preserve existing data... status... if not edited."
        // However, if an author edits a published blog, it usually goes back to pending. 
        // Let's send status only if it applies.

        const targetStatus = user?.role === 'admin' ? 'published' : 'pending';

        if (isEditing && initialData) {
            // --- DIFF LOGIC ---
            let hasChanges = false;

            if (title !== initialData.title) {
                formData.append('title', title);
                hasChanges = true;
            }
            if (categoryId != initialData.categoryId) { // loose comparison for string/int IDs
                formData.append('categoryId', categoryId);
                hasChanges = true;
            }
            if (customDate !== initialData.created_at) {
                formData.append('created_at', customDate);
                hasChanges = true;
            }

            // Compare Content (JSON string string comparison is usually safe for stable stringify, but structurally safer to just send if changed)
            // We'll compare the stringified version we just made.
            // Note: JSON.stringify order isn't guaranteed, but for simple block array it usually is.
            // If strictly different, send it.
            if (strBlocks !== initialData.content) {
                formData.append('content', strBlocks);
                hasChanges = true;
            }

            // Co-Authors Comparison (Sort to ensure order doesn't matter)
            const currentCoAuthorsStr = JSON.stringify([...coAuthors].sort());
            const initialCoAuthorsStr = JSON.stringify([...(initialData.coAuthors || [])].sort());
            if (currentCoAuthorsStr !== initialCoAuthorsStr) {
                formData.append('coAuthors', JSON.stringify(coAuthors));
                hasChanges = true;
            }

            // Image: If selected new file, send it.
            if (image) {
                formData.append('image', image);
                hasChanges = true;
            }

            // Status: If author updates a blog, should it revert to pending? 
            // Typically yes, to verify changes. 
            // If nothing changed, we shouldn't even be here (or we do nothing).
            // If changes made, we enforce status update if not admin.
            if (hasChanges && user?.role !== 'admin') {
                formData.append('status', 'pending');
            } else if (hasChanges && user?.role === 'admin') {
                // Admin keeps it as is or can explicitly set it? For now, let's just not send status if admin doesn't explicitly change it in UI (which they can't here yet)
                // Actually, if it's a new draft, admin might want to publish.
                // But for UPDATE, if admin edits, we assume they want to keep it published or whatever it was.
                // We won't append status for admin updates unless we add a status dropdown.
            }

            if (!hasChanges) {
                alert("No changes detected.");
                setLoading(false);
                return;
            }

        } else {
            // --- CREATE (NEW) LOGIC ---
            formData.append('title', title);
            formData.append('created_at', customDate);
            formData.append('content', strBlocks);
            formData.append('categoryId', categoryId);
            if (image) {
                formData.append('image', image);
            }
            formData.append('coAuthors', JSON.stringify(coAuthors));
            formData.append('status', targetStatus);
        }

        try {
            if (isEditing) {
                await blogService.updateBlog(activeBlogId, formData);
                alert('Blog updated successfully!');
            } else {
                await blogService.createBlog(formData);
                alert(user?.role === 'admin' ? 'Blog published successfully!' : 'Blog submitted for review!');
            }
            navigate(user?.role === 'admin' ? '/admin?tab=blogs' : `/profile/${user?.username}/blogs`);
        } catch (error) {
            console.error("Failed to save blog", error);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            alert(`Failed to ${isEditing ? 'update' : 'create'} blog: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex justify-center items-center h-screen">Loading blog details...</div>;
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            // Don't set image state immediately, wait for crop
        }
    };

    const handleCropComplete = (croppedBlob) => {
        // Create a File from Blob
        const file = new File([croppedBlob], "cover-image.jpg", { type: "image/jpeg" });
        setImage(file);
        setImagePreview(URL.createObjectURL(croppedBlob));
        setShowCropper(false);
    };

    // Helper for image URL
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('blob:') || path.startsWith('data:')) return path; // blob or base64
        if (path.startsWith('http')) return path;

        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${cleanPath}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-300">
            {showCropper && (
                <ImageCropper
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setShowCropper(false)}
                />
            )}
            <div className="container mx-auto px-4 max-w-4xl">
                <button
                    onClick={() => navigate(user?.role === 'admin' ? '/admin' : `/profile/${user?.username}/dashboard`)}
                    className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </button>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title & Category (Standard Fields) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Enter blog title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <div className="space-y-3">
                                    {/* Main Category */}
                                    <select
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                        value={mainCategoryId}
                                        onChange={(e) => {
                                            setMainCategoryId(e.target.value);
                                            setCategoryId(''); // Reset subcategory when main changes
                                        }}
                                        required
                                    >
                                        <option value="">Select Main Category</option>
                                        {categories.filter(c => !c.parent_id).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>

                                    {/* Subcategory */}
                                    <select
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                        required
                                        disabled={!mainCategoryId}
                                    >
                                        <option value="">Select Subcategory</option>
                                        {categories
                                            .filter(c => c.parent_id == mainCategoryId)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Co-Authors Selection */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Co-Authors & Contributors</label>

                            {/* Selected Authors List */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                {coAuthors.map(authorId => {
                                    const author = users.find(u => u.id === authorId) || coAuthors.find(ca => ca.id === authorId);
                                    if (!author) return null;

                                    return (
                                        <div key={authorId} className="flex items-center gap-2 bg-white dark:bg-slate-800 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md animate-in fade-in zoom-in-95 duration-200">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                                                {author.profile_photo ? (
                                                    <img src={getImageUrl(author.profile_photo)} alt={author.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                        {author.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{author.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setCoAuthors(prev => prev.filter(id => id !== authorId))}
                                                className="ml-1 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                title="Remove Author"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => setShowUserSelect(!showUserSelect)}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 bg-transparent transition-all group"
                                >
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Add Co-Author</span>
                                </button>
                            </div>

                            {/* Dropdown Panel */}
                            {showUserSelect && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowUserSelect(false)}></div>
                                    <div className="absolute top-full left-0 z-20 w-72 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                            {users.filter(u => !coAuthors.includes(u.id)).length === 0 && (
                                                <div className="text-center py-8 px-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <p>No more authors found.</p>
                                                </div>
                                            )}
                                            {users.filter(u => !coAuthors.includes(u.id)).map(u => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                                                    onClick={() => {
                                                        setCoAuthors(prev => [...prev, u.id]);
                                                        setShowUserSelect(false);
                                                    }}
                                                >
                                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-primary-400 transition-all">
                                                        {u.profile_photo ? (
                                                            <img src={getImageUrl(u.profile_photo)} alt={u.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm uppercase">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{u.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Date Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Publish Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                                value={customDate}
                                onChange={e => setCustomDate(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave as is for today, or pick a past/future date.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors file:bg-slate-100 dark:file:bg-slate-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-4 file:text-sm file:font-semibold file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-600"
                                    onChange={handleFileChange}
                                />
                                {image && (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center">
                                        <ImageIcon className="w-4 h-4 mr-1" /> Selected
                                    </span>
                                )}
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200 dark:border-slate-800" />

                        {/* Header Preview - already styled mostly with images/overlays which are universal */}
                        {(title || imagePreview) && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                                    <Eye className="w-4 h-4 mr-1" /> Header Preview
                                </label>
                                <div className="w-full h-48 md:h-64 relative rounded-lg overflow-hidden shadow-sm">
                                    <img
                                        src={getImageUrl(imagePreview) || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                                        <h1 className="text-xl md:text-3xl font-serif font-bold leading-tight drop-shadow-md">{title || 'Your Blog Title'}</h1>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Block Editor Area */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-lg font-medium text-slate-800 dark:text-slate-200">Content Blocks</label>
                                <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    Tip: Hover over a block (or click the + button between blocks) to insert content in specific places.
                                </span>
                            </div>

                            <div className="space-y-6"> {/* Increased spacing from space-y-4 to space-y-6 to allow room for insert buttons */}
                                {blocks.map((block, index) => (
                                    <div key={index} className="relative group bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-500 transition-all hover:z-20 hover:shadow-md"> // Dark mode for blocks

                                        {/* Remove Block Button */}
                                        {blocks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBlock(index)}
                                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove Block"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {block.type === 'text' ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center">
                                                        <Type className="w-3 h-3 mr-1" /> Rich Text Editor
                                                    </label>
                                                </div>
                                                <div className="bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"> {/* Quill Container Background */}
                                                    <div className="h-64 mb-12">
                                                        <ReactQuill
                                                            theme="snow"
                                                            value={block.content}
                                                            onChange={(content) => updateBlock(index, 'content', content)}
                                                            modules={modules}
                                                            formats={formats}
                                                            className="h-full"
                                                            placeholder="Write something..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center">
                                                    <ImageIcon className="w-3 h-3 mr-1" /> Image
                                                </label>

                                                {!block.url ? (
                                                    <div className="flex items-center justify-center w-full">
                                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-300 mb-2" />
                                                                <p className="text-sm text-slate-500 dark:text-slate-300"><span className="font-semibold">Click to upload</span> image</p>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <img src={block.url} alt="Block" className="max-h-64 mx-auto rounded shadow-sm mb-2" />
                                                        <div className="flex justify-center gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Image Caption (optional)"
                                                                className="text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded px-2 py-1 w-1/2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                                value={block.caption || ''}
                                                                onChange={e => updateBlock(index, 'caption', e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => updateBlock(index, 'url', '')}
                                                                className="text-xs text-red-500 hover:underline"
                                                            >
                                                                Change Image
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Insert Controls between blocks - ALWAYS VISIBLE */}
                                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-30">
                                            <div className="flex gap-2 bg-white dark:bg-slate-700 shadow-sm rounded-full border border-slate-300 dark:border-slate-600 p-1 opacity-50 hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => {
                                                    const newBlocks = [...blocks];
                                                    newBlocks.splice(index + 1, 0, { type: 'text', content: '' });
                                                    setBlocks(newBlocks);
                                                }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full text-slate-600 dark:text-slate-200 font-bold text-xs flex items-center" title="Insert Text Below">
                                                    <Plus className="w-3 h-3 mr-1" /> Text
                                                </button>
                                                <div className="w-px bg-slate-200 dark:bg-slate-600"></div>
                                                <button type="button" onClick={() => {
                                                    const newBlocks = [...blocks];
                                                    // Insert Image AND a Text block after it for flow
                                                    newBlocks.splice(index + 1, 0,
                                                        { type: 'image', url: '', caption: '' },
                                                        { type: 'text', content: '' }
                                                    );
                                                    setBlocks(newBlocks);
                                                }} className="p-1 hover:bg-slate-100 rounded-full text-slate-600 font-bold text-xs flex items-center" title="Insert Image Below">
                                                    <Plus className="w-3 h-3 mr-1" /> Img
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center px-8 py-3 text-lg"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Publish Post')}
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default CreateBlog;
