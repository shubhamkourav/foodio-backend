import type { Namespace } from 'socket.io';

export function registerDriverLocationHandlers(driversNs: Namespace): void {
  driversNs.on('connection', (socket) => {
    socket.on(
      'driver:location_update',
      (payload: { driverId?: string; lat: number; lng: number }) => {
        socket.broadcast.emit('driver:location_broadcast', payload);
      },
    );
  });
}
