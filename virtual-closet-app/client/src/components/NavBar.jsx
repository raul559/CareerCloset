import { NavLink } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import pfwLogo from "/pfw-Logo.svg";
import "../styles/navBar.css";

function getInitials(email) {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar({ loggedIn, userEmail, onLogout, isAdmin = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function handleSignOut() {
    if (onLogout) {
      onLogout();
    }
    setMenuOpen(false);
  }

  return (
    <nav>
      <ul>
        <li className="brand">
          <NavLink to="/" className="brandLink">
            <img src={pfwLogo} alt="PFW logo" className="brand-logo" />
            <span>Career Closet</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/browse">Browse Clothing</NavLink>
        </li>

        <li>
          <NavLink to="/build">Build Outfit</NavLink>
        </li>

        <li style={{ position: "relative" }}>
          {loggedIn ? (
            <>
              <button
                className="signIn"
                style={{ minWidth: 44, fontSize: "1rem" }}
                title={userEmail}
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {getInitials(userEmail)}
              </button>
              {menuOpen && (
                <div ref={menuRef} className="dropdown-menu" style={{ position: "absolute", right: 0, top: "110%", background: "white", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 200, zIndex: 10 }}>
                  {isAdmin ? (
                    <NavLink to="/admin" className="dropdown-item" style={{ display: "block", width: "100%", padding: "10px 16px", textDecoration: "none", color: "inherit" }} onClick={() => setMenuOpen(false)}>
                      Admin Dashboard
                    </NavLink>
                  ) : (
                    <NavLink to="/" className="dropdown-item" style={{ display: "block", width: "100%", padding: "10px 16px", textDecoration: "none", color: "inherit" }} onClick={() => setMenuOpen(false)}>
                      Home
                    </NavLink>
                  )}
                  <NavLink to="/favorites" className="dropdown-item" style={{ display: "block", width: "100%", padding: "10px 16px", textDecoration: "none", color: "inherit" }} onClick={() => setMenuOpen(false)}>
                    My Favorites
                  </NavLink>
                  <button className="dropdown-item" style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", textAlign: "left", cursor: "pointer" }} onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <NavLink to="/signin" className="signIn">Sign In</NavLink>
          )}
        </li>
      </ul>
    </nav>
  );
}
