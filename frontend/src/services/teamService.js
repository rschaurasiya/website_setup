import api from './api';

const teamService = {
    getAllMembers: async () => {
        const response = await api.get('/team');
        return response.data;
    },

    addMember: async (formData) => {
        const response = await api.post('/team', formData);
        return response.data;
    },

    updateMember: async (id, formData) => {
        const response = await api.put(`/team/${id}`, formData);
        return response.data;
    },

    deleteMember: async (id) => {
        const response = await api.delete(`/team/${id}`);
        return response.data;
    }
};

export default teamService;
