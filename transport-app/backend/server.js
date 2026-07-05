import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import stopRoutes from "./routes/stopRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import metroRoutes from "./routes/metroRoutes.js";
import { initializeGraph } from "./services/graphCache.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/metro", metroRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/buses", busRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async() => {
    console.log("MongoDB Connected");
    await initializeGraph();
    console.log("Graph Cache Built");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err.message);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("API running");
});