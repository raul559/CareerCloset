import { NavLink } from "react-router-dom";
import pfwLogo from "/pfw-Logo.svg"; 
import "../styles/navBar.css"
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
  }, []);

  return (
    <nav>
      <ul>
        <li className="brand">
          <NavLink to="/" className="brandLink">
            <img src={pfwLogo} alt="PFW logo" className="brand-logo"/>
            <span>Career Closet</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/browse">Browse Clothing</NavLink>
        </li>

        <li>
          <NavLink to="/book">Book Appointment</NavLink>
        </li>

        <li>
          <NavLink to="/build">Build Outfit</NavLink>
        </li>

        <li>
          <NavLink to="/signin" className="signIn">Sign In</NavLink>
        </li>

        {/* ⭐ ADMIN / NON-ADMIN UPLOAD LOGIC ⭐ */}
        <li>
          {user?.role === "admin" ? (
            // Admin sees clickable link
            <NavLink to="/upload">Upload Images</NavLink>
          ) : (
            // Non-admin sees greyed-out unclickable text
            <span
              style={{
                color: "gray",
                opacity: 0.5,
                cursor: "not-allowed",
                padding: "8px 12px",
                display: "inline-block"
              }}
              title="Admins only"
            >
              Upload Images
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
