import axios from "axios";
import { auth } from "../utils/auth.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: false,
});

// Interceptor to add X-User-Email header to all requests
api.interceptors.request.use((config) => {
  const user = auth.getCurrentUser();
  if (user && user.email) {
    config.headers['x-user-email'] = user.email;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Adding auth header for ${user.email}`);
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] No authenticated user found');
    }
  }
  return config;
});

export default api;
