import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { Address } from '../models/address';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`);
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/profile`, userData);
  }

  addAddress(address: Address): Observable<Address[]> {
    return this.http.post<Address[]>(`${environment.apiUrl}/user/addresses`, address);
  }

  updateAddress(addressId: string, address: Address): Observable<Address[]> {
    return this.http.put<Address[]>(`${environment.apiUrl}/user/addresses/${addressId}`, address);
  }

  deleteAddress(addressId: string): Observable<Address[]> {
    return this.http.delete<Address[]>(`${environment.apiUrl}/user/addresses/${addressId}`);
  }

  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/user/favorites`);
  }

  addToFavorites(restaurantId: string): Observable<string[]> {
    return this.http.post<string[]>(`${environment.apiUrl}/user/favorites`, { restaurantId });
  }

  removeFromFavorites(restaurantId: string): Observable<string[]> {
    return this.http.delete<string[]>(`${environment.apiUrl}/user/favorites/${restaurantId}`);
  }

  // Change password
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/user/change-password`, passwordData);
  }

  // Get addresses
  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${environment.apiUrl}/user/addresses`);
  }

  // Set default address
  setDefaultAddress(addressId: string): Observable<Address[]> {
    return this.http.put<Address[]>(`${environment.apiUrl}/user/addresses/${addressId}/default`, {});
  }

  // Add restaurant to favorites
  toggleFavorite(restaurantId: string): Observable<{ isFavorite: boolean }> {
    return this.http.post<{ isFavorite: boolean }>(`${environment.apiUrl}/user/favorites/toggle`, { restaurantId });
  }

  // Check restaurant favorite status
  isFavorite(restaurantId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${environment.apiUrl}/user/favorites/check/${restaurantId}`);
  }

  // Admin functions
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/stats`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/users`);
  }

  updateUserStatus(userId: string, status: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/users/${userId}/status`, { status });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/admin/users/${userId}`);
  }

  approveRestaurant(restaurantId: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/restaurants/${restaurantId}/approve`, {});
  }

  rejectRestaurant(restaurantId: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/restaurants/${restaurantId}/reject`, {});
  }

  getSystemAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/alerts`);
  }

  dismissAlert(alertId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/admin/alerts/${alertId}`);
  }

  getTopRestaurants(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/restaurants/top`);
  }

  exportReport(reportType: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/admin/reports/export/${reportType}`, {
      responseType: 'blob'
    });
  }
}

