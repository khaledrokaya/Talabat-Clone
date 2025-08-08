import { Routes } from '@angular/router';
import { CustomerOrders } from './customer-orders/customer-orders';
import { RestaurantOrders } from './restaurant-orders/restaurant-orders';

export const ORDERS_ROUTES: Routes = [
  { path: 'customer', component: CustomerOrders },
  { path: 'restaurant', component: RestaurantOrders },
  { path: '', redirectTo: 'customer', pathMatch: 'full' }
];


