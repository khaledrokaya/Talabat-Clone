import { Routes } from '@angular/router';
import { RestaurantList } from './restaurant-list/restaurant-list';
import { RestaurantDetails } from './restaurant-details/restaurant-details';

export const RESTAURANTS_ROUTES: Routes = [
  { path: '', component: RestaurantList },
  { path: ':id', component: RestaurantDetails }
];


