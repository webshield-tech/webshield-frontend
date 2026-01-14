import axios from "axios";
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
      console.log(`Response ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    if (!originalRequest.url.includes('/profile')) {
      console.error('API Error:', {
        status: error.response?.status,
        url: originalRequest.url,
        message: error.message
      });
    }
    
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  sessionStorage.clear();
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('User not authenticated (401)');
  
  return Promise.reject({
    isAuthError: true,
    status: 401,
    message: 'Authentication required'
  });
}
    if (error.response?.status === 404) {
      console.error('404 - Route not found on backend:', originalRequest.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;