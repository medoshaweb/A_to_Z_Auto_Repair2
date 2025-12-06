import api from './config';

// Admin Auth API
export const adminAuthAPI = {
  // Admin login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Admin signup
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Forgot username
  forgotUsername: async (email) => {
    const response = await api.post('/auth/forgot-username', { email });
    return response.data;
  },
};

// Customer Auth API
export const customerAuthAPI = {
  // Customer login
  login: async (email, password) => {
    const response = await api.post('/customer-auth/login', { email, password });
    return response.data;
  },

  // Customer signup
  signup: async (customerData) => {
    const response = await api.post('/customer-auth/signup', customerData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/customer-auth/forgot-password', { email });
    return response.data;
  },

  // Forgot username
  forgotUsername: async (email) => {
    const response = await api.post('/customer-auth/forgot-username', { email });
    return response.data;
  },
};

