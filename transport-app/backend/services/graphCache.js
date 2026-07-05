import Bus from "../models/Bus.js";
import MetroRoute from "../models/MetroRoute.js";

import {
  buildGraph,
  buildMetroGraph,
  mergeGraphs,
  addTransfers
} from "../utils/graph.js";

let cache = {
  graph: null,
  buses: [],
  metroRoutes: [],
  allNodes: [],
  nodeMap: {},
  nodeData: {}
};

export function getGraphData() {
  return cache;
}

export async function initializeGraph() {
    console.log("Building Graph...");
    const buses = await Bus
        .find()
        .populate("stops");
    const metroRoutes = await MetroRoute
        .find()
        .populate("stations");

    const busGraph = buildGraph(buses);

    const metroGraph = buildMetroGraph(metroRoutes);

    let graph = mergeGraphs(
        busGraph,
        metroGraph
    );

    graph = addTransfers(
        graph,
        buses,
        metroRoutes
    );

    const allNodes = [];
    const nodeMap = {};
    const nodeData = {};

    for (const bus of buses) {

        for (const stop of bus.stops) {

            allNodes.push({
                ...stop.toObject(),
                type: "bus"
            });

            nodeMap[stop._id.toString()] =
                stop.name;

            nodeData[stop._id.toString()] =
                stop;
        }
    }
    for (const route of metroRoutes) {

        for (const station of route.stations) {

            allNodes.push({
                ...station.toObject(),
                type: "metro"
            });

            nodeMap[station._id.toString()] =
                station.name;

            nodeData[station._id.toString()] =
                station;
        }
    }
    cache.graph = graph;
    cache.buses = buses;
    cache.metroRoutes = metroRoutes;
    cache.allNodes = allNodes;
    cache.nodeMap = nodeMap;
    cache.nodeData = nodeData;
}