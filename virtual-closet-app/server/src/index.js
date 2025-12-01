import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ES module __filename and __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables from .env file
dotenv.config();

import { connectDB } from "./config/database.js";

// Import routes
import clothingRoutes from "./routes/clothing.js";
import imageRoutes from "./routes/images.js";
import uploadRoute from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";


// Load .env from parent directory (server/.env)
dotenv.config({ path: join(__dirname, "..", ".env") });

// Get directory name for ES modules only once
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Connect to MongoDB database
    await connectDB();

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({
        status: "OK",
        message: "Virtual Closet API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Root endpoint
    app.get("/", (req, res) => {
      res.json({
        message: "Virtual Closet API",
        version: "1.0.0",
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
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
