import React from "react";
import { Routes, Route } from "react-router-dom";
import { OutfitProvider } from "./context/OutfitContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import BrowseClothing from "./pages/BrowseClothing";
import BuildOutfit from "./pages/BuildOutfit";
import SignIn from "./pages/SignIn";
import AdminDashboard from "./pages/AdminDashboard";
import MyFavorites from "./pages/MyFavorites";
import auth from "./utils/auth";
import "./styles/global.css";

function AppContent() {
  const [user, setUser] = React.useState(() => auth.getCurrentUser());
  const loggedIn = !!user;
  const userEmail = user?.email || "";

  // Sync auth state across tabs
  React.useEffect(() => {
    const handleStorageChange = () => {
      setUser(auth.getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogin = (email, password, remember) => {
    // Fetch the user from storage (it should already be set by SignIn component)
    const user = auth.getCurrentUser();
    if (user) {
      setUser(user);
      return { success: true };
    }
    return { success: false, error: 'Login failed' };
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
          <Route path="/browse" element={<BrowseClothing userEmail={userEmail} />} />
          <Route path="/build" element={<BuildOutfit />} />
          <Route path="/signin" element={<SignIn onLogin={handleLogin} loggedIn={loggedIn} />} />
          <Route path="/favorites" element={<MyFavorites />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </OutfitProvider>
  );
}

export default function App() {
  return (
    <OutfitProvider>
      <AppContent />
    </OutfitProvider>
  );
}

