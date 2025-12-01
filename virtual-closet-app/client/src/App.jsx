import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppointmentProvider } from "./context/AppointmentContext";
import { OutfitProvider } from "./context/OutfitContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BrowseClothing from "./pages/BrowseClothing";
import BookAppointment from "./pages/BookAppointment";
import BuildOutfit from "./pages/BuildOutfit";
import SignIn from "./pages/SignIn";
import UploadImages from "./pages/UploadImages.jsx";
import "./styles/global.css";
import AdminDashboard from "./pages/AdminDashboard";
import auth from "./utils/auth";

function AppContent() {
  const [user, setUser] = React.useState(() => auth.getCurrentUser());
  const loggedIn = !!user;
  const userEmail = user?.email || "";

  React.useEffect(() => {
    const handleStorageChange = () => {
      setUser(auth.getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogin = (email, password, remember) => {
    const result = auth.login(email, password, remember);
    if (result.success) {
      setUser(auth.getCurrentUser());
    }
    return result;
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <OutfitProvider>
      <NavBar
        loggedIn={loggedIn}
        userEmail={userEmail}
        onLogout={handleLogout}
        isAdmin={user?.isAdmin || false}
      />
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseClothing />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/build" element={<BuildOutfit />} />
          <Route path="/signin" element={<SignIn onLogin={handleLogin} loggedIn={loggedIn} />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </OutfitProvider>
  );
}

export default function App() {
  return (
    <AppointmentProvider>
      <AppContent />
    </AppointmentProvider>
  );
}

