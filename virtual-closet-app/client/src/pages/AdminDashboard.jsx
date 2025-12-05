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
  container: { 
    minHeight: "100vh",
    background: "linear-gradient(135deg, #cfb991 0%, #d4c5a3 100%)",
    padding: "40px 20px",
  },
  header: {
    marginBottom: "40px",
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.95)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },
  title: {
    margin: "0 0 10px 0",
    color: "#222",
  },
  subtitle: {
    margin: "0",
    color: "#666",
    fontSize: "1rem",
  },
  tabsWrapper: {
    marginBottom: "30px",
    overflowX: "auto",
  },
  tabs: { 
    display: "flex", 
    gap: "12px", 
    minWidth: "fit-content",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tab: (active) => ({
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    background: active ? "linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)" : "#ffffff",
    color: active ? "#fff" : "#333",
    cursor: "pointer",
    fontWeight: active ? "600" : "500",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: active ? "0 4px 12px rgba(0, 0, 0, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  }),
  tabIcon: {
    fontSize: "1.2rem",
  },
  content: {
    background: "rgba(255, 255, 255, 0.97)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    minHeight: "400px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  statCard: {
    background: "linear-gradient(135deg, #f5f5f5 0%, #fff 100%)",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    textAlign: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  statLabel: {
    color: "#666",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#3a3a3a",
  },
  card: {
    border: "1px solid #e0e0e0",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
    background: "#f9f9f9",
  },
};
