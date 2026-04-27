import api from './api';

const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    return [];
};

const applicationService = {
    apply: async (candidateId, jobId, resumeId) => {
        const response = await api.post('/applications', { candidateId, jobId, resumeId });
        return response.data;
    },

    getByCandidate: async (candidateId) => {
        const response = await api.get(`/applications/candidate/${candidateId}`);
        return toArray(response.data);
    },

    getByJob: async (jobId) => {
        const response = await api.get(`/applications/job/${jobId}`);
        return toArray(response.data);
    },

    getById: async (id) => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/applications/${id}/status`, { status });
        return response.data;
    },

    withdraw: async (id) => {
        await api.delete(`/applications/${id}`);
    },

    classify: async (applicationId) => {
        const response = await api.post(`/classifications/${applicationId}`);
        return response.data;
    },

    getMLResult: async (applicationId) => {
        const response = await api.get(`/classifications/${applicationId}`);
        return response.data;
    },
};

export default applicationService;
