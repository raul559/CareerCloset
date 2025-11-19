import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/database.js";
import uploadRoute from "./src/routes/upload.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/upload", uploadRoute);

// Connect to MongoDB database
connectDB();

// Test endpoint - display a random movie from sample database
app.get("/api/test", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const moviesDb = mongoose.connection.useDb("sample_mflix");
    const moviesCollection = moviesDb.collection("movies");

    const movie = await moviesCollection.findOne({});

    if (movie) {
      res.json({
        message: "Database connection successful!",
        movie: {
          title: movie.title,
          year: movie.year,
          genres: movie.genres,
          plot: movie.plot,
        },
      });
    } else {
      res.json({
        message: "Database connected but no sample data found",
        note: "Load sample data in MongoDB Atlas",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Database query failed",
      message: error.message,
    });
  }
});

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
      test: "/api/test",
    },
  });
});

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
