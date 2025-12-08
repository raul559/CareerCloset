/**
 * BookAppointment Component
 * Developed with AI assistance
 *
 * AI assisted with: date/time state management and slot availability fetching
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAppointment } from "../context/AppointmentContext";
import { formatDate as formatDateUtil, formatTime as formatTimeUtil } from "../utils/dateUtils";
import { appointmentsApi } from "../utils/api";
import "../styles/BookAppointment.css";

export default function BookAppointment({ userEmail, isAdmin = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const { requestedItems, clearItems, removeItem } = useAppointment();

  // Admin blocking state
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockingMode, setBlockingMode] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userEmail) {
      navigate("/signin", { state: { from: location.pathname }, replace: true });
    }
  }, [userEmail, navigate, location]);

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBlockedDates();
    }
  }, [isAdmin]);

  const fetchBlockedDates = async () => {
    try {
      const data = await appointmentsApi.getBlockedDates();
      if (data.success) {
        setBlockedDates(data.data);
      }
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  };

  // Fetch available slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    const dateStr = date.toISOString().split('T')[0];

    try {
      const data = await appointmentsApi.getAvailableSlots(dateStr);
      if (data.success) {
        setAvailableSlots(data.data.availableSlots || []);
        setBookedSlots(data.data.bookedSlots || []);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateClick = async (date) => {
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (isAdmin && blockingMode) {
      const dateStr = date.toISOString().split('T')[0];
      const isBlocked = blockedDates.includes(dateStr);

      if (isBlocked) {
        await unblockDay(dateStr);
      } else {
        await blockDay(dateStr);
      }
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);
    setError("");
  };

  const blockDay = async (dateStr) => {
    try {
      const data = await appointmentsApi.block({
        date: dateStr,
        blockEntireDay: true,
        reason: "Admin blocked day",
        adminId: userEmail
      });
      if (data.success) {
        fetchBlockedDates();
        fetchAppointments();
      }
    } catch (err) {
      console.error("Error blocking day:", err);
    }
  };

  const unblockDay = async (dateStr) => {
    try {
      const data = await appointmentsApi.unblockDay(dateStr);
      if (data.success) {
        fetchBlockedDates();
        fetchAppointments();
        if (selectedDate && selectedDate.toISOString().split('T')[0] === dateStr) {
          setSelectedDate(null);
        }
      }
    } catch (err) {
      console.error("Error unblocking day:", err);
    }
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    setError("");
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }
    if (!selectedTime) {
      setError("Please select a time slot.");
      return;
    }

    const appointmentData = {
      userId: email,
      userName: name,
      userEmail: email,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      requestedItems: requestedItems.map(item => ({
        id: item._id || item.id,
        name: item.name,
        category: item.category,
        color: item.color,
        size: item.size
      })),
      notes: ""
    };

    try {
      const data = await appointmentsApi.create(appointmentData);

      if (data.success) {
        setSuccess("Appointment booked successfully!");
        setError("");
        setName("");
        setEmail("");
        setSelectedDate(null);
        setSelectedTime(null);
        clearItems();

        if (selectedDate) {
          fetchAvailableSlots(selectedDate);
        }
      } else {
        setError(data.error || "Failed to book appointment.");
      }
    } catch (err) {
      setError("Failed to book appointment. Please try again.");
    }
  };

  // Wrapper for Date objects (util expects date strings)
  const formatDate = (date) => {
    if (!date) return "";
    const dateStr = date.toISOString().split('T')[0];
    return formatDateUtil(dateStr);
  };

  // Wrapper to add EST suffix
  const formatTime = (time24) => {
    return formatTimeUtil(time24) ? `${formatTimeUtil(time24)} EST` : "";
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateFullyBlocked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.includes(dateStr);
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="appointment-page">
      {isAdmin && (
        <div className="admin-section">
          <div className="admin-controls">
            <button
              className={`admin-btn ${blockingMode ? 'blocking-active' : ''}`}
              onClick={() => setBlockingMode(!blockingMode)}
            >
              {blockingMode ? 'Done Blocking' : 'Block Days'}
            </button>
            {blockingMode && <span className="blocking-hint">Click dates to block/unblock</span>}
            {blockedDates.length > 0 && (
              <span className="blocked-count">{blockedDates.length} day(s) blocked</span>
            )}
          </div>
        </div>
      )}

      <div className="appointment-container">
        <div className="appointment-header">
          <h1>Book Career Closet Appointment</h1>
          <p className="appointment-subtitle">30 min appointments • In-person consultation</p>
        </div>

        <div className="appointment-content">
          {/* Calendar Section */}
          <div className="calendar-section">
            <h2>Select an appointment time</h2>

            <div className="calendar">
              <div className="calendar-header">
                <button onClick={previousMonth} className="nav-btn">
                  <FaChevronLeft />
                </button>
                <span className="month-name">{monthName}</span>
                <button onClick={nextMonth} className="nav-btn">
                  <FaChevronRight />
                </button>
              </div>

              <div className="calendar-grid">
                <div className="weekday-header">S</div>
                <div className="weekday-header">M</div>
                <div className="weekday-header">T</div>
                <div className="weekday-header">W</div>
                <div className="weekday-header">T</div>
                <div className="weekday-header">F</div>
                <div className="weekday-header">S</div>

                {days.map((date, index) => (
                  <button
                    key={index}
                    className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''} ${isDateFullyBlocked(date) ? 'fully-blocked' : ''} ${isWeekend(date) ? 'weekend' : ''}`}
                    onClick={() => handleDateClick(date)}
                    disabled={!date || date < new Date().setHours(0, 0, 0, 0)}
                  >
                    {date ? date.getDate() : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="slots-section">
            {selectedDate ? (
              <>
                <h3>{formatDate(selectedDate)}</h3>

                {loadingSlots ? (
                  <div className="loading">Loading available slots...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="no-slots">No available slots for this date.</div>
                ) : (
                  <div className="time-slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => handleTimeClick(slot)}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="select-date-prompt">
                <p>Select a date from the calendar to view available time slots</p>
              </div>
            )}

            <form className="booking-form" onSubmit={handleBookAppointment}>
              <h3>Confirm your details</h3>

              <div className="form-field">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@pfw.edu"
                  required
                />
              </div>

              {requestedItems.length > 0 && (
                <div className="requested-items-summary">
                  <strong>Requested Items ({requestedItems.length}):</strong>
                  <ul>
                    {requestedItems.map(item => {
                      const itemId = item._id || item.id || item.clothingId;
                      return (
                        <li key={itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span>
                            {item.name}
                            {item.size && <span> - Size: {item.size}</span>}
                            {item.color && <span> - Color: {item.color}</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(itemId)}
                            style={{
                              background: '#ff6b6b',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button
                type="submit"
                className="book-btn"
                disabled={!selectedDate || !selectedTime || !name.trim() || !email.trim()}
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
