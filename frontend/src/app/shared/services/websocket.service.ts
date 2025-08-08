import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor() { }

  connect(channel?: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = environment.wsUrl || 'ws://localhost:3000';
    const token = localStorage.getItem('token');

    const fullUrl = channel
      ? `${wsUrl}?channel=${channel}&token=${token}`
      : `${wsUrl}?token=${token}`;

    try {
      this.socket = new WebSocket(fullUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connectionStatus.next(true);
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.messageSubject.next(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.connectionStatus.next(false);

      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus.next(false);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.connectionStatus.next(false);
  }

  sendMessage(type: string, data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  onMessage(messageType?: string): Observable<any> {
    return this.messageSubject.asObservable().pipe(
      filter(message => !messageType || message.type === messageType),
      map(message => message.data)
    );
  }

  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Order-specific WebSocket methods
  subscribeToOrderUpdates(): Observable<any> {
    return this.onMessage('order_status_updated');
  }

  subscribeToNewOrders(): Observable<any> {
    return this.onMessage('new_order');
  }

  subscribeToOrderCancellations(): Observable<any> {
    return this.onMessage('order_cancelled');
  }

  // Restaurant-specific WebSocket methods
  subscribeToRestaurantUpdates(): Observable<any> {
    return this.onMessage('restaurant_updated');
  }

  // Delivery tracking WebSocket methods
  subscribeToDeliveryUpdates(): Observable<any> {
    return this.onMessage('delivery_location_updated');
  }

  // Admin-specific WebSocket methods
  subscribeToAdminNotifications(): Observable<any> {
    return this.onMessage('admin_notification');
  }
}
