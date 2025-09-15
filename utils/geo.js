// Point in Polygon using ray casting; polygon = array of {lat, lon}
export function pointInPolygon(point, polygon) {
  const { latitude: lat, longitude: lon } = point; // point uses latitude/longitude keys
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lon;
    const xj = polygon[j].lat, yj = polygon[j].lon;
    const intersect = ((yi > lon) !== (yj > lon)) &&
      (lat < (xj - xi) * (lon - yi) / (yj - yi + 0.0) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default { pointInPolygon };
