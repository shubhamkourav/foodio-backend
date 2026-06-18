import { describe, expect, it } from '@jest/globals';

import {
  estimateDeliveryTimeHeuristic,
  kitchenPrepMinutes,
} from '../src/utils/estimateDeliveryTime.js';

describe('estimateDeliveryTime', () => {
  it('includes prep and travel time in heuristic estimate', () => {
    const estimate = estimateDeliveryTimeHeuristic({
      restaurantLat: 37.7749,
      restaurantLng: -122.4194,
      deliveryLat: 37.7849,
      deliveryLng: -122.4094,
      prepTimeMin: 12,
    });

    expect(estimate.source).toBe('heuristic');
    expect(estimate.prepMinutes).toBe(12);
    expect(estimate.travelMinutes).toBeGreaterThanOrEqual(5);
    expect(estimate.totalMinutes).toBe(estimate.prepMinutes + estimate.travelMinutes);
    expect(estimate.estimatedDelivery.getTime()).toBeGreaterThan(Date.now());
  });

  it('derives kitchen prep from restaurant delivery time', () => {
    expect(kitchenPrepMinutes(30)).toBe(12);
    expect(kitchenPrepMinutes(10)).toBe(10);
  });
});
