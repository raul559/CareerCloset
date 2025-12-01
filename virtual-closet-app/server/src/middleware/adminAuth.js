import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

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
    next();
  } catch (err) {
    console.error("adminAuth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
