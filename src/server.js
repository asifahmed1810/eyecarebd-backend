import { createApp } from "./app.js";
import { connectDb } from "./db/connect.js";
import { env } from "./config/env.js";

// cache DB connection (important for serverless)
let isConnected = false;

export default async function handler(req, res) {
  try {
    // connect DB only once per cold start
    if (!isConnected) {
      await connectDb(env.MONGODB_URI);
      isConnected = true;
    }

    const app = createApp();

    return app(req, res);
  } catch (err) {
    console.error("Serverless error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}