<<<<<<< HEAD
// server/src/index.js
=======
>>>>>>> f2959851b81eeeb50cb775b4e60cabc8acbe9490
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import connectDB from "./config/database.js";

// Import routes
import clothingRoutes from "./routes/clothing.js";
import imageRoutes from "./routes/images.js";
import appointmentRoutes from "./routes/appointments.js";
import uploadRoute from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";
<<<<<<< HEAD
=======

const PORT = process.env.PORT || 5001;

<<<<<<< HEAD
// Load .env from parent directory (server/.env)
dotenv.config({ path: join(__dirname, "..", ".env") });
>>>>>>> f2959851b81eeeb50cb775b4e60cabc8acbe9490
=======
async function startServer() {
  try {
    const app = express();
>>>>>>> 98e2e86ce79913a1f921b790828ee8a56a4dd361

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Load .env from project root
dotenv.config({
  path: join(__dirname, "../..", ".env"),
});

// Debug
console.log("ENV LOADED FROM:", join(__dirname, "../..", ".env"));
console.log("GCS_BUCKET:", process.env.GCS_BUCKET);

=======
    // Connect to MongoDB database
    await connectDB();
    console.log("MongoDB connected successfully");
>>>>>>> 98e2e86ce79913a1f921b790828ee8a56a4dd361

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

<<<<<<< HEAD
<<<<<<< HEAD
// Connect to MongoDB
connectDB();

// Upload route
app.use("/api/upload", uploadRoute);

// Clothing + image routes
app.use("/api/clothing", clothingRoutes);
app.use("/api/images", imageRoutes);

// Health check
=======
// Connect to MongoDB database
connectDB();

// Health check endpoint
>>>>>>> f2959851b81eeeb50cb775b4e60cabc8acbe9490
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Virtual Closet API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

<<<<<<< HEAD
// Root route
=======
// Root endpoint - welcome message
>>>>>>> f2959851b81eeeb50cb775b4e60cabc8acbe9490
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
=======
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

    // Error handling middleware - catches all errors
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });
>>>>>>> 98e2e86ce79913a1f921b790828ee8a56a4dd361

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`API available at: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
