import { getDistance } from "./distance.js";
import MinHeap from "./minHeap.js";
// ======================================================
// 🚌 BUILD BUS GRAPH
// ======================================================

export function buildGraph(buses) {

  const graph = {};

  for (const bus of buses) {

    const stops = bus.stops;

    for (let i = 0; i < stops.length; i++) {

      const curr = stops[i]._id.toString();

      if (!graph[curr]) {
        graph[curr] = [];
      }

      // previous stop
      if (i > 0) {

        const prev = stops[i - 1]._id.toString();

        graph[curr].push({
          to: prev,
          weight: 3,
          type: "bus",
          route: bus.name
        });
      }

      // next stop
      if (i < stops.length - 1) {

        const next = stops[i + 1]._id.toString();

        graph[curr].push({
          to: next,
          weight: 3,
          type: "bus",
          route: bus.name
        });
      }
    }
  }

  return graph;
}


// ======================================================
// 🚇 BUILD METRO GRAPH
// ======================================================

export function buildMetroGraph(routes) {

  const graph = {};

  for (const route of routes) {

    const stations = route.stations;

    for (let i = 0; i < stations.length; i++) {

      const curr = stations[i]._id.toString();

      if (!graph[curr]) {
        graph[curr] = [];
      }

      // previous station
      if (i > 0) {

        const prev = stations[i - 1]._id.toString();

        graph[curr].push({
          to: prev,
          weight: 2,
          type: "metro",
          route: route.line
        });
      }

      // next station
      if (i < stations.length - 1) {

        const next = stations[i + 1]._id.toString();

        graph[curr].push({
          to: next,
          weight: 2,
          type: "metro",
          route: route.line
        });
      }
    }
  }

  return graph;
}


// ======================================================
// 🔗 MERGE BUS + METRO GRAPHS
// ======================================================

export function mergeGraphs(busGraph, metroGraph) {

  const merged = { ...busGraph };

  for (const node in metroGraph) {

    if (!merged[node]) {
      merged[node] = [];
    }

    merged[node].push(...metroGraph[node]);
  }

  return merged;
}


// ======================================================
// 🚶 ADD BUS ↔ METRO TRANSFERS
// ======================================================

export function addTransfers(graph, buses, metroRoutes) {

  const stopCoords = {};

  // 🔹 Collect BUS stops
  for (const bus of buses) {

    for (const stop of bus.stops) {

      stopCoords[stop._id.toString()] = {
        lat: stop.lat,
        lng: stop.lng,
        type: "bus"
      };
    }
  }

  // 🔹 Collect METRO stations
  for (const route of metroRoutes) {

    for (const station of route.stations) {

      stopCoords[station._id.toString()] = {
        lat: station.lat,
        lng: station.lng,
        type: "metro"
      };
    }
  }

  const ids = Object.keys(stopCoords);

  // 🔹 Compare every pair
  for (let i = 0; i < ids.length; i++) {

    for (let j = i + 1; j < ids.length; j++) {

      const a = ids[i];
      const b = ids[j];

      const aObj = stopCoords[a];
      const bObj = stopCoords[b];

      // distance
      const d = getDistance(
        aObj.lat,
        aObj.lng,
        bObj.lat,
        bObj.lng
      );

      // type checks
      const isBusA = aObj.type === "bus";
      const isBusB = bObj.type === "bus";

      const isMetroA = aObj.type === "metro";
      const isMetroB = bObj.type === "metro";

      // only BUS ↔ METRO
      const validTransfer =
        (isBusA && isMetroB) ||
        (isMetroA && isBusB);

      // create transfer
      if (
        d < 0.2 &&
        a !== b &&
        validTransfer
      ) {

        console.log(
          "TRANSFER CREATED:",
          a,
          "<->",
          b,
          "DIST:",
          d
        );

        if (!graph[a]) graph[a] = [];
        if (!graph[b]) graph[b] = [];

        // bidirectional edges
        graph[a].push({
          to: b,
          weight: 5,
          type: "transfer"
        });

        graph[b].push({
          to: a,
          weight: 5,
          type: "transfer"
        });
      }
    }
  }

  return graph;
}


// ======================================================
// 🧠 BUILD TRANSPORT SEGMENTS
// ======================================================

export function buildTransportSegments(
  path,
  graph,
  nodeMap
) {

  const segments = [];

  let current = null;

  
  for (let i = 0; i < path.length - 1; i++) {

    const u = path[i];
    const v = path[i + 1];

    const edge = (graph[u] || []).find(
      e => e.to === v
    );

    let type = "walk";
    let label = null;

    if (edge) {

      type = edge.type;

      if (
        edge.type === "bus" ||
        edge.type === "metro"
      ) {
        label = edge.route;
      }
    }
        // merge same consecutive segments
      if (
          current &&
          current.type === type &&
          current.label === label
        ) {

          current.to = nodeMap[v];

        } else {

          if (current) {
        segments.push(current);
      }

      current = {
        type,
        label,
        from: nodeMap[u],
        to: nodeMap[v]
      };
    }
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}


// ======================================================
// 🛣️ DIJKSTRA SHORTEST PATH
// ======================================================

export function dijkstra(graph, start, end) {

  const dist = {};
  const parent = {};
  const visited = new Set();

  // init distances
  for (const node in graph) {
    dist[node] = Infinity;
  }

  dist[start] = 0;

  const pq = new MinHeap();

  pq.insert({
      node: start,
      dist: 0
  });

  while (!pq.isEmpty()) {

    // get minimum
      const {
      node,
      dist: currDist
  } = pq.extractMin();

    if (visited.has(node)) continue;

    visited.add(node);

    if (node === end) break;

    for (const edge of graph[node] || []) {

      const { to, weight } = edge;

      const newDist = currDist + weight;

      if (newDist < dist[to]) {

        dist[to] = newDist;

        parent[to] = node;

        pq.insert({
        node: to,
        dist: newDist
      });
      }
    }
  }

  // no path
  if (!parent[end] && start !== end) {
    return [];
  }

  // reconstruct path
  const path = [];

  let curr = end;

  while (curr) {

    path.push(curr);

    curr = parent[curr];
  }

  return path.reverse();
}

export function buildInstructions(segments) {

  const instructions = [];

  for (let i = 0; i < segments.length; i++) {

    const seg = segments[i];

    // 🚌 BUS
    if (seg.type === "bus") {

      instructions.push(
        `Board ${seg.label} at ${seg.from}`
      );

      instructions.push(
        `Travel to ${seg.to}`
      );
    }

    // 🚇 METRO
    else if (seg.type === "metro") {

      instructions.push(
        `Take ${seg.label} Line Metro from ${seg.from}`
      );

      instructions.push(
        `Exit at ${seg.to}`
      );
    }

    // 🚶 WALK
    else if (seg.type === "walk") {

      instructions.push(
        `Walk from ${seg.from} to ${seg.to}`
      );
    }

    // 🔄 Transfer message
    if (i < segments.length - 1) {

      const next = segments[i + 1];

      if (
        seg.label !== next.label ||
        seg.type !== next.type
      ) {

        instructions.push(
          `Transfer at ${seg.to}`
        );
      }
    }
  }

  return instructions;
}

export function calculateETA(path, graph) {

  let totalTime = 0;

  for (let i = 0; i < path.length - 1; i++) {

    const u = path[i];
    const v = path[i + 1];

    const edge = (graph[u] || []).find(
      e => e.to === v
    );

    if (edge) {
      totalTime += edge.weight;
    }
  }

  return totalTime;
}

export function calculateDistance(path, nodeData) {

  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {

    const u = nodeData[path[i]];
    const v = nodeData[path[i + 1]];

    totalDistance += getDistance(
      u.lat,
      u.lng,
      v.lat,
      v.lng
    );
  }

  return Number(totalDistance.toFixed(2));
}