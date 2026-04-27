import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Schimbă portul dacă Spring Boot rulează pe altceva
});

// Interceptor pentru adăugarea automată a token-ului
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;