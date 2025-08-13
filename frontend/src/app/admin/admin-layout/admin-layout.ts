import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss']
})
export class AdminLayout implements OnInit {
  currentAdmin: any = null;
  activeTab = 'dashboard';
  isSidebarCollapsed = false;

  adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-chart-line',
      route: '/admin/dashboard',
      description: 'Overview and quick stats'
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'fas fa-users',
      route: '/admin/users',
      description: 'Manage users'
    },
    {
      id: 'orders',
      label: 'Order Statistics',
      icon: 'fas fa-chart-bar',
      route: '/admin/orders',
      description: 'View order statistics'
    },
    {
      id: 'restaurants',
      label: 'Restaurant Approvals',
      icon: 'fas fa-store',
      route: '/admin/restaurants',
      description: 'Approve pending restaurants'
    },
    {
      id: 'delivery',
      label: 'Delivery Partner Approvals',
      icon: 'fas fa-truck',
      route: '/admin/delivery',
      description: 'Approve delivery partners'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadAdminData();
    this.setActiveTabFromRoute();
  }

  loadAdminData(): void {
    this.currentAdmin = this.authService.getCurrentUser();
  }

  setActiveTabFromRoute(): void {
    const url = this.router.url;
    const foundItem = this.adminNavItems.find(item => url.includes(item.id));
    if (foundItem) {
      this.activeTab = foundItem.id;
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    const navItem = this.adminNavItems.find(item => item.id === tabId);
    if (navItem) {
      this.router.navigate([navItem.route]);
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.currentAdmin = null;
      this.router.navigate(['/auth/login']);
    });
  }

  goToMainSite(): void {
    this.router.navigate(['/']);
  }
}
