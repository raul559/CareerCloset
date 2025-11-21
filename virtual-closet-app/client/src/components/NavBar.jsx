import { NavLink } from "react-router-dom";
import pfwLogo from "/pfw-Logo.svg"; 
import "../styles/navBar.css"

export default function Navbar() {
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
        <li>
          <NavLink to="/upload"Upload Images>Upload Images</NavLink> 
        </li>
      </ul>
    </nav>
  );
}
