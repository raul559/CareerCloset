/**
 * AdminAppointmentManagement Component
 * Developed with AI assistance
 * 
 * AI assisted with:filter state management, API integration patterns, 
 * and responsive card layout implementation.
 */

import { useState, useEffect } from "react";
import { formatDate, formatTime } from "../utils/dateUtils";
import { appointmentsApi } from "../utils/api";

export default function AdminAppointmentManagement() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await appointmentsApi.getAll();
            if (data.success) {
                const regularAppointments = data.data.filter(appt => appt.status !== "blocked");
                setAppointments(regularAppointments);
            }
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const data = await appointmentsApi.update(appointmentId, { status: newStatus });
            if (data.success) fetchAppointments();
        } catch (err) {
            console.error("Error updating appointment:", err);
        }
    };

    const handleDelete = async (appointmentId) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
        try {
            const data = await appointmentsApi.delete(appointmentId);
            if (data.success) fetchAppointments();
        } catch (err) {
            console.error("Error deleting appointment:", err);
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        if (filter === "all") return true;
        return appt.status === filter;
    });

    const statusCounts = {
        all: appointments.length,
        pending: appointments.filter(a => a.status === "pending").length,
        confirmed: appointments.filter(a => a.status === "confirmed").length,
        denied: appointments.filter(a => a.status === "denied").length,
        cancelled: appointments.filter(a => a.status === "cancelled").length,
    };

    if (loading) {
        return <div>Loading appointments...</div>;
    }

    return (
        <div>
            <h2>Appointment Management</h2>

            {/* Filter Tabs */}
            <div style={styles.filterTabs}>
                <button
                    onClick={() => setFilter("all")}
                    style={filter === "all" ? styles.activeFilter : styles.filter}
                >
                    All ({statusCounts.all})
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    style={filter === "pending" ? styles.activeFilter : styles.filter}
                >
                    Pending ({statusCounts.pending})
                </button>
                <button
                    onClick={() => setFilter("confirmed")}
                    style={filter === "confirmed" ? styles.activeFilter : styles.filter}
                >
                    Confirmed ({statusCounts.confirmed})
                </button>
                <button
                    onClick={() => setFilter("denied")}
                    style={filter === "denied" ? styles.activeFilter : styles.filter}
                >
                    Denied ({statusCounts.denied})
                </button>
                <button
                    onClick={() => setFilter("cancelled")}
                    style={filter === "cancelled" ? styles.activeFilter : styles.filter}
                >
                    Cancelled ({statusCounts.cancelled})
                </button>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                filteredAppointments.map((appt) => (
                    <div key={appt._id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <strong>{appt.userName}</strong>
                                <p style={styles.email}>{appt.userEmail}</p>
                            </div>
                            <span style={styles.status(appt.status)}>{appt.status.toUpperCase()}</span>
                        </div>

                        <div style={styles.cardBody}>
                            <p><strong>Date:</strong> {formatDate(appt.date)}</p>
                            <p><strong>Time:</strong> {formatTime(appt.time || appt.timeSlot)}</p>
                            {appt.notes && <p><strong>Notes:</strong> {appt.notes}</p>}
                            {appt.requestedItems && appt.requestedItems.length > 0 ? (
                                <div>
                                    <p><strong>Requested Items:</strong> {appt.requestedItems.length} item(s)</p>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        {appt.requestedItems.map((item, idx) => (
                                            <li key={idx}>{item.name} ({item.category})</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p><strong>Requested Items:</strong> None</p>
                            )}
                        </div>

                        <div style={styles.actions}>
                            {appt.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(appt._id, "confirmed")}
                                        style={styles.confirmBtn}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(appt._id, "denied")}
                                        style={styles.denyBtn}
                                    >
                                        Deny
                                    </button>
                                </>
                            )}
                            {appt.status === "confirmed" && (
                                <button
                                    onClick={() => handleStatusChange(appt._id, "cancelled")}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(appt._id)}
                                style={styles.deleteBtn}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

const styles = {
    filterTabs: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap",
    },
    filter: {
        padding: "8px 16px",
        border: "1px solid #ccc",
        background: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
    },
    activeFilter: {
        padding: "8px 16px",
        border: "1px solid #000",
        background: "#000",
        color: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
    },
    card: {
        border: "1px solid #ddd",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "15px",
        background: "#fff",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "15px",
    },
    email: {
        color: "#666",
        fontSize: "0.9rem",
        margin: "4px 0 0 0",
    },
    status: (status) => ({
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        background:
            status === "confirmed" ? "#d4edda" :
                status === "pending" ? "#fff3cd" :
                    status === "denied" ? "#f8d7da" :
                        status === "cancelled" ? "#e2e3e5" :
                            "#f8f9fa",
        color:
            status === "confirmed" ? "#155724" :
                status === "pending" ? "#856404" :
                    status === "denied" ? "#721c24" :
                        status === "cancelled" ? "#383d41" :
                            "#000",
    }),
    cardBody: {
        marginBottom: "15px",
        lineHeight: "1.6",
    },
    actions: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },
    confirmBtn: {
        padding: "8px 16px",
        background: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
    denyBtn: {
        padding: "8px 16px",
        background: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
    cancelBtn: {
        padding: "8px 16px",
        background: "#ffc107",
        color: "#000",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
    deleteBtn: {
        padding: "8px 16px",
        background: "#6c757d",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
    },
};
