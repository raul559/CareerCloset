/**
 * Centralized API client for appointment management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Generic fetch wrapper with error handling
 */
const apiFetch = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

// Appointment API methods
export const appointmentsApi = {
    // Get all appointments or filter by userId
    getAll: (userId = null) => {
        const endpoint = userId ? `/appointments?userId=${userId}` : '/appointments';
        return apiFetch(endpoint);
    },

    // Get available time slots for a date
    getAvailableSlots: (date) => {
        return apiFetch(`/appointments/available-slots?date=${date}`);
    },

    // Get blocked dates
    getBlockedDates: () => {
        return apiFetch('/appointments/blocked-dates');
    },

    // Create new appointment
    create: (appointmentData) => {
        return apiFetch('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    },

    // Update appointment (reschedule, status change)
    update: (appointmentId, updates) => {
        return apiFetch(`/appointments/${appointmentId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    // Cancel appointment
    cancel: (appointmentId, userId = null) => {
        return apiFetch(`/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
            body: JSON.stringify(userId ? { userId } : {}),
        });
    },

    // Delete appointment (admin only)
    delete: (appointmentId) => {
        return apiFetch(`/appointments/${appointmentId}`, {
            method: 'DELETE',
        });
    },

    // Block date/time (admin only)
    block: (blockData) => {
        return apiFetch('/appointments/block', {
            method: 'POST',
            body: JSON.stringify(blockData),
        });
    },

    // Unblock entire day (admin only)
    unblockDay: (date) => {
        return apiFetch('/appointments/unblock-day', {
            method: 'POST',
            body: JSON.stringify({ date }),
        });
    },
};

export default appointmentsApi;
