import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminUserManagement from "../components/AdminUserManagement";
import AdminClothingManagement from "../components/AdminClothingManagement";
import AdminAppointmentManagement from "../components/AdminAppointmentManagement";

import UploadImages from "./UploadImages";

import { getStats, getAppointments } from "../services/adminApi";
import auth from "../utils/auth";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // -------- ROUTE PROTECTION --------
  useEffect(() => {
    const user = auth.getCurrentUser();
    if (!user || !user.isAdmin) {
      navigate("/");
    }
  }, [navigate]);

  // -------- LOAD DASHBOARD DATA --------
  useEffect(() => {
    getStats().then((res) => setStats(res.data));
    getAppointments().then((res) => setAppointments(res.data));
  }, []);

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>

      {/* TABS */}
      <div style={styles.tabs}>
        <button onClick={() => setTab("users")} style={styles.tab(tab === "users")}>
          Users
        </button>

        <button
          onClick={() => setTab("clothing")}
          style={styles.tab(tab === "clothing")}
        >
          Clothing
        </button>

        <button onClick={() => setTab("stats")} style={styles.tab(tab === "stats")}>
          Stats
        </button>

        <button
          onClick={() => setTab("appointments")}
          style={styles.tab(tab === "appointments")}
        >
          Appointments
        </button>

        {/* ⭐ NEW TAB BUTTON — Upload */}
        <button
          onClick={() => setTab("upload")}
          style={styles.tab(tab === "upload")}
        >
          Upload
        </button>
      </div>

      <div style={styles.content}>
        {tab === "users" && <AdminUserManagement />}
        {tab === "clothing" && <AdminClothingManagement />}

        {tab === "stats" && (
          <div>
            <h2>System Statistics</h2>
            {!stats ? (
              <p>Loading...</p>
            ) : (
              <ul>
                <li>Total Users: {stats.totalUsers}</li>
                <li>Total Items: {stats.totalItems}</li>
                <li>Total Outfits: {stats.totalOutfits}</li>
                <li>Total Appointments: {stats.totalAppointments}</li>
              </ul>
            )}
          </div>
        )}

        {tab === "appointments" && <AdminAppointmentManagement />}

        {tab === "upload" && <UploadImages />}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "25px" },
  tabs: { display: "flex", gap: "10px", marginBottom: "20px" },
  tab: (active) => ({
    padding: "10px 16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: active ? "#222" : "#eee",
    color: active ? "#fff" : "#000",
    cursor: "pointer",
  }),
  content: {
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "8px",
  },
  card: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};
