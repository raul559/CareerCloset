import { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) verifyToken(token);
    else setLoading(false);
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/verify", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
      } else {
        localStorage.removeItem("adminToken");
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem("adminToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      setAdmin(data.admin);
      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, getAuthHeader }}>
      {children}
    </AdminContext.Provider>
  );
};
