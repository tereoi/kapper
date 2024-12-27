// services/api.js
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';

const cache = setupCache({
  maxAge: 15 * 60 * 1000 // Cache for 15 minutes
});

const api = axios.create({
  adapter: cache.adapter,
  timeout: 10000,
  retry: 3,
  retryDelay: (retryCount) => retryCount * 1000
});

export const adminService = {
  login: async (credentials) => {
    const response = await api.post('/api/admin/login', credentials);
    if (response.data.success) {
      sessionStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },
  // Andere admin methods
};

export const appointmentService = {
    getAll: () => api.get('/api/appointments'),
    create: (data) => api.post('/api/appointments', data),
    delete: (id) => api.delete(`/api/appointments/${id}`),
    getAvailableTimes: (date) => api.get(`/api/appointments/available-times/${date}`)
  };