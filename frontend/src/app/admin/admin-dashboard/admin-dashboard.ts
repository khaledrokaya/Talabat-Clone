import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AdminService, DashboardData, AnalyticsData } from '../../shared/services/admin.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  isLoading = true;
  dashboardData: DashboardData | null = null;
  analyticsData: AnalyticsData | null = null;
  errorMessage = '';

  quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: 'fas fa-users',
      route: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Restaurants',
      description: 'Manage restaurant approvals',
      icon: 'fas fa-utensils',
      route: '/admin/restaurants',
      color: 'success'
    },
    {
      title: 'Delivery Partners',
      description: 'Manage delivery personnel',
      icon: 'fas fa-motorcycle',
      route: '/admin/delivery',
      color: 'info'
    },
    {
      title: 'Orders',
      description: 'Track and manage orders',
      icon: 'fas fa-clipboard-list',
      route: '/admin/orders',
      color: 'warning'
    },
    {
      title: 'Pending Approvals',
      description: 'Review pending requests',
      icon: 'fas fa-check-circle',
      route: '/admin/approvals',
      color: 'danger'
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: 'fas fa-chart-line',
      route: '/admin/analytics',
      color: 'dark'
    }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load dashboard and analytics data
    forkJoin({
      dashboard: this.adminService.getDashboardData(),
      analytics: this.adminService.getAnalyticsData()
    }).subscribe({
      next: (response) => {
        this.dashboardData = response.dashboard.data;
        this.analyticsData = response.analytics.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToRestaurants(): void {
    this.router.navigate(['/admin/restaurants']);
  }

  navigateToDelivery(): void {
    this.router.navigate(['/admin/delivery']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  navigateToApprovals(): void {
    this.router.navigate(['/admin/approvals']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/admin/settings']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(percentage: number): string {
    return percentage.toFixed(1) + '%';
  }
}
