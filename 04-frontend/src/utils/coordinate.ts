/**
 * Coordinate conversion: BD-09 → WGS-84
 * Used to convert Baidu coordinate system to WGS-84 used by Leaflet
 */
export function bd09ToWgs84(lat: number, lng: number): [number, number] {
  if (!lat || !lng) return [0, 0];
  
  // BD-09 → GCJ-02
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * Math.PI * 3000.0 / 180.0);
  const angle = Math.atan2(y, x) + 0.000003 * Math.cos(x * Math.PI * 3000.0 / 180.0);
  const gLng = z * Math.cos(angle);
  const gLat = z * Math.sin(angle);
  
  // GCJ-02 → WGS-84
  const dLng = gLng - lng;
  const dLat = gLat - lat;
  
  return [lat - dLat, lng - dLng];
}