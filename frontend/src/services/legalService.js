import api from './api';

const getLegalPage = async (type) => {
    const response = await api.get(`/legal/${type}`);
    return response.data;
};

const updateLegalPage = async (type, sections) => {
    const response = await api.put(`/legal/${type}`, { sections });
    return response.data;
};

const legalService = {
    getLegalPage,
    updateLegalPage
};

export default legalService;
