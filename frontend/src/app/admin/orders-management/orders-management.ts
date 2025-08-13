import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  revenueToday: number;
  ordersToday: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  topRestaurant: string;
}

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-management.html',
  styleUrls: ['./orders-management.scss']
})
export class OrdersManagement implements OnInit {
  isLoading = true;
  errorMessage = '';

  // Order Statistics
  orderStats: OrderStats = {
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
    revenueToday: 0,
    ordersToday: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    topRestaurant: 'N/A'
  };

  // Time filter for stats
  timeFilter = 'all'; // all, today, week, month
  timeFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  // Add selected period for analytics
  selectedPeriod = '7d';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadOrderStats();
  }

  loadOrderStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Calculate date range based on time filter
    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (this.timeFilter) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      default: // 'all'
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        startDate = yearAgo.toISOString().split('T')[0];
        break;
    }

    this.adminService.getOrderStats(startDate, endDate, 'day').subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.stats) {
          const stats = response.data.stats;
          this.orderStats = {
            totalOrders: stats.totalOrders || 0,
            totalRevenue: stats.totalRevenue || 0,
            activeOrders: (stats.ordersByStatus?.pending || 0) + (stats.ordersByStatus?.confirmed || 0) +
              (stats.ordersByStatus?.preparing || 0) + (stats.ordersByStatus?.ready || 0) +
              (stats.ordersByStatus?.out_for_delivery || 0),
            completedOrders: stats.ordersByStatus?.delivered || 0,
            pendingOrders: stats.ordersByStatus?.pending || 0,
            cancelledOrders: stats.ordersByStatus?.cancelled || 0,
            avgOrderValue: stats.averageOrderValue || 0,
            revenueToday: 0,
            ordersToday: 0,
            monthlyRevenue: 0,
            monthlyOrders: 0,
            topRestaurant: stats.popularMeals?.[0]?.name || 'N/A'
          };

          // Calculate today's stats from revenueByPeriod
          const today = new Date().toISOString().split('T')[0];
          const todayData = stats.revenueByPeriod?.find((item: any) => item.date === today);
          if (todayData) {
            this.orderStats.ordersToday = todayData.orders || 0;
            this.orderStats.revenueToday = todayData.revenue || 0;
          }

          // Calculate monthly stats
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          if (stats.revenueByPeriod) {
            const monthlyData = stats.revenueByPeriod.filter((item: any) => {
              const itemDate = new Date(item.date);
              return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            });
            this.orderStats.monthlyOrders = monthlyData.reduce((sum: number, item: any) => sum + (item.orders || 0), 0);
            this.orderStats.monthlyRevenue = monthlyData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading order statistics: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  private calculateStats(orders: any[]): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter orders based on time filter
    let filteredOrders = orders;
    if (this.timeFilter === 'today') {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
      });
    } else if (this.timeFilter === 'week') {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= thisWeekStart;
      });
    } else if (this.timeFilter === 'month') {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= thisMonthStart;
      });
    }

    // Calculate basic stats
    this.orderStats.totalOrders = filteredOrders.length;
    this.orderStats.totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    this.orderStats.avgOrderValue = this.orderStats.totalOrders > 0 ? this.orderStats.totalRevenue / this.orderStats.totalOrders : 0;

    // Calculate status-based stats
    this.orderStats.activeOrders = filteredOrders.filter(order =>
      ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)
    ).length;

    this.orderStats.completedOrders = filteredOrders.filter(order =>
      order.status === 'delivered'
    ).length;

    this.orderStats.pendingOrders = filteredOrders.filter(order =>
      order.status === 'pending'
    ).length;

    this.orderStats.cancelledOrders = filteredOrders.filter(order =>
      order.status === 'cancelled'
    ).length;

    // Calculate today's stats (regardless of filter)
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });

    this.orderStats.ordersToday = todayOrders.length;
    this.orderStats.revenueToday = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate monthly stats (regardless of filter)
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thisMonthStart;
    });

    this.orderStats.monthlyOrders = monthlyOrders.length;
    this.orderStats.monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Find top restaurant
    const restaurantStats = new Map<string, number>();
    filteredOrders.forEach(order => {
      if (order.restaurant && order.restaurant.name) {
        const count = restaurantStats.get(order.restaurant.name) || 0;
        restaurantStats.set(order.restaurant.name, count + 1);
      }
    });

    let topRestaurant = 'N/A';
    let maxOrders = 0;
    restaurantStats.forEach((count, restaurant) => {
      if (count > maxOrders) {
        maxOrders = count;
        topRestaurant = restaurant;
      }
    });

    this.orderStats.topRestaurant = topRestaurant;
  }

  onTimeFilterChange(): void {
    this.loadOrderStats();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getCompletionRate(): number {
    if (this.orderStats.totalOrders === 0) return 0;
    return (this.orderStats.completedOrders / this.orderStats.totalOrders) * 100;
  }

  getCancellationRate(): number {
    if (this.orderStats.totalOrders === 0) return 0;
    return (this.orderStats.cancelledOrders / this.orderStats.totalOrders) * 100;
  }

  refreshStats(): void {
    this.loadOrderStats();
  }

  getCurrentTimeLabel(): string {
    const option = this.timeFilterOptions.find(o => o.value === this.timeFilter);
    return option ? option.label : 'All Time';
  }

  viewAllTimeData(): void {
    this.timeFilter = 'all';
    this.onTimeFilterChange();
  }

  // Add missing trend methods
  getOrderTrend(): string {
    return 'positive'; // Default to positive
  }

  getOrderTrendIcon(): string {
    return 'fas fa-arrow-up';
  }

  getOrderTrendValue(): number {
    return 5.2; // Default trend value
  }

  getRevenueTrend(): string {
    return 'positive';
  }

  getRevenueTrendIcon(): string {
    return 'fas fa-arrow-up';
  }

  getRevenueTrendValue(): number {
    return 8.1;
  }

  getAOVTrend(): string {
    return 'positive';
  }

  getAOVTrendIcon(): string {
    return 'fas fa-arrow-up';
  }

  getAOVTrendValue(): number {
    return 3.4;
  }

  getActiveTrend(): string {
    return 'negative';
  }

  getActiveTrendIcon(): string {
    return 'fas fa-arrow-down';
  }

  getActiveTrendValue(): number {
    return 1.2;
  }

  getPendingPercentage(): number {
    if (this.orderStats.totalOrders === 0) return 0;
    return (this.orderStats.pendingOrders / this.orderStats.totalOrders) * 100;
  }

  getCompletedPercentage(): number {
    if (this.orderStats.totalOrders === 0) return 0;
    return (this.orderStats.completedOrders / this.orderStats.totalOrders) * 100;
  }

  getCancelledPercentage(): number {
    if (this.orderStats.totalOrders === 0) return 0;
    return (this.orderStats.cancelledOrders / this.orderStats.totalOrders) * 100;
  }

  getCompletionTrend(): string {
    return 'positive';
  }

  getCompletionTrendIcon(): string {
    return 'fas fa-arrow-up';
  }

  getCompletionTrendValue(): number {
    return 2.3;
  }

  getDailyTrend(): string {
    return 'positive';
  }

  getDailyTrendIcon(): string {
    return 'fas fa-arrow-up';
  }

  getDailyTrendValue(): number {
    return 12.5;
  }

  getMonthlyTrend(): string {
    return 'positive';
  }

  getMonthlyTrendIcon(): string {
    return 'fas fa-arrow-up';
  }

  getMonthlyTrendValue(): number {
    return 18.7;
  }

  getCancelTrend(): string {
    return 'negative';
  }

  getCancelTrendIcon(): string {
    return 'fas fa-arrow-down';
  }

  getCancelTrendValue(): number {
    return 0.8;
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  getTopRestaurants(): any[] {
    return [
      { name: 'Pizza Palace', orders: 145, revenue: 4280, rating: 4.8 },
      { name: 'Burger Kingdom', orders: 132, revenue: 3960, rating: 4.6 },
      { name: 'Sushi World', orders: 98, revenue: 5890, rating: 4.9 },
      { name: 'Taco Fiesta', orders: 87, revenue: 2610, rating: 4.5 },
      { name: 'Italian Garden', orders: 76, revenue: 3420, rating: 4.7 }
    ];
  }

  viewAllRestaurants(): void {
    // Navigate to restaurants page or show more
  }
}
