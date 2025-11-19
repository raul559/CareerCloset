// src/pages/Home.jsx
import "../styles/mainPage.css"; // or wherever your CSS lives
import{useNavigate} from "react-router-dom";

export default function Home() {
  const navigate =useNavigate();
  return (
    <div className="career-closet">
      

      <main className="main-section">
        <h1>Professional Attire for Your Career Success</h1>
        <h3>
          Access professional clothing and accessories to help you succeed in
          interviews, career fairs, and your professional journey. Browse our
          collection online and schedule convenient appointments.
        </h3>

        <img src="/group_pic.png" alt="Career Closet Group" />

        <div className="main-buttons">
          <button id="browseBtn" onClick={() =>navigate("/browse")}>Browse Closet</button>
          <button id="aptBtn" onClick={() =>navigate("/book")}>Book Appointment</button>
        </div>
      </main>
    </div>
  );
}
