import type { Server } from 'socket.io';

let io: Server | null = null;

export function setSocketServer(server: Server): void {
  io = server;
}

export function getSocketServer(): Server | null {
  return io;
}

export function emitOrderStatusUpdated(
  orderId: string,
  status: string,
  timestamp: Date = new Date(),
): void {
  io?.of('/orders').to(`order:${orderId}`).emit('order:status_updated', {
    orderId,
    status,
    timestamp: timestamp.toISOString(),
  });
}

export function emitDriverAssigned(
  orderId: string,
  driver: { id: string; name: string; vehicleType?: string },
): void {
  io?.of('/orders').to(`order:${orderId}`).emit('order:driver_assigned', {
    orderId,
    driver,
  });
}

export function emitEtaUpdated(orderId: string, etaMinutes: number): void {
  io?.of('/orders').to(`order:${orderId}`).emit('order:eta_updated', {
    orderId,
    etaMinutes,
  });
}
