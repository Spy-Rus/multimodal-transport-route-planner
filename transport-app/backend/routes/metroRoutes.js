import express from "express";
import MetroStation from "../models/MetroStation.js";
import MetroRoute from "../models/MetroRoute.js";

const router = express.Router();

// ➕ Add metro station
router.post("/station", async (req, res) => {
  try {
    const station = new MetroStation(req.body);
    await station.save();
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/station/bulk", async (req, res) => {
  try {
    const stations = await MetroStation.insertMany(req.body);
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/station", async (req, res) => {
  try {
    const stations = await MetroStation.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ➕ Add metro route
router.post("/route", async (req, res) => {
  try {
    const route = new MetroRoute(req.body);
    await route.save();
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 Get all metro routes
console.log("Metro routes loaded");
router.get("/", async (req, res) => {
  try {
    const routes = await MetroRoute.find().populate("stations");
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;