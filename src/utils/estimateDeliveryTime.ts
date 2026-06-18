import { env } from '../config/env.js';
import { geoDistance } from './geoDistance.js';

export interface DeliveryEstimateInput {
  restaurantLat: number;
  restaurantLng: number;
  deliveryLat: number;
  deliveryLng: number;
  /** Kitchen prep time before the driver departs */
  prepTimeMin?: number;
  /** Use Google Directions (route + traffic). Defaults to true when API key is set. */
  useGoogleMaps?: boolean;
}

export interface DeliveryEstimate {
  totalMinutes: number;
  travelMinutes: number;
  prepMinutes: number;
  distanceKm: number;
  source: 'google_maps' | 'heuristic';
  estimatedDelivery: Date;
}

const URBAN_SPEED_KMH = 28;
const TRAFFIC_FACTOR = 1.35;

export function kitchenPrepMinutes(restaurantDeliveryTimeMin: number): number {
  return Math.max(10, Math.min(25, Math.round(restaurantDeliveryTimeMin * 0.4)));
}

function travelMinutesFromDistance(distanceKm: number): number {
  const hours = (distanceKm / URBAN_SPEED_KMH) * TRAFFIC_FACTOR;
  return Math.max(5, Math.ceil(hours * 60));
}

export function estimateDeliveryTimeHeuristic(input: DeliveryEstimateInput): DeliveryEstimate {
  const prepMinutes = input.prepTimeMin ?? 15;
  const distanceKm = geoDistance(
    input.restaurantLat,
    input.restaurantLng,
    input.deliveryLat,
    input.deliveryLng,
  );
  const travelMinutes = travelMinutesFromDistance(distanceKm);
  const totalMinutes = prepMinutes + travelMinutes;

  return {
    totalMinutes,
    travelMinutes,
    prepMinutes,
    distanceKm: Math.round(distanceKm * 100) / 100,
    source: 'heuristic',
    estimatedDelivery: new Date(Date.now() + totalMinutes * 60 * 1000),
  };
}

interface GoogleDirectionsResponse {
  status: string;
  routes?: Array<{
    legs?: Array<{
      distance?: { value: number };
      duration?: { value: number };
      duration_in_traffic?: { value: number };
    }>;
  }>;
}

async function fetchGoogleTravelMinutes(input: DeliveryEstimateInput): Promise<{
  travelMinutes: number;
  distanceKm: number;
} | null> {
  if (!env.GOOGLE_MAPS_API_KEY) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', `${input.restaurantLat},${input.restaurantLng}`);
  url.searchParams.set('destination', `${input.deliveryLat},${input.deliveryLng}`);
  url.searchParams.set('mode', 'driving');
  url.searchParams.set('departure_time', 'now');
  url.searchParams.set('traffic_model', 'best_guess');
  url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as GoogleDirectionsResponse;
  if (data.status !== 'OK' || !data.routes?.[0]?.legs?.[0]) return null;

  const leg = data.routes[0].legs[0];
  const durationSeconds = leg.duration_in_traffic?.value ?? leg.duration?.value;
  if (!durationSeconds) return null;

  const distanceKm = leg.distance?.value ? leg.distance.value / 1000 : geoDistance(
    input.restaurantLat,
    input.restaurantLng,
    input.deliveryLat,
    input.deliveryLng,
  );

  return {
    travelMinutes: Math.max(5, Math.ceil(durationSeconds / 60)),
    distanceKm: Math.round(distanceKm * 100) / 100,
  };
}

/** ETA from restaurant → delivery address using route + traffic when available. */
export async function estimateDeliveryTime(
  input: DeliveryEstimateInput,
): Promise<DeliveryEstimate> {
  const prepMinutes = input.prepTimeMin ?? 15;
  const shouldUseGoogle = input.useGoogleMaps !== false && Boolean(env.GOOGLE_MAPS_API_KEY);

  if (shouldUseGoogle) {
    try {
      const route = await fetchGoogleTravelMinutes(input);
      if (route) {
        const totalMinutes = prepMinutes + route.travelMinutes;
        return {
          totalMinutes,
          travelMinutes: route.travelMinutes,
          prepMinutes,
          distanceKm: route.distanceKm,
          source: 'google_maps',
          estimatedDelivery: new Date(Date.now() + totalMinutes * 60 * 1000),
        };
      }
    } catch {
      // Fall back to heuristic when Directions API is unavailable.
    }
  }

  return estimateDeliveryTimeHeuristic(input);
}
