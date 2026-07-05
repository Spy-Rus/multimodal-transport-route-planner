export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}

export function findNearestStop(stops, lat, lng) {

  // Prefer BUS stops first
  const busStops = stops.filter(
    s => s.type === "bus"
  );

  const searchList =
    busStops.length > 0
      ? busStops
      : stops;

  let nearest = null;
  let minDistance = Infinity;

  for (const stop of searchList) {

    const d = getDistance(
      lat,
      lng,
      stop.lat,
      stop.lng
    );

    if (d < minDistance) {

      minDistance = d;
      nearest = stop;
    }
  }

  return nearest;
}