import api from './api';

// Normalize list responses – Spring Boot may return a Page object or plain array
const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content; // Spring Page
    return [];
};

const jobService = {
    getAllJobs: async () => {
        const response = await api.get('/jobs');
        return toArray(response.data);
    },

    getJobById: async (id) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    searchJobs: async (keyword) => {
        const response = await api.get('/jobs/search', { params: { keyword } });
        return toArray(response.data);
    },

    getJobsByDomain: async (domain) => {
        const response = await api.get('/jobs/filter', { params: { domain } });
        return toArray(response.data);
    },

    getJobsByRecruiter: async (recruiterId) => {
        const response = await api.get(`/jobs/recruiter/${recruiterId}`);
        return toArray(response.data);
    },

    createJob: async (data) => {
        const response = await api.post('/jobs', data);
        return response.data;
    },

    updateJob: async (id, data) => {
        const response = await api.put(`/jobs/${id}`, data);
        return response.data;
    },

    closeJob: async (id) => {
        const response = await api.put(`/jobs/${id}/close`);
        return response.data;
    },

    deleteJob: async (id) => {
        await api.delete(`/jobs/${id}`);
    },
};

export default jobService;
