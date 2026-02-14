import api from './api';

const getAboutData = async () => {
    const response = await api.get(`/about?t=${Date.now()}`); // Add timestamp to prevent caching
    return response.data;
};

const updateAboutData = async (formData) => {
    // Explicitly unset Content-Type so browser sets multipart/form-data with boundary
    const response = await api.put('/about', formData, {
        headers: {
            'Content-Type': undefined
        }
    });
    return response.data;
};

const addMember = async (formData) => {
    // Content-Type header usually not needed for FormData as axios/browser handles it
    const response = await api.post('/about/members', formData, {
        headers: { 'Content-Type': undefined }
    });
    return response.data;
};

const updateMember = async (id, formData) => {
    const response = await api.put(`/about/members/${id}`, formData, {
        headers: { 'Content-Type': undefined }
    });
    return response.data;
};

const deleteMember = async (id) => {
    const response = await api.delete(`/about/members/${id}`);
    return response.data;
};

const reorderMembers = async (members) => {
    const response = await api.put('/about/members/reorder', { members });
    return response.data;
};

const aboutService = {
    getAboutData,
    updateAboutData,
    addMember,
    updateMember,
    deleteMember,
    reorderMembers
};

export default aboutService;
