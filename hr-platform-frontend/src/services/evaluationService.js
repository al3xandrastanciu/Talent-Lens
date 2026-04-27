import api from './api';

const evaluationService = {
    createEvaluation: async (data) => {
        const response = await api.post('/evaluations', data);
        return response.data;
    },

    getByApplication: async (applicationId) => {
        const response = await api.get(`/evaluations/application/${applicationId}`);
        return response.data;
    },

    getByRecruiter: async (recruiterId) => {
        const response = await api.get(`/evaluations/recruiter/${recruiterId}`);
        return response.data;
    },

    updateEvaluation: async (id, data) => {
        const response = await api.put(`/evaluations/${id}`, data);
        return response.data;
    },
};

export default evaluationService;
