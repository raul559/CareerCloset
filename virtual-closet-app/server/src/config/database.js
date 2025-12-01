import mongoose from "mongoose";

async function connectDB() {
  try {
    // Connect to MongoDB using the connection string from .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

// Export both default and named export to be compatible with different import styles
export { connectDB };
export default connectDB;

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
