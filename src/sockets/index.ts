import type { Server } from 'socket.io';

import { registerDriverLocationHandlers } from './driverLocation.js';
import { registerOrderTrackingHandlers } from './orderTracking.js';

export function registerSocketHandlers(io: Server): void {
  registerOrderTrackingHandlers(io.of('/orders'));
  registerDriverLocationHandlers(io.of('/drivers'));
}
