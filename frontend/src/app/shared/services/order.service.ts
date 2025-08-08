import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order';

export interface CreateOrderRequest {
  restaurantId: string;
  items: any[];
  deliveryAddress: any;
  paymentMethod: string;
  notes?: string;
}

// Enhanced Order Interfaces
export interface OrderItem {
  id: string;
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  customizations?: string[];
  notes?: string;
}

export interface Address {
  street: string;
  city: string;
  area: string;
  district: string;
  building: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderTrackingInfo {
  orderId: string;
  status: OrderStatus;
  estimatedDeliveryTime?: string;
  timeline: OrderTimelineEvent[];
  deliveryPerson?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehicleInfo?: string;
    location?: {
      lat: number;
      lng: number;
      lastUpdated: string;
    };
  };
  restaurant: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  description: string;
  estimatedTime?: number;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  estimatedTime?: number;
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
  details?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  customerId?: string;
  restaurantId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_BASE = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Legacy methods (kept for backward compatibility)
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.API_BASE}/orders`, orderData);
  }

  getOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_BASE}/orders`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.API_BASE}/orders/${id}`);
  }

  // Admin functions
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_BASE}/admin/orders`);
  }

  // Update order status (legacy)
  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.API_BASE}/orders/${orderId}/status`, { status });
  }

  // Enhanced Order Management API Methods

  /**
   * Get paginated list of orders with filtering
   * GET /api/orders
   */
  getOrders(filters: OrderFilters = {}): Observable<ApiResponse<OrdersListResponse>> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.restaurantId) params = params.set('restaurantId', filters.restaurantId);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<ApiResponse<OrdersListResponse>>(
      `${this.API_BASE}/orders`,
      { params }
    );
  }

  /**
   * Get order by ID with enhanced response
   * GET /api/orders/:id
   */
  getOrderByIdEnhanced(orderId: string): Observable<ApiResponse<{ order: Order }>> {
    return this.http.get<ApiResponse<{ order: Order }>>(
      `${this.API_BASE}/orders/${orderId}`
    );
  }

  /**
   * Update order status with enhanced data
   * PATCH /api/orders/:id/status
   */
  updateOrderStatusEnhanced(orderId: string, statusData: UpdateOrderStatusRequest): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.API_BASE}/orders/${orderId}/status`,
      statusData
    );
  }

  /**
   * Cancel order
   * PATCH /api/orders/:id/cancel
   */
  cancelOrder(orderId: string, cancelData: CancelOrderRequest): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.API_BASE}/orders/${orderId}/cancel`,
      cancelData
    );
  }

  /**
   * Track order with real-time info
   * GET /api/orders/:id/track
   */
  trackOrder(orderId: string): Observable<ApiResponse<{ tracking: OrderTrackingInfo }>> {
    return this.http.get<ApiResponse<{ tracking: OrderTrackingInfo }>>(
      `${this.API_BASE}/orders/${orderId}/track`
    );
  }

  /**
   * Get customer orders
   */
  getCustomerOrders(customerId: string, filters: OrderFilters = {}): Observable<ApiResponse<OrdersListResponse>> {
    return this.getOrders({ ...filters, customerId });
  }

  /**
   * Get restaurant orders
   */
  getRestaurantOrders(restaurantId: string, filters: OrderFilters = {}): Observable<ApiResponse<OrdersListResponse>> {
    return this.getOrders({ ...filters, restaurantId });
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderStatus, filters: OrderFilters = {}): Observable<ApiResponse<OrdersListResponse>> {
    return this.getOrders({ ...filters, status });
  }

  /**
   * Get order status history
   */
  getOrderStatusHistory(orderId: string): Observable<ApiResponse<{ timeline: OrderTimelineEvent[] }>> {
    return this.http.get<ApiResponse<{ timeline: OrderTimelineEvent[] }>>(
      `${this.API_BASE}/orders/${orderId}/timeline`
    );
  }

  /**
   * Utility methods for order status management
   */
  getStatusColor(status: OrderStatus): string {
    const statusColors: Record<OrderStatus, string> = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'preparing': '#fd7e14',
      'ready': '#20c997',
      'out_for_delivery': '#6f42c1',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return statusColors[status] || '#6c757d';
  }

  getStatusText(status: OrderStatus): string {
    const statusTexts: Record<OrderStatus, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered',
      'delivered': null,
      'cancelled': null
    };
    return statusFlow[currentStatus];
  }

  canCancelOrder(status: OrderStatus): boolean {
    return ['pending', 'confirmed', 'preparing'].includes(status);
  }

  canUpdateStatus(status: OrderStatus): boolean {
    return status !== 'delivered' && status !== 'cancelled';
  }
}

