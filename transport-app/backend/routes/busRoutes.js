import express from "express";
import Bus from "../models/Bus.js";

import { findNearestStop } from "../utils/distance.js";

import {
   dijkstra,
   buildTransportSegments,
   buildInstructions,
   calculateETA,
   calculateDistance
} from "../utils/graph.js";

import { getGraphData } from "../services/graphCache.js";

const router = express.Router();


// ➕ Add bus
router.post("/", async (req, res) => {
   try {

      const { name, routeNumber, stops } = req.body;

      const bus = new Bus({
         name,
         routeNumber,
         stops
      });

      await bus.save();

      res.json(bus);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });
   }
});


// 📥 Get all buses
router.get("/", async (req, res) => {

   console.log("BUS ROUTE API HIT");

   try {

      const buses = await Bus
         .find()
         .populate("stops");

      res.json(buses);

   } catch (err) {

      res.status(500).json({
         error: err.message
      });
   }
});


// 🧠 ROUTE FINDING (BUS + METRO)
router.get("/route", async (req, res) => {

   try {

      const {
         fromLat,
         fromLng,
         toLat,
         toLng
      } = req.query;

      if (
         !fromLat ||
         !fromLng ||
         !toLat ||
         !toLng
      ) {

         return res.status(400).json({
            error: "Missing coordinates"
         });
      }

      // 🔥 Get cached transport network
      const {
         graph,
         buses,
         metroRoutes,
         allNodes,
         nodeMap,
         nodeData
      } = getGraphData();


      // 🔥 Find nearest start/end nodes
      const startNode = findNearestStop(
         allNodes,
         parseFloat(fromLat),
         parseFloat(fromLng)
      );

      const endNode = findNearestStop(
         allNodes,
         parseFloat(toLat),
         parseFloat(toLng)
      );

      console.log("START:", startNode?.name);
      console.log("END:", endNode?.name);

      if (!startNode || !endNode) {

         return res.json({
            stops: [],
            segments: []
         });
      }


      // 🔥 Run Dijkstra
      const path = dijkstra(
         graph,
         startNode._id.toString(),
         endNode._id.toString()
      );

      console.log("RAW PATH:", path);

      if (!path || path.length === 0) {

         return res.json({
            stops: [],
            segments: []
         });
      }


      // 🔥 Convert IDs → Names
      const namedPath = [];

      for (const id of path) {

         const name = nodeMap[id];

         if (
            namedPath.length === 0 ||
            namedPath[namedPath.length - 1] !== name
         ) {
            namedPath.push(name);
         }
      }


      // 🔥 Build segments
      const segments = buildTransportSegments(
         path,
         graph,
         nodeMap
      );

      const etaMinutes = calculateETA(
         path,
         graph
      );

      const totalDistanceKm = calculateDistance(
         path,
         nodeData
      );

      const instructions =
         buildInstructions(segments);


      // 🔥 Final response
      res.json({
         stops: namedPath,
         segments,
         instructions,
         etaMinutes,
         totalDistanceKm
      });

   } catch (err) {

      res.status(500).json({
         error: err.message
      });
   }
});

export default router;