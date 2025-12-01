// AI-Assisted Code Notice:
// Student appointment view with modal-based rescheduling functionality was developed
// with AI assistance for complex state management and user interaction flows.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime, formatTimestamp } from "../utils/dateUtils";
import { appointmentsApi } from "../utils/api";
import "../styles/MyAppointments.css";

export default function MyAppointments({ userEmail }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [rescheduleReason, setRescheduleReason] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [rescheduleError, setRescheduleError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userEmail) {
            navigate("/signin");
            return;
        }
        fetchMyAppointments();
    }, [userEmail]);

    const fetchMyAppointments = async () => {
        try {
            const data = await appointmentsApi.getAll(userEmail);
            if (data.success) {
                const userAppointments = data.data.filter(appt => appt.userEmail === userEmail);
                setAppointments(userAppointments);
            }
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            const data = await appointmentsApi.cancel(appointmentId, userEmail);
            if (data.success) {
                fetchMyAppointments();
            }
        } catch (err) {
            console.error("Error cancelling appointment:", err);
        }
    };

    const handleRescheduleClick = (appt) => {
        setSelectedAppointment(appt);
        setNewDate("");
        setNewTime("");
        setRescheduleReason("");
        setAvailableSlots([]);
        setRescheduleError("");
        setRescheduleModalOpen(true);
    };

    const fetchAvailableSlotsForReschedule = async (dateStr) => {
        setLoadingSlots(true);
        setRescheduleError("");
        try {
            const data = await appointmentsApi.getAvailableSlots(dateStr);
            if (data.success) {
                setAvailableSlots(data.data.availableSlots || []);
            }
        } catch (err) {
            console.error("Error fetching slots:", err);
            setRescheduleError("Failed to load available time slots");
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateChange = (e) => {
        const dateStr = e.target.value;
        setNewDate(dateStr);
        setNewTime("");
        if (dateStr) {
            fetchAvailableSlotsForReschedule(dateStr);
        }
    };

    const handleRescheduleSubmit = async () => {
        if (!newDate || !newTime) {
            setRescheduleError("Please select both a date and time");
            return;
        }

        if (!rescheduleReason.trim()) {
            setRescheduleError("Please provide a reason for rescheduling");
            return;
        }

        try {
            const data = await appointmentsApi.update(selectedAppointment._id, {
                date: newDate,
                time: newTime,
                status: "pending",
                reason: rescheduleReason.trim()
            });
            if (data.success) {
                setRescheduleModalOpen(false);
                fetchMyAppointments();
            } else {
                setRescheduleError(data.error || "Failed to reschedule appointment");
            }
        } catch (err) {
            console.error("Error rescheduling appointment:", err);
            setRescheduleError("Failed to reschedule appointment");
        }
    };



    const getStatusMessage = (status) => {
        switch (status) {
            case "pending":
                return "Waiting for admin approval";
            case "confirmed":
                return "Approved - See you there!";
            case "denied":
                return "Not approved - Please contact the Career Closet";
            case "cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    const isPastAppointment = (appt) => {
        const appointmentDateTime = new Date(appt.date + "T" + appt.time);
        return appointmentDateTime < new Date() || appt.status === "completed" || appt.status === "cancelled" || appt.status === "denied";
    };

    const upcomingAppointments = appointments.filter(appt => !isPastAppointment(appt));
    const pastAppointments = appointments.filter(appt => isPastAppointment(appt));

    if (loading) {
        return (
            <div className="my-appointments-page">
                <div className="loading">Loading your appointments...</div>
            </div>
        );
    }

    return (
        <div className="my-appointments-page">
            <div className="appointments-header">
                <h1>My Appointments</h1>
                <p className="subtitle">View and manage your Career Closet appointments</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming ({upcomingAppointments.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                >
                    History ({pastAppointments.length})
                </button>
            </div>

            {activeTab === "upcoming" ? (
                upcomingAppointments.length === 0 ? (
                    <div className="no-appointments">
                        <p>You don't have any upcoming appointments.</p>
                        <button onClick={() => navigate("/book")} className="book-btn">
                            Book an Appointment
                        </button>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {upcomingAppointments.map((appt) => (
                            <div key={appt._id} className={`appointment-card status-${appt.status}`}>
                                <div className="appointment-header-section">
                                    <div className="appointment-date">
                                        <div className="date-large">{new Date(appt.date + "T00:00:00").getDate()}</div>
                                        <div className="date-month">
                                            {new Date(appt.date + "T00:00:00").toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                    </div>
                                    <div className="appointment-details">
                                        <h3>{formatDate(appt.date)}</h3>
                                        <p className="time">{formatTime(appt.time)} EST</p>
                                        <span className={`status-badge status-${appt.status}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="appointment-status-message">
                                    <p>{getStatusMessage(appt.status)}</p>
                                </div>

                                <div className="appointment-meta">
                                    <small>Booked: {formatTimestamp(appt.createdAt)}</small>
                                    {appt.updatedAt && appt.updatedAt !== appt.createdAt && (
                                        <small>Last updated: {formatTimestamp(appt.updatedAt)}</small>
                                    )}
                                </div>

                                {appt.requestedItems && appt.requestedItems.length > 0 && (
                                    <div className="requested-items">
                                        <strong>Requested Items:</strong>
                                        <ul>
                                            {appt.requestedItems.map((item, idx) => (
                                                <li key={idx}>{item.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(appt.status === "pending" || appt.status === "confirmed") && (
                                    <div className="appointment-actions">
                                        <button
                                            onClick={() => handleRescheduleClick(appt)}
                                            className="reschedule-appointment-btn"
                                        >
                                            Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleCancel(appt._id)}
                                            className="cancel-appointment-btn"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            ) : (
                pastAppointments.length === 0 ? (
                    <div className="no-appointments">
                        <p>You don't have any past appointments.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {pastAppointments.map((appt) => (
                            <div key={appt._id} className={`appointment-card status-${appt.status}`}>
                                <div className="appointment-header-section">
                                    <div className="appointment-date">
                                        <div className="date-large">{new Date(appt.date + "T00:00:00").getDate()}</div>
                                        <div className="date-month">
                                            {new Date(appt.date + "T00:00:00").toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                    </div>
                                    <div className="appointment-details">
                                        <h3>{formatDate(appt.date)}</h3>
                                        <p className="time">{formatTime(appt.time)} EST</p>
                                        <span className={`status-badge status-${appt.status}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="appointment-status-message">
                                    <p>{getStatusMessage(appt.status)}</p>
                                </div>

                                <div className="appointment-meta">
                                    <small>Booked: {formatTimestamp(appt.createdAt)}</small>
                                    {appt.updatedAt && appt.updatedAt !== appt.createdAt && (
                                        <small>Last updated: {formatTimestamp(appt.updatedAt)}</small>
                                    )}
                                </div>

                                {appt.requestedItems && appt.requestedItems.length > 0 && (
                                    <div className="requested-items">
                                        <strong>Requested Items:</strong>
                                        <ul>
                                            {appt.requestedItems.map((item, idx) => (
                                                <li key={idx}>{item.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {rescheduleModalOpen && selectedAppointment && (
                <div className="modal-overlay" onClick={() => setRescheduleModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reschedule Appointment</h2>
                            <button className="modal-close" onClick={() => setRescheduleModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="current-appointment-info">
                                Current: {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
                            </p>

                            <div className="form-field">
                                <label htmlFor="reschedule-date">Select New Date:</label>
                                <input
                                    id="reschedule-date"
                                    type="date"
                                    value={newDate}
                                    onChange={handleDateChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="date-input"
                                />
                            </div>

                            {loadingSlots && <p className="loading-text">Loading available times...</p>}

                            {newDate && !loadingSlots && availableSlots.length > 0 && (
                                <div className="form-field">
                                    <label>Select New Time:</label>
                                    <div className="time-slots-grid">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={`time-slot-btn ${newTime === slot ? 'selected' : ''}`}
                                                onClick={() => setNewTime(slot)}
                                            >
                                                {formatTime(slot)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {newDate && !loadingSlots && availableSlots.length === 0 && (
                                <p className="no-slots-message">No available time slots for this date.</p>
                            )}

                            {newDate && newTime && (
                                <div className="form-field">
                                    <label htmlFor="reschedule-reason">Reason for Rescheduling: *</label>
                                    <textarea
                                        id="reschedule-reason"
                                        value={rescheduleReason}
                                        onChange={(e) => setRescheduleReason(e.target.value)}
                                        placeholder="Please explain why you need to reschedule (e.g., class conflict, personal emergency)"
                                        className="reason-textarea"
                                        rows="3"
                                    />
                                    <small className="help-text-info">Your reschedule will require admin approval</small>
                                </div>
                            )}

                            {rescheduleError && <p className="error-message">{rescheduleError}</p>}
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => setRescheduleModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className="modal-btn confirm-btn"
                                onClick={handleRescheduleSubmit}
                                disabled={!newDate || !newTime || !rescheduleReason.trim()}
                            >
                                Request Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
