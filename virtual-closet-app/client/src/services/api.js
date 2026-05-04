import axios from "axios";
import { auth } from "../utils/auth.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const user = auth.getCurrentUser();
  if (user && user.email) {
    config.headers['x-user-email'] = user.email;
  }
  return config;
});

export default api;
