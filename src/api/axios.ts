import axios from "axios";

// Use environment variable or fallback
const BASE_URL = import.meta.env.VITE_API_URL || 
  "https://webshield-backend-production-1871.up.railway.app";

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to avoid caching issues
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    if (import.meta.env.DEV) {
      console.log(` ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 Response ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Clear any stored auth data
      localStorage.removeItem('auth');
      sessionStorage.removeItem('auth');
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
      
      if (!authPages.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 404) {
      console.error('404 - Route not found on backend:', error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;