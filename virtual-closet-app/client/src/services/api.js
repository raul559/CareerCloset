import axios from "axios";
import { auth } from "../utils/auth.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: false,
});

// Interceptor to add X-User-Email header to all requests
api.interceptors.request.use((config) => {
  const headers = auth.getAuthHeaders();
  if (headers['X-User-Email']) {
    config.headers['X-User-Email'] = headers['X-User-Email'];
  }
  return config;
});

export default api;
