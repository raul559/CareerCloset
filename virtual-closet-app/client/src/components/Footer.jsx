import { useNavigate } from "react-router-dom";
import "../styles/global.css";


export default function Footer(){
    const navigate = useNavigate();
    return(
        <footer>
            <div className="footer-content">
                <h3>
                    Career Closet supporting student success through professional attire
                    and career development resources. A service of the University Career
                    Services Center.
                </h3>

                <h2>Quick Links</h2>
                <div className="footer-buttons">
                    <button id="lowerBrowseBtn" onClick={() =>navigate("/browse")}> Browse Clothing</button>
                    <button id="lowerBookBtn" onClick={() =>navigate("/book")} > Book Appointment</button>
                    <button id="lowerBuildBtn"onClick={() =>navigate("/build")}  >Build Outfit</button>
                </div>
            </div>

            <p className="copyright">
                © 2025 University Career Services. All rights reserved.
            </p>
        </footer>
    );
}