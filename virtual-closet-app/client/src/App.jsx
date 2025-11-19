import { Routes, Route } from "react-router-dom";
import { AppointmentProvider } from "./context/AppointmentContext";
import { OutfitProvider } from "./context/OutfitContext";
import { AdminProvider } from "./contexts/AdminContext";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import BrowseClothing from "./pages/BrowseClothing";
import BookAppointment from "./pages/BookAppointment";
import BuildOutfit from "./pages/BuildOutfit";
import SignIn from "./pages/SignIn";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import "./styles/global.css";

export default function App() {
  return (
    <AdminProvider>
      <AppointmentProvider>
        <OutfitProvider>

          <NavBar />

          <main style={{ padding: "1rem" }}>
            <Routes>

              {/* User Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseClothing />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/build" element={<BuildOutfit />} />
              <Route path="/signin" element={<SignIn />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

            </Routes>
          </main>

          <Footer />

        </OutfitProvider>
      </AppointmentProvider>
    </AdminProvider>
  );
}
