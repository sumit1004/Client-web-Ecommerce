import { apiClient } from './apiClient.js';

const previewAdmin = {
  id: 'preview-admin',
  name: 'Store Admin',
  email: 'admin@pasandshowroom.com',
  role: 'admin'
};

const previewCredentials = {
  email: 'admin@pasandshowroom.com',
  password: 'Admin@Pasand'
};

export const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data?.data;
    } catch (error) {
      const email = credentials.email.trim().toLowerCase();
      if (email === previewCredentials.email && credentials.password === previewCredentials.password) {
        return previewAdmin;
      }
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

export const demoAdminCredentials = previewCredentials;
