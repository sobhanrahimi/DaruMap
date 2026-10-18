/**
 * Geographic distance calculation (Haversine formula) and location utilities for DaruMap.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Validates whether latitude and longitude are within standard physical limits.
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Calculates distance in kilometers between two geographic points using Haversine formula.
 */
export function calculateHaversineDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  if (
    !validateCoordinates(coord1.latitude, coord1.longitude) ||
    !validateCoordinates(coord2.latitude, coord2.longitude)
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Rounded to 2 decimal places
}
