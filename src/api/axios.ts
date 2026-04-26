import axios from "axios";
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000";
const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

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
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor 
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    const message = String(error?.message || "");
    const isTransientNetworkError =
      error?.code === "ERR_NETWORK" ||
      error?.code === "ERR_NETWORK_CHANGED" ||
      message.includes("Network Error");

    if (import.meta.env.DEV && !isTransientNetworkError && !originalRequest?.url?.includes('/profile')) {
      console.debug("[API] error", {
        status: error.response?.status,
        url: originalRequest?.url,
        message: error.message,
      });
    }
    
if (error.response?.status === 401) {
  // Don't clear storage if we are already on login or signup routes to avoid UI flickers or race conditions
  const isAuthRoute = originalRequest?.url?.includes('/login') || originalRequest?.url?.includes('/signup');
  
  if (!isAuthRoute) {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    // Note: httpOnly cookies cannot be cleared via document.cookie, 
    // but we try to clear any legacy non-httpOnly ones just in case.
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  error.isAuthError = true;
  return Promise.reject(error);
}
    
    return Promise.reject(error);
  }
);

export default api;
