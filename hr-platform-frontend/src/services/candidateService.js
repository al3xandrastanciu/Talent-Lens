import api from './api';

const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    return [];
};

const candidateService = {
    getByUserId: async (userId) => {
        const response = await api.get(`/candidates/user/${userId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/candidates/${id}`);
        return response.data;
    },

    updateProfile: async (id, fullName, phone) => {
        const response = await api.put(`/candidates/${id}`, null, {
            params: { fullName, phone },
        });
        return response.data;
    },

    getSkills: async (id) => {
        const response = await api.get(`/candidates/${id}/skills`);
        return toArray(response.data);
    },

    addSkill: async (id, skillName) => {
        const response = await api.post(`/candidates/${id}/skills`, null, {
            params: { skillName },
        });
        return response.data;
    },
};

export default candidateService;
