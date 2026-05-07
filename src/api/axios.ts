import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : `/api/v1`); // Use relative path for production (works with reverse proxy)

const buildBaseUrl = (value: string) => {
  const normalized = value.replace(/\/+$/, "");

  // If it's a relative path like /api/v1, return as-is
  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    const isLocalhost =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0";

    // Production backend is mounted under /api/v1.
    // Keep localhost flexible for local development, but auto-add the prefix
    // for deployed hosts when the env only points at the origin.
    if (!isLocalhost && (parsed.pathname === "" || parsed.pathname === "/")) {
      parsed.pathname = "/api/v1";
    }

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return normalized;
  }
};

const BASE_URL = buildBaseUrl(rawBaseUrl);

// Debug: expose and log the computed BASE_URL so deployed frontend logs show it.
// This helps diagnose mismatches between frontend and backend paths (e.g. /api/v1).
if (typeof window !== "undefined") {
  console.debug("[API] Computed BASE_URL:", BASE_URL);
  console.debug("[API] Raw env VITE_API_URL:", import.meta.env.VITE_API_URL);
}

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

    const token = sessionStorage.getItem("authToken");
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
      sessionStorage.removeItem("authToken");
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
export { BASE_URL };
