import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = () => {
    let envUrl = process.env.REACT_APP_API_URL;
    if (envUrl) {
        // Strip trailing slash if present to avoid //api
        envUrl = envUrl.replace(/\/$/, '');
        // If they provided a URL but forgot the /api at the end, append it.
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    return '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
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
