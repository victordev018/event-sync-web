import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getSubscriptions = (eventId: string) => api.get(`/api/events/${eventId}/subscriptions`);

export const performCheckIn = (eventId: string, userId: string) => api.post(`/api/events/${eventId}/checkin/${userId}`);

export default api;
