import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const userEmail = req.headers['x-user-email'];

    // Try JWT Bearer first (production)
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded should contain user id (adjust if your payload is different)
      const user = await User.findById(decoded.id).select("role email name");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
      }

      // Attach user to request for controllers to use
      req.user = user;
      return next();
    }

    // Fallback to simple auth header (development)
    if (userEmail) {
      const isAdmin = userEmail.toLowerCase() === 'admin@pfw.edu';
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access only" });
      }
      
      req.user = {
        id: userEmail,
        email: userEmail,
        isAdmin: true,
      };
      return next();
    }

    return res.status(401).json({ message: "No token provided" });
  } catch (err) {
    console.error("adminAuth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
