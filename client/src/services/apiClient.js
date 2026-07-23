import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true
});

export async function safeRequest(request, fallback) {
  try {
    const response = await request();
    return response.data?.data ?? fallback;
  } catch {
    return fallback;
  }
}
