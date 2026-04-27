import api from './api';

const recruiterService = {
    getByUserId: async (userId) => {
        const response = await api.get(`/recruiters/user/${userId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/recruiters/${id}`);
        return response.data;
    },

    updateProfile: async (id, fullName, jobTitle) => {
        const response = await api.put(`/recruiters/${id}`, null, {
            params: { fullName, jobTitle },
        });
        return response.data;
    },
};

export default recruiterService;
