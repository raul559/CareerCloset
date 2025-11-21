import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useAppointment } from "../context/AppointmentContext";
import{useNavigate} from "react-router-dom";
import "../styles/BookAppointment.css";

export default function BookAppointment() {
    const navigate =useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [itemText, setItemText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { requestedItems, addItem, removeItem, clearItems } = useAppointment();

  // Handshake URL
  const HANDSHAKE_URL = "https://app.joinhandshake.com/stu/appointments/new";

  // Today (YYYY-MM-DD)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Available time slots
  const TIME_SLOTS = [
    "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM",
    "01:00 PM","01:30 PM","02:00 PM","02:30 PM",
  ];

  function addManualItem() {
    const text = itemText.trim();
    if (!text) return;
    
    // Create manual item and add to context
    const manualItem = {
      id: `manual-${Date.now()}`,
      name: text,
      category: "Manual Entry",
      color: "",
      size: "",
      isManual: true
    };
    
    addItem(manualItem);
    setItemText("");
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your name.");
      setSuccess("");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }
    if (!date) {
      setError("Please select a day for your appointment.");
      setSuccess("");
      return;
    }
    if (!selectedTime) {
      setError("Please pick a time slot.");
      setSuccess("");
      return;
    }
    if (requestedItems.length === 0) {
      setError("Please add at least one requested item.");
      setSuccess("");
      return;
    }

    setSuccess(`Appointment booked for ${name} on ${date} at ${selectedTime}!`);
    setError("");

    // reset
    setName("");
    setEmail("");
    setDate("");
    setSelectedTime("");
    setItemText("");
    clearItems();
  }

  return (
    <section className="app-container">
      <div className="form-box">
        <h1>Book Appointment</h1>

        {/* Handshake booking */}
        <div className="handshake-cta">
          <p>Prefer to book directly on Handshake?</p>
          <a
            className="btn-handshake"
            href={HANDSHAKE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Continue on Handshake
          </a>
        </div>

        {/* Divider */}
        <div className="or-divider">
          <span>or</span>
        </div>

        {/* Local form as backup */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Doe"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Choose a date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={todayStr}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Choose a time</label>
            <div className="slots-grid">
              {TIME_SLOTS.map((t) => {
                const isSelected = selectedTime === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`slot-btn ${isSelected ? "slot-selected" : ""}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requested Items */}
          <div style={{ marginBottom: 12 }}>
            <label>Requested Items</label>
            
            {/* Display items from browse page */}
            {requestedItems.length > 0 && (
              <div className="items-list" style={{ marginBottom: 12 }}>
                {requestedItems.map((item) => (
                  <div key={item.id} className="item">
                    <span>
                      {item.isManual ? (
                        item.name
                      ) : (
                        `${item.name} - ${item.category} (${item.color}, Size ${item.size})`
                      )}
                    </span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
            

            {/* Manual entry option */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addManualItem();
                  }
                }}
                placeholder="Or type item manually and press Add"
              />
              <button type="button" onClick={addManualItem} className="btn-add">
                <FaPlus /> Add
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </div>

          <button type="submit" className="btn-submit">
            Book Appointment
          </button>

          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </section>
  );
}