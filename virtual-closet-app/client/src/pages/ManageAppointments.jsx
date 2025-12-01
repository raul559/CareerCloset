// AI-Assisted Code Notice:
// Admin appointment management UI with filtering, status management, and bulk operations
// was developed with AI assistance for component structure and state management patterns.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime, formatTimestamp } from "../utils/dateUtils";
import { appointmentsApi } from "../utils/api";
import "../styles/ManageAppointments.css";

export default function ManageAppointments({ userEmail, isAdmin = false }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
            return;
        }
        fetchAppointments();
    }, [isAdmin, navigate]);

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

    const handleApprove = async (appointmentId) => {
        try {
            const data = await appointmentsApi.update(appointmentId, { status: "confirmed" });
            if (data.success) fetchAppointments();
        } catch (err) {
            console.error("Error approving appointment:", err);
        }
    };

    const handleDeny = async (appointmentId) => {
        try {
            const data = await appointmentsApi.update(appointmentId, { status: "denied" });
            if (data.success) fetchAppointments();
        } catch (err) {
            console.error("Error denying appointment:", err);
        }
    };

    const handleCancel = async (appointmentId) => {
        try {
            const data = await appointmentsApi.cancel(appointmentId);
            if (data.success) fetchAppointments();
        } catch (err) {
            console.error("Error cancelling appointment:", err);
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
        return (
            <div className="manage-appointments-page">
                <div className="loading">Loading appointments...</div>
            </div>
        );
    }

    return (
        <div className="manage-appointments-page">
            <div className="page-header">
                <h1>Manage Appointments</h1>
                <p className="subtitle">Admin panel for reviewing and managing student appointments</p>
            </div>

            <div className="filter-tabs">
                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                >
                    All ({statusCounts.all})
                </button>
                <button
                    className={filter === "pending" ? "active" : ""}
                    onClick={() => setFilter("pending")}
                >
                    Pending ({statusCounts.pending})
                </button>
                <button
                    className={filter === "confirmed" ? "active" : ""}
                    onClick={() => setFilter("confirmed")}
                >
                    Confirmed ({statusCounts.confirmed})
                </button>
                <button
                    className={filter === "denied" ? "active" : ""}
                    onClick={() => setFilter("denied")}
                >
                    Denied ({statusCounts.denied})
                </button>
                <button
                    className={filter === "cancelled" ? "active" : ""}
                    onClick={() => setFilter("cancelled")}
                >
                    Cancelled ({statusCounts.cancelled})
                </button>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                    <p>No {filter !== "all" ? filter : ""} appointments found.</p>
                </div>
            ) : (
                <div className="appointments-table-container">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Student</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Requested Items</th>
                                <th>Timestamps</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((appt) => (
                                <tr key={appt._id} className={`status-row-${appt.status}`}>
                                    <td className="date-cell">
                                        <div className="date-time">
                                            <div className="date">{formatDate(appt.date)}</div>
                                            <div className="time">{formatTime(appt.time)} EST</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="student-info">
                                            <div className="name">{appt.userName || "N/A"}</div>
                                            {appt.studentId && <div className="student-id">ID: {appt.studentId}</div>}
                                            {appt.major && <div className="major">{appt.major}</div>}
                                        </div>
                                    </td>
                                    <td className="contact-cell">{appt.userEmail}</td>
                                    <td>
                                        <span className={`status-badge status-${appt.status}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="items-cell">
                                        {appt.requestedItems && appt.requestedItems.length > 0 ? (
                                            <ul className="items-list">
                                                {appt.requestedItems.slice(0, 3).map((item, idx) => (
                                                    <li key={idx}>{item.name}</li>
                                                ))}
                                                {appt.requestedItems.length > 3 && (
                                                    <li className="more">+{appt.requestedItems.length - 3} more</li>
                                                )}
                                            </ul>
                                        ) : (
                                            <span className="no-items">No items</span>
                                        )}
                                    </td>
                                    <td className="timestamp-cell">
                                        <div className="timestamp-info">
                                            <div className="timestamp-label">Booked:</div>
                                            <div className="timestamp-value">{formatTimestamp(appt.createdAt)}</div>
                                            {appt.updatedAt && appt.updatedAt !== appt.createdAt && (
                                                <>
                                                    <div className="timestamp-label">Updated:</div>
                                                    <div className="timestamp-value">{formatTimestamp(appt.updatedAt)}</div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {appt.status === "pending" && (
                                                <>
                                                    <button onClick={() => handleApprove(appt._id)} className="approve-btn" title="Approve">
                                                        ✓ Approve
                                                    </button>
                                                    <button onClick={() => handleDeny(appt._id)} className="deny-btn" title="Deny">
                                                        ✗ Deny
                                                    </button>
                                                </>
                                            )}
                                            {(appt.status === "pending" || appt.status === "confirmed") && (
                                                <button onClick={() => handleCancel(appt._id)} className="cancel-btn" title="Cancel">
                                                    Cancel
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(appt._id)} className="delete-btn" title="Delete">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
