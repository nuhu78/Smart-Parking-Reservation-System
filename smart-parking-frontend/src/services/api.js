import axios from 'axios';
import Cookies from 'js-cookie';

// 1. Create a base Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Points to your NestJS backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); // Grab token from cookies
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;