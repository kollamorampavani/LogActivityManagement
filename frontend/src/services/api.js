import axios from 'axios';

const api = axios.create({
    baseURL: 'http://3.110.58.191:5000/api',
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default api;
