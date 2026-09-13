import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (process.env.MONGO_URI) await connectDB();
    else console.warn("MONGO_URI is not set. API will start without MongoDB.");
    app.listen(PORT, () => console.log(`SIH26044 backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}
start();
export default app;
