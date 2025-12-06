import api from './config';

export const servicesAPI = {
  // Get all services
  getAll: async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  // Get service by ID
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Create new service
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Update service
  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  // Delete service
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

