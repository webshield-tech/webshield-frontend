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

// Request interceptor — attach auth token silently
api.interceptors.request.use(
  (config) => {
    // Cache-bust GET requests
    if (config.method?.toLowerCase() === "get") {
      config.params = { ...config.params, _t: Date.now() };
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 cleanly without console noise
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401) {
      // Auth routes: pass the full error through so the page can read
      // error.response.data.error and display "User does not exist" etc.
      const isAuthRoute =
        originalRequest?.url?.includes("/login") ||
        originalRequest?.url?.includes("/signup");

      if (isAuthRoute) {
        return Promise.reject(error);
      }

      // All other routes: silently clear credentials
      localStorage.removeItem("authToken");
      sessionStorage.clear();
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Return a plain rejected promise — no console noise, AuthContext will catch this
      return Promise.reject({ isAuthError: true, status: 401 });
    }

    return Promise.reject(error);
  }
);

export default api;
