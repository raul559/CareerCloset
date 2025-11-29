// server/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectDB } from "./config/database.js";

// Import routes
import clothingRoutes from "./routes/clothing.js";
import imageRoutes from "./routes/images.js";
import uploadRoute from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (server/.env)
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Upload route
app.use("/api/upload", uploadRoute);

// Clothing + image routes
app.use("/api/clothing", clothingRoutes);
app.use("/api/images", imageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Virtual Closet API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Virtual Closet API",
    version: "1.0.0",
  });
});

// Mount routes
app.use("/api/clothing", clothingRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/admin", adminRoutes);


// 404 handler - catches all undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
