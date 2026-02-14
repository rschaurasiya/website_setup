import api from './api';

const userService = {
    getAllUsers: async (page = 1, limit = 10) => {
        const response = await api.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateUserStatus: async (id, role, isBlocked) => {
        const payload = {};
        if (role) payload.role = role;
        if (isBlocked !== undefined) payload.is_blocked = isBlocked;

        const response = await api.put(`/users/${id}/status`, payload);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.put('/users/profile', formData);
        return response.data;
    },

    getUserDetails: async (id) => {
        const response = await api.get(`/users/${id}/details`);
        return response.data;
    }
};

export default userService;
