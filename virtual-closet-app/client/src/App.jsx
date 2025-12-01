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


export default function App() {
  return (
    <AppointmentProvider>
    <OutfitProvider>
      <NavBar />
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseClothing />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/build" element={<BuildOutfit />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </OutfitProvider>
    </AppointmentProvider>
  );
}

