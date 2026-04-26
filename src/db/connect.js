import mongoose from "mongoose";

export async function connectDb(mongoUri) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}