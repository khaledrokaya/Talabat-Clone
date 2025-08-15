import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActualDashboardResponse {
  restaurant: {
    name: string;
    rating: number;
    totalReviews: number;
    isOperational: boolean;
    verificationStatus: string;
  };
  meals: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface DashboardStats {
  todayStats: {
    orders: number;
    revenue: number;
    avgOrderValue: number;
  };
  weeklyStats: {
    orders: number;
    revenue: number;
    averageRating?: number;
    uniqueCustomers?: number;
  };
  recentOrders: Array<{
    orderId: string;
    customer: string;
    customerId?: string;
    customerEmail?: string;
    items: number;
    total: number;
    status: string;
    createdAt?: string;
    paymentMethod?: string;
  }>;
  popularMeals: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
    image?: string;
  }>;
}

export interface AnalyticsData {
  restaurant: {
    name: string;
    rating: number;
    totalReviews: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  meals: {
    total: number;
    active: number;
    inactive: number;
  };
  orders?: {
    total: number;
    completed: number;
    cancelled: number;
    averageValue: number;
  };
  revenue?: {
    total: number;
    daily: Array<{
      date: string;
      amount: number;
    }>;
  };
  customers?: {
    total: number;
    new: number;
    returning: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantAnalyticsService {
  private readonly API_BASE = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Get comprehensive restaurant dashboard data
   * Endpoint: GET /api/restaurant/dashboard
   */
  getDashboardData(): Observable<ApiResponse<ActualDashboardResponse>> {
    return this.http.get<ApiResponse<ActualDashboardResponse>>(
      `${this.API_BASE}/restaurant/dashboard`
    );
  }

  /**
   * Get restaurant analytics data
   * Endpoint: GET /api/restaurant/analytics
   */
  getAnalytics(startDate?: string, endDate?: string): Observable<ApiResponse<AnalyticsData>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<AnalyticsData>>(
      `${this.API_BASE}/restaurant/analytics`,
      { params }
    );
  }

  /**
   * Get analytics for a specific time period
   */
  getAnalyticsForPeriod(period: '7days' | '30days' | '3months'): Observable<ApiResponse<AnalyticsData>> {
    const end = new Date();
    const days = this.getPeriodDays(period);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.getAnalytics(start.toISOString(), end.toISOString());
  }

  /**
   * Get real-time dashboard statistics
   */
  getRealTimeStats(): Observable<ApiResponse<DashboardStats['todayStats']>> {
    return this.http.get<ApiResponse<DashboardStats['todayStats']>>(
      `${this.API_BASE}/restaurant/dashboard/realtime`
    );
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '7days': return 7;
      case '30days': return 30;
      case '3months': return 90;
      default: return 30;
    }
  }
}
