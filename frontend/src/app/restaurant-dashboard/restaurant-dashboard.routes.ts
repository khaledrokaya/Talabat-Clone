import { Routes } from '@angular/router';
import { RestaurantDashboard } from './restaurant-dashboard/restaurant-dashboard';
import { RestaurantOrders } from './restaurant-orders/restaurant-orders';
import { OrdersManagementComponent } from './orders-management/orders-management.component';
import { MealsManagementComponent } from './meals-management/meals-management.component';
import { Wallet } from './wallet/wallet';

export const RESTAURANT_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: RestaurantDashboard
  },
  {
    path: 'meals-management',
    component: MealsManagementComponent
  },
  {
    path: 'orders-management',
    component: OrdersManagementComponent
  },
  {
    path: 'orders',
    component: RestaurantOrders
  },
  {
    path: 'wallet',
    component: Wallet
  }
];


