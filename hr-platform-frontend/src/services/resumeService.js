import api from './api';

const resumeService = {
    upload: async (candidateId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/resumes/upload/${candidateId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getByCandidate: async (candidateId) => {
        const response = await api.get(`/resumes/candidate/${candidateId}`);
        return response.data;
    },

    deleteResume: async (id) => {
        await api.delete(`/resumes/${id}`);
    },
};

export default resumeService;
