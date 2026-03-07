import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: '/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
