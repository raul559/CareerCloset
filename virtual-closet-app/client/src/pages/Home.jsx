import { useNavigate } from "react-router-dom";
import "../styles/mainPage.css";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="career-closet">
      <main className="main-section">
        <div className="content-wrapper">
          <h1>Professional Attire for Your Career Success</h1>
          <h3>
            Access professional clothing and accessories to help you succeed in
            interviews, career fairs, and your professional journey. Browse our
            collection online and build your perfect outfit.
          </h3>

          <div className="main-buttons">
            <button className="primary-btn" onClick={() => navigate("/browse")}>
              <span className="btn-icon">👔</span>
              Browse Closet
            </button>
            <button className="secondary-btn" onClick={() => navigate("/build")}>
              <span className="btn-icon">✨</span>
              Build Outfit
            </button>
          </div>
        </div>

        <img src="/group_pic.JPG" alt="Career Closet Group" className="hero-image" />
      </main>
    </div>
  );
}
