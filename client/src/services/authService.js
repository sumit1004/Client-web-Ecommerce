import { apiClient } from './apiClient.js';

export const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data?.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password.';
      throw new Error(message);
    }
  },
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      return null;
    }
    return null;
  },
  async me() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data?.data;
    } catch {
      return null;
    }
  }
};

export const demoAdminCredentials = {
  email: 'admin@pasandshowroom.com',
  password: 'Admin@Pasand'
};
