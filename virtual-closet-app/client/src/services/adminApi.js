// client/src/services/adminApi.js
import api from "./api.js";
 // uses your existing axios instance

// ---------- USERS ----------
export const getAllUsers = () => api.get("/admin/users");
export const promoteUser = (id) => api.patch(`/admin/users/${id}/promote`);
export const demoteUser = (id) => api.patch(`/admin/users/${id}/demote`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ---------- CLOTHING ----------
export const getAllClothing = () => api.get("/admin/clothing");
export const updateClothingItem = (id, data) =>
  api.put(`/admin/clothing/${id}`, data);
export const deleteClothingItem = (id) =>
  api.delete(`/admin/clothing/${id}`);

// ---------- STATS ----------
export const getStats = () => api.get("/admin/stats");

// ---------- APPOINTMENTS ----------
export const getAppointments = () => api.get("/admin/appointments");
export const updateAppointment = (id, data) =>
  api.patch(`/admin/appointments/${id}`, data);

// ---------- EXPORT (later) ----------
export const exportData = (type) => api.get(`/admin/export?type=${type}`);
