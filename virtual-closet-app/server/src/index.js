// server/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ----------------------
// Resolve directory paths
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------
// Load ROOT .env FIRST (must be BEFORE app creation)
// ----------------------
dotenv.config({
  path: join(__dirname, "..", ".env"),
});

console.log("DEBUG: Loaded GCS_BUCKET =", process.env.GCS_BUCKET);

// ----------------------
// Create Express App (AFTER env loads)
// ----------------------
const app = express();

// ----------------------
// Import DB + Routes (AFTER app is created)
// ----------------------
import { connectDB } from "./config/database.js";
import clothingRoutes from "./routes/clothing.js";
import imageRoutes from "./routes/images.js";
import uploadRoute from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";
import appointmentRoutes from "./routes/appointments.js";


// ----------------------
// Server Port
// ----------------------
const PORT = process.env.PORT || 5001;


// Load .env from parent directory (server/.env)
dotenv.config({ path: join(__dirname, "..", ".env") });

async function startServer() {
  try {
    const app = express();


    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // ----------------------
    // Connect Database
    // ----------------------
    if (process.env.NODE_ENV !== "test") {
      await connectDB();
      console.log("MongoDB connected");
    }

    // ----------------------
    // API Routes
    // ----------------------
    app.use("/api/upload", uploadRoute);
    app.use("/api/clothing", clothingRoutes);
    app.use("/api/images", imageRoutes);
    app.use("/api/admin", adminRoutes);

    // ----------------------
    // Health check
    // ----------------------
    app.get("/api/health", (req, res) => {
      res.json({
        status: "OK",
        message: "Virtual Closet API is running",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });

    // ----------------------
    // Root route
    // ----------------------
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
          appointments: {
            getAll: "GET /api/appointments",
            getById: "GET /api/appointments/:id",
            create: "POST /api/appointments",
            update: "PUT /api/appointments/:id",
            cancel: "PATCH /api/appointments/:id/cancel",
            delete: "DELETE /api/appointments/:id",
            availableSlots: "GET /api/appointments/available-slots?date=2025-11-22",
            blockSlot: "POST /api/appointments/admin/block",
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
          "GET /api/appointments",
          "GET /api/appointments/available-slots?date=2025-11-22",
        ],
      });
    });

    // Mount routes
    app.use("/api/clothing", clothingRoutes);
    app.use("/api/images", imageRoutes);
    app.use("/api/appointments", appointmentRoutes);
    app.use("/api/upload", uploadRoute);
    app.use("/api/admin", adminRoutes);

    // 404 handler - catches all undefined routes
    app.use((req, res) => {
      res.status(404).json({
        error: "Not Found",
        message: `Cannot ${req.method} ${req.path}`,
      });
    });

    // ----------------------
    // Error Handler
    // ----------------------
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // ----------------------
    // Start Server (BLOCKED during tests)
// ----------------------
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`API available at: http://localhost:${PORT}/`);
      });
    } else {
      console.log("🧪 Test environment detected — server NOT started.");
    }

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

// ----------------------
// Export app LAST
// ----------------------
export default app;
