import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || 
  "https://webshield-backend-production-1871.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  console.log('Sending request to:', config.url);
  console.log('With credentials:', config.withCredentials);
  console.log('Base URL:', config.baseURL);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized');
      console.log(' Request URL:', error.config.url);
      console.log('Cookies sent?', document.cookie);
    }
    return Promise.reject(error);
  }
);

export default api;