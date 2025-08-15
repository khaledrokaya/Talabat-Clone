import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeliveryLocation,
  DeliveryAvailability,
  DeliveryOrderStatus,
  DeliveryOrder,
  DeliveryEarnings,
  DeliveryStats,
  OrderFilters,
  ApiResponse,
  PaginationResponse
} from '../models/delivery.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly API_URL = `${environment.apiUrl}/delivery`;

  constructor(private http: HttpClient) { }

  // Status checking
  getDeliveryStatus(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/status`);
  }

  // Location tracking
  updateLocation(location: DeliveryLocation): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.API_URL}/location`, location);
  }

  // Availability toggle
  updateAvailability(availability: DeliveryAvailability): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.API_URL}/availability`, availability);
  }

  // Order management
  getAvailableOrders(page?: number, limit?: number, maxDistance?: number): Observable<ApiResponse<PaginationResponse<DeliveryOrder>>> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (maxDistance) params = params.set('maxDistance', maxDistance.toString());

    return this.http.get<ApiResponse<PaginationResponse<DeliveryOrder>>>(`${this.API_URL}/orders/available`, { params });
  }

  acceptOrder(orderId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/orders/${orderId}/accept`, {});
  }

  updateOrderStatus(orderId: string, status: DeliveryOrderStatus): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.API_URL}/orders/${orderId}/status`, status);
  }

  getOrders(filters?: OrderFilters): Observable<ApiResponse<PaginationResponse<DeliveryOrder>>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<ApiResponse<PaginationResponse<DeliveryOrder>>>(`${this.API_URL}/orders`, { params });
  }

  // Earnings and statistics
  getEarnings(period?: string, startDate?: string, endDate?: string): Observable<ApiResponse<DeliveryEarnings>> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<DeliveryEarnings>>(`${this.API_URL}/earnings`, { params });
  }

  // Simple total earnings
  getSimpleEarnings(): Observable<ApiResponse<{ totalEarnings: number }>> {
    return this.http.get<ApiResponse<{ totalEarnings: number }>>(`${this.API_URL}/earnings/simple`);
  }

  getStats(): Observable<ApiResponse<DeliveryStats>> {
    return this.http.get<ApiResponse<DeliveryStats>>(`${this.API_URL}/stats`);
  }

  // Order tracking - using the correct delivery tracking endpoint
  trackOrder(orderId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/orders/${orderId}/track`);
  }
}
