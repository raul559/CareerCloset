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

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (server/.env)
dotenv.config({ path: join(__dirname, "..", ".env") });

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

// Connect to MongoDB database
connectDB();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Virtual Closet API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint - welcome message
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Virtual Closet API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      clothing: {
        getAll: "GET /api/clothing?userId=virtual-closet-user",
        getById: "GET /api/clothing/:clothingId",
      },
      images: {
        syncUrls: "PUT /api/images/sync-urls",
        missing: "GET /api/images/missing?userId=virtual-closet-user",
      },
    },
    users: {
      default: "virtual-closet-user (1,033 items)",
      test: "test-user-123 (0 items)",
    },
    quickTests: [
      "GET /api/health",
      "GET /api/clothing?userId=virtual-closet-user",
      "GET /api/clothing/1001",
      "GET /api/images/missing?userId=virtual-closet-user&limit=5",
    ],
  });
});

// Mount routes
app.use("/api/clothing", clothingRoutes);
app.use("/api/images", imageRoutes);

// 404 handler - catches all undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware - catches all errors
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`API available at: http://localhost:${PORT}/`);
});

// Graceful shutdown handler
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
