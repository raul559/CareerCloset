import mongoose from "mongoose";

export async function connectDB() {
  try {
    // Connect to MongoDB using the connection string from .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected:", conn.connection.host);
    console.log("Database:", conn.connection.name);

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  } catch (error) {
    // Log error and exit if connection fails
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

/**
 * Close database connection
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}
