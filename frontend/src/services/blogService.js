import api from './api';

const blogService = {
    // Get all blogs (with filters)
    getBlogs: async (params) => {
        // params: { category, author, search, date, sort }
        const response = await api.get('/blogs', { params });
        return response.data;
    },

    // Get single blog by ID
    getBlogById: async (id) => {
        const response = await api.get(`/blogs/id/${id}`);
        return response.data;
    },

    // Create blog (Admin)
    createBlog: async (formData) => {
        const response = await api.post('/blogs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Update blog (Admin)
    updateBlog: async (id, formData) => {
        const response = await api.put(`/blogs/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Delete blog (Admin)
    deleteBlog: async (id) => {
        const response = await api.delete(`/blogs/${id}`);
        return response.data;
    },

    // Add comment
    addComment: async (blogId, content) => {
        const response = await api.post(`/blogs/${blogId}/comments`, { content });
        return response.data;
    },

    // Get Categories
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    createCategory: async (name, parent_id) => {
        const response = await api.post('/categories', { name, parent_id });
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },

    updateCategory: async (id, name, parent_id) => {
        const response = await api.put(`/categories/${id}`, { name, parent_id });
        return response.data;
    },

    getAdminBlogs: async (page = 1, limit = 10) => {
        const response = await api.get(`/blogs/admin/all?page=${page}&limit=${limit}`);
        return response.data;
    },

    getMyBlogs: async () => {
        const response = await api.get('/blogs/author/my');
        return response.data;
    }
};

export default blogService;
