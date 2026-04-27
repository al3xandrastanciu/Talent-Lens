import api from './api';

const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data; // Backend-ul ar trebui să returneze { token, user }
        } catch (error) {
            throw error.response?.data || 'Login failed';
        }
    },
    
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Registration failed';
        }
    }
};

export default authService;