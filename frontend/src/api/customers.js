import api from './config';

export const customersAPI = {
  // Get all customers with pagination and search
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Create new customer
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  // Update customer
  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Get customer vehicles
  getVehicles: async (id) => {
    const response = await api.get(`/customers/${id}/vehicles`);
    return response.data;
  },

  // Add vehicle to customer
  addVehicle: async (id, vehicleData) => {
    const response = await api.post(`/customers/${id}/vehicles`, vehicleData);
    return response.data;
  },

  // Get customer orders
  getOrders: async (id) => {
    const response = await api.get(`/customers/${id}/orders`);
    return response.data;
  },
};

