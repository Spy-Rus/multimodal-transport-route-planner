import express from "express";
import Stop from "../models/Stop.js";

const router = express.Router();

// ➕ Add single stop
router.post("/", async (req, res) => {
  try {
    const stop = new Stop(req.body);
    await stop.save();
    res.json(stop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add multiple stops
router.post("/bulk", async (req, res) => {
  try {
    const stops = await Stop.insertMany(req.body);
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 Get all stops
router.get("/", async (req, res) => {
  try {
    const stops = await Stop.find();
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;