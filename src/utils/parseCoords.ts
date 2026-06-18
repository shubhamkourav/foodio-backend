import { ApiError } from './ApiError.js';

export function parseOptionalCoords(query: Record<string, unknown>): {
  lat?: number;
  lng?: number;
} {
  const hasLat = query.lat !== undefined && query.lat !== '';
  const hasLng = query.lng !== undefined && query.lng !== '';

  if (!hasLat && !hasLng) {
    return {};
  }

  if (!hasLat || !hasLng) {
    throw new ApiError(400, 'Both lat and lng are required for location-based data');
  }

  const lat = Number(query.lat);
  const lng = Number(query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new ApiError(400, 'lat and lng must be valid numbers');
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new ApiError(400, 'lat and lng are out of valid range');
  }

  return { lat, lng };
}
