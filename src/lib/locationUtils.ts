/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Check if a location is within a specified radius
 * @param centerLat Center latitude
 * @param centerLon Center longitude
 * @param targetLat Target latitude
 * @param targetLon Target longitude
 * @param radiusKm Radius in kilometers
 * @returns True if within radius
 */
export function isWithinRadius(
  centerLat: number, 
  centerLon: number, 
  targetLat: number, 
  targetLon: number, 
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, targetLat, targetLon);
  return distance <= radiusKm;
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

/**
 * Get user's current location
 * @returns Promise with coordinates
 */
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error)
    );
  });
}

/**
 * Validate latitude and longitude coordinates
 * @param lat Latitude
 * @param lon Longitude
 * @returns True if coordinates are valid
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Get trading radius suggestions based on location type
 * @param locationType Type of location (urban, suburban, rural)
 * @returns Suggested radius in kilometers
 */
export function getSuggestedRadius(locationType: 'urban' | 'suburban' | 'rural'): number {
  switch (locationType) {
    case 'urban':
      return 5; // 5km for urban areas
    case 'suburban':
      return 10; // 10km for suburban areas
    case 'rural':
      return 25; // 25km for rural areas
    default:
      return 10;
  }
}

/**
 * Calculate estimated travel time for energy transfer
 * @param distanceKm Distance in kilometers
 * @param transportType Type of transport (walking, driving, etc.)
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(distanceKm: number, transportType: 'walking' | 'driving' = 'driving'): number {
  const speeds = {
    walking: 5, // km/h
    driving: 30 // km/h (average city speed)
  };
  
  const speed = speeds[transportType];
  return Math.round((distanceKm / speed) * 60);
} 