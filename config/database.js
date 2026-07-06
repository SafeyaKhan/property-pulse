import mongoose from "mongoose";

let connected = false;
let connectionPromise = null;

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (connected) {
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined in your environment variables.",
    );
  }

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      connected = true;
      console.log("MongoDB connected...");
    })
    .catch((error) => {
      connectionPromise = null;
      console.error("MongoDB connection error:", error.message);
      throw error;
    });

  return connectionPromise;
};

export default connectDB;
