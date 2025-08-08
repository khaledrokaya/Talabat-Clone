import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardStats, AnalyticsData, ApiResponse } from './restaurant-analytics.service';

/**
 * Mock service for testing restaurant analytics without backend connection
 */
@Injectable({
  providedIn: 'root'
})
export class MockRestaurantAnalyticsService {

  getDashboardData(): Observable<ApiResponse<{ dashboard: DashboardStats }>> {
    const mockDashboard: DashboardStats = {
      todayStats: {
        orders: 28,
        revenue: 523.75,
        avgOrderValue: 18.70
      },
      weeklyStats: {
        orders: 178,
        revenue: 3124.50,
        averageRating: 4.7,
        uniqueCustomers: 142
      },
      recentOrders: [
        {
          orderId: "ORD-2025-001856",
          customer: "أحمد محمد",
          customerId: "cust_001",
          customerEmail: "ahmed@example.com",
          items: 3,
          total: 42.50,
          status: "preparing",
          createdAt: new Date().toISOString(),
          paymentMethod: "card"
        },
        {
          orderId: "ORD-2025-001857",
          customer: "فاطمة علي",
          customerId: "cust_002",
          customerEmail: "fatima@example.com",
          items: 2,
          total: 35.75,
          status: "pending",
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          paymentMethod: "cash"
        },
        {
          orderId: "ORD-2025-001858",
          customer: "محمد سالم",
          customerId: "cust_003",
          customerEmail: "mohammed@example.com",
          items: 4,
          total: 67.25,
          status: "ready",
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          paymentMethod: "card"
        }
      ],
      popularMeals: [
        {
          id: "meal_001",
          name: "برجر اللحم الممتاز",
          orders: 52,
          revenue: 832.00,
          image: ""
        },
        {
          id: "meal_002",
          name: "بيتزا مارجريتا كبيرة",
          orders: 38,
          revenue: 722.00,
          image: ""
        },
        {
          id: "meal_003",
          name: "سلطة القيصر الطازجة",
          orders: 29,
          revenue: 435.00,
          image: ""
        },
        {
          id: "meal_004",
          name: "دجاج مشوي بالأعشاب",
          orders: 25,
          revenue: 575.00,
          image: ""
        }
      ]
    };

    const response: ApiResponse<{ dashboard: DashboardStats }> = {
      success: true,
      message: "Dashboard data retrieved successfully",
      data: { dashboard: mockDashboard }
    };

    return of(response).pipe(delay(800)); // Simulate network delay
  }

  getAnalytics(startDate?: string, endDate?: string): Observable<ApiResponse<AnalyticsData>> {
    const mockAnalytics: AnalyticsData = {
      restaurant: {
        name: "مطعم الذواقة الشرقية",
        rating: 4.7,
        totalReviews: 245
      },
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString()
      },
      meals: {
        total: 47,
        active: 42,
        inactive: 5
      },
      orders: {
        total: 178,
        completed: 165,
        cancelled: 13,
        averageValue: 17.55
      },
      revenue: {
        total: 3124.50,
        daily: this.generateDailyRevenue(30)
      },
      customers: {
        total: 142,
        new: 23,
        returning: 119
      }
    };

    const response: ApiResponse<AnalyticsData> = {
      success: true,
      message: "Analytics data retrieved successfully",
      data: mockAnalytics
    };

    return of(response).pipe(delay(600));
  }

  getAnalyticsForPeriod(period: '7days' | '30days' | '3months'): Observable<ApiResponse<AnalyticsData>> {
    const end = new Date();
    const days = this.getPeriodDays(period);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.getAnalytics(start.toISOString(), end.toISOString());
  }

  private generateDailyRevenue(days: number): Array<{ date: string; amount: number }> {
    const daily = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const amount = Math.random() * 200 + 50; // Random revenue between 50-250
      daily.push({
        date: date.toISOString().split('T')[0],
        amount: Math.round(amount * 100) / 100
      });
    }
    return daily;
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
