import axios from 'axios';
import dotenv from 'dotenv';
// config
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:4000';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: BASE_URL });

// Attach the JWT token (if present) to every outgoing request so that
// protected API routes can authenticate the user.
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;