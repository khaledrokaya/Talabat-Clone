import { Routes } from '@angular/router';

export const AdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'users', loadComponent: () => import('./users-management/users-management').then(m => m.UsersManagementComponent) },
      { path: 'orders', loadComponent: () => import('./orders-management/orders-management').then(m => m.OrdersManagement) },
      { path: 'restaurants', loadComponent: () => import('./restaurants-management/restaurants-management').then(m => m.RestaurantsManagement) },
      { path: 'delivery', loadComponent: () => import('./delivery-management/delivery-management').then(m => m.DeliveryManagement) }
    ]
  }
];

