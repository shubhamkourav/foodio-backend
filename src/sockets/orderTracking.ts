import type { Namespace } from 'socket.io';

export function registerOrderTrackingHandlers(ordersNs: Namespace): void {
  ordersNs.on('connection', (socket) => {
    socket.on('join_order', ({ orderId }: { orderId: string }) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });
  });
}
