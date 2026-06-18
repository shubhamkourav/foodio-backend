const BASE_FEE = 2.99;
const PER_KM_RATE = 0.75;
const FREE_DISTANCE_KM = 2;
const MAX_FEE = 9.99;

export function calculateDeliveryFee(distanceKm: number, restaurantBaseFee = 0): number {
  const extraDistance = Math.max(0, distanceKm - FREE_DISTANCE_KM);
  const fee = restaurantBaseFee + BASE_FEE + extraDistance * PER_KM_RATE;

  return Math.round(Math.min(fee, MAX_FEE) * 100) / 100;
}
