import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const vendorService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/vendors', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/vendors', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/vendors/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },
  overrideStatus: async (id, status, reason, changedBy) => {
    const response = await api.put(`/vendors/${id}/status`, { status, reason, changedBy });
    return response.data;
  }
};

export const ratingService = {
  getAll: async () => {
    const response = await api.get('/ratings');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/ratings/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/ratings', data);
    return response.data;
  },
  getByVendorId: async (vendorId) => {
    const response = await api.get(`/ratings/vendor/${vendorId}`);
    return response.data;
  }
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  }
};

export const blacklistService = {
  getAll: async () => {
    const response = await api.get('/blacklist');
    return response.data;
  }
};

export const recommendationService = {
  get: async (params = {}) => {
    const response = await api.get('/recommendations', { params });
    return response.data;
  }
};

export const reportService = {
  getVendorSummary: async () => {
    const response = await api.get('/reports/vendor-summary');
    return response.data;
  },
  getCategoryPerformance: async () => {
    const response = await api.get('/reports/category-performance');
    return response.data;
  },
  getEventRatings: async () => {
    const response = await api.get('/reports/event-ratings');
    return response.data;
  }
};

export const settingsService = {
  getAll: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  update: async (settings, triggerRecalculate = false) => {
    const response = await api.put('/settings', { settings, triggerRecalculate });
    return response.data;
  }
};

export default api;
