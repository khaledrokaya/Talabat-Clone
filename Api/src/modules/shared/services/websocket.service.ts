import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Logger } from '../utils/logger';

export class WebSocketService {
  private io: SocketIOServer;
  private static instance: WebSocketService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:4200",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.initializeHandlers();
  }

  static getInstance(server?: HTTPServer): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  private initializeHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      Logger.info(`Client connected: ${socket.id}`);

      socket.on('join-delivery-room', (deliveryPersonId: string) => {
        socket.join(`delivery-${deliveryPersonId}`);
        Logger.info(`Delivery person ${deliveryPersonId} joined room`);
      });

      socket.on('join-customer-room', (customerId: string) => {
        socket.join(`customer-${customerId}`);
        Logger.info(`Customer ${customerId} joined room`);
      });

      socket.on('join-order-room', (orderId: string) => {
        socket.join(`order-${orderId}`);
        Logger.info(`Joined order room: ${orderId}`);
      });

      socket.on('disconnect', () => {
        Logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Send location update to customers tracking an order
  public sendLocationUpdate(orderId: string, location: { lat: number; lng: number }): void {
    this.io.to(`order-${orderId}`).emit('location-update', {
      orderId,
      location,
      timestamp: new Date()
    });
  }

  // Send order status update
  public sendOrderStatusUpdate(orderId: string, status: string, customerId?: string): void {
    const statusUpdate = {
      orderId,
      status,
      timestamp: new Date()
    };

    this.io.to(`order-${orderId}`).emit('order-status-update', statusUpdate);

    if (customerId) {
      this.io.to(`customer-${customerId}`).emit('order-status-update', statusUpdate);
    }
  }

  // Send new order notification to delivery persons in area
  public sendNewOrderNotification(deliveryPersonIds: string[], orderData: any): void {
    deliveryPersonIds.forEach(deliveryPersonId => {
      this.io.to(`delivery-${deliveryPersonId}`).emit('new-order-available', {
        ...orderData,
        timestamp: new Date()
      });
    });
  }

  // Send delivery assignment notification
  public sendDeliveryAssignment(deliveryPersonId: string, orderData: any): void {
    this.io.to(`delivery-${deliveryPersonId}`).emit('order-assigned', {
      ...orderData,
      timestamp: new Date()
    });
  }

  // Send order completion notification
  public sendOrderCompletion(customerId: string, orderId: string): void {
    this.io.to(`customer-${customerId}`).emit('order-completed', {
      orderId,
      message: 'Your order has been delivered successfully!',
      timestamp: new Date()
    });
  }

  // Generic notification sender
  public sendNotification(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
