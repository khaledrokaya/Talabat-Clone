import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import Cookies from 'js-cookie';

export type { User } from '../models/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface CustomerRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface RestaurantRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  restaurantDetails: {
    name: string;
    description: string;
    cuisineType: string[];
    averageDeliveryTime: number;
    minimumOrderAmount: number;
    deliveryFee: number;
    serviceRadius: number;
    logoUrl?: string;
    bannerUrl?: string;
    openingTime?: string;
    closingTime?: string;
    isOpen?: boolean;
    acceptsOnlinePayment?: boolean;
    acceptsCashOnDelivery?: boolean;
    specialOffers?: string;
    tags?: string[];
    socialMedia?: {
      website?: string;
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  businessInfo: {
    licenseNumber: string;
    taxId: string;
    bankAccountNumber?: string;
    bankName?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
}

export interface DeliveryRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleInfo: {
    type: string;
    licensePlate: string;
    color: string;
    model: string;
  };
  deliveryZones: string[];
  documents: {
    licenseNumber: string;
    licenseImage: string;
    vehicleRegistration: string;
    identityProof: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isEmailVerified: boolean;
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    userId?: string;
    verificationStatus?: string;
    createdAt?: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenCheckInterval: any;
  private refreshTokenTimeout: any;
  private readonly LOGIN_GRACE_PERIOD = 60 * 1000; // 1 minute grace period after login
  private lastLoginTime: number = 0;

  constructor(private http: HttpClient) {
    // Initialize user from stored data
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Check if we have a valid token
    const token = this.getToken();

    if (token && !this.isTokenExpired(token)) {
      if (storedUser) {
        // We have both token and user data
        this.lastLoginTime = Date.now();
      } else {
        // We have valid token but no user data - fetch from backend
        this.fetchAndSetCurrentUser();
      }
    } else if (storedUser) {
      // We have user data but invalid/no token - clear everything
      this.clearStoredAuth();
      this.currentUserSubject.next(null);
    }

    // Start token validation check for all users
    this.startTokenValidation();
    this.scheduleTokenRefresh();
  }

  private getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      const token = this.getToken();

      // Check if we have user data and valid token
      if (userStr && token && !this.isTokenExpired(token)) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      this.clearStoredAuth();
    }
    return null;
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.deleteCookie('accessToken');
    this.deleteCookie('refreshToken');

    // Also clear any user data cookies
    this.deleteCookie('currentUser');

    // Clear with different path variations to ensure cleanup
    this.deleteCookie('accessToken', '/');
    this.deleteCookie('refreshToken', '/');
    this.deleteCookie('currentUser', '/');
  }

  private startTokenValidation(): void {
    // Check token validity every 5 minutes for all users (start after 1 minute delay)
    this.tokenCheckInterval = timer(60 * 1000, 5 * 60 * 1000).subscribe(() => {
      const currentUser = this.currentUserValue;

      // Skip validation during grace period after login
      if (Date.now() - this.lastLoginTime < this.LOGIN_GRACE_PERIOD) {
        return;
      }

      if (currentUser) {
        const token = this.getToken();
        if (token && this.isTokenExpired(token)) {
          this.refreshToken().subscribe({
            error: () => this.forceLogout()
          });
        }
      }
    });
  }

  private scheduleTokenRefresh(): void {
    const token = this.getToken();
    if (!token) return;

    const tokenExp = this.getTokenExpiration(token);
    if (!tokenExp) return;

    // Refresh token 5 minutes before expiration
    const refreshTime = tokenExp - Date.now() - (5 * 60 * 1000);

    if (refreshTime > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          next: () => this.scheduleTokenRefresh(),
          error: () => this.forceLogout()
        });
      }, refreshTime);
    }
  }

  private isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    return expiration ? Date.now() >= expiration : true;
  }

  private getTokenExpiration(token: string): number | null {
    try {
      const payload = this.decodeToken(token);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      return null;
    }
  }

  private getClientIP(): string {
    // This would typically be set by the server or a service
    // For now, return a placeholder - in production, get from server
    return 'client-ip-placeholder';
  }

  // Enhanced cookie management methods using js-cookie
  private setCookie(name: string, value: string, options: { days?: number; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none'; path?: string } = {}): void {
    const {
      days = 7,
      secure = environment.production, // Use secure cookies only in production
      sameSite = environment.production ? 'none' : 'lax', // Use 'none' for cross-origin in production
      path = '/'
    } = options;

    const cookieOptions: Cookies.CookieAttributes = {
      expires: days,
      path,
      secure,
      sameSite
    };

    // In production with cross-origin, we need secure + sameSite none
    if (environment.production && secure && sameSite === 'none') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'none';
    }

    Cookies.set(name, value, cookieOptions);
  }

  private getCookie(name: string): string | null {
    return Cookies.get(name) || null;
  }

  private deleteCookie(name: string, path: string = '/'): void {
    // Remove cookie with js-cookie
    Cookies.remove(name, { path });

    // Also try removing with different path variations to ensure cleanup
    Cookies.remove(name, { path: '/' });
    Cookies.remove(name);
  }

  private getAllCookies(): { [key: string]: string } {
    return Cookies.get();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Login method - works for all users including admin
  login(credentials: LoginRequest): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    })
      .pipe(
        tap(response => {
          if (response.success && response.data && response.data.user) {

            // Store tokens from response if available
            if (response.data.tokens) {
              localStorage.setItem('accessToken', response.data.tokens.accessToken);
              localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
            }

            // Set login time for grace period
            this.lastLoginTime = Date.now();

            // Set auth data for all users (admin and regular users)
            this.setAuthData(response.data.user);

            // Force check tokens are available after login
            setTimeout(() => {
              const token = this.getToken();
              if (token && !this.isTokenExpired(token)) {
                // Ensure user state is properly set
                if (!this.currentUserValue) {
                  // Create proper user object from response data
                  const userObj: User = {
                    id: response.data!.user!.id,
                    name: `${response.data!.user!.firstName} ${response.data!.user!.lastName}`,
                    email: response.data!.user!.email,
                    role: response.data!.user!.role as 'customer' | 'restaurant_owner' | 'admin' | 'delivery',
                    phone: '',
                    addresses: [],
                    favoriteRestaurants: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  this.currentUserSubject.next(userObj);
                }

                // Debug auth state after login
                this.debugAuthState();
              } else {
              }
            }, 100);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  // Customer registration
  registerCustomer(userData: CustomerRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/customer`, userData, {
      withCredentials: true
    });
  }

  // Restaurant registration
  registerRestaurant(userData: RestaurantRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/restaurant`, userData, {
      withCredentials: true
    });
  }

  // Delivery registration
  registerDelivery(userData: DeliveryRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/delivery`, userData, {
      withCredentials: true
    });
  }

  // Refresh token
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${environment.apiUrl}/auth/refresh`, {
      refreshToken
    }, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Tokens are set automatically by backend, no manual setting needed
        }
      }),
      catchError(error => {
        this.forceLogout();
        return throwError(() => error);
      })
    );
  }

  // Logout
  logout(): Observable<any> {
    const currentUser = this.currentUserValue;

    // For admin users, use admin logout endpoint
    if (currentUser && currentUser.role === 'admin') {
      return this.http.post(`${environment.apiUrl}/auth/logout/admin`, {}, {
        withCredentials: true
      }).pipe(
        tap(() => this.forceLogout()),
        catchError(() => {
          // Even if server logout fails, clear local storage
          this.forceLogout();
          return of(null);
        })
      );
    } else {
      // Regular user logout
      return this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
        withCredentials: true
      }).pipe(
        tap(() => this.forceLogout()),
        catchError(() => {
          // Even if server logout fails, clear local storage
          this.forceLogout();
          return of(null);
        })
      );
    }
  }

  private setAuthData(user: any): void {

    // Create user object compatible with our User interface
    const userObj: User = {
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.email,
      email: user.email,
      role: user.role as 'customer' | 'restaurant_owner' | 'admin' | 'delivery',
      phone: user.phone || '',
      addresses: user.addresses || [],
      favoriteRestaurants: user.favoriteRestaurants || [],
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
    };

    // Store user data in localStorage (tokens are in httpOnly cookies)
    localStorage.setItem('currentUser', JSON.stringify(userObj));
    this.currentUserSubject.next(userObj);
    this.scheduleTokenRefresh();

  }

  private forceLogout(): void {
    this.clearStoredAuth();
    this.currentUserSubject.next(null);

    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
    }
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  // Get current access token from localStorage (preferred) or cookies (fallback)
  getToken(): string | null {
    // First try localStorage (for tokens from login response)
    const token = localStorage.getItem('accessToken');
    if (token) {
      return token;
    }

    // Fallback to cookies (for httpOnly cookies from backend)
    const cookieToken = this.getCookie('accessToken');

    // Debug logging for production cookie issues
    if (environment.production) {
      if (!token && !cookieToken) {
      }
    }

    return cookieToken;
  }

  // Get refresh token from localStorage (preferred) or cookies (fallback)
  getRefreshToken(): string | null {
    // First try localStorage
    const token = localStorage.getItem('refreshToken');
    if (token) {
      return token;
    }

    // Fallback to cookies
    return this.getCookie('refreshToken');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = this.getToken();

    // First check if we have a valid token
    if (!token || this.isTokenExpired(token)) {
      return false;
    }

    const currentUser = this.currentUserValue;

    // If we have a valid token but no user data, fetch it and return true
    if (!currentUser) {
      this.fetchAndSetCurrentUser();
      return true; // Consider user logged in while fetching
    }

    // We have both valid token and user data
    return true;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const currentUser = this.currentUserValue;
    return currentUser?.role === role;
  }

  // Get current user
  getCurrentUser(): Observable<User> {
    return this.http.get<{ success: boolean, data: { user: User } }>(`${environment.apiUrl}/auth/profile`, {
      withCredentials: true
    }).pipe(
      map(response => response.data.user)
    );
  }

  // Method to manually refresh user state
  refreshUserState(): void {
    if (this.isLoggedIn()) {
      this.getCurrentUser().subscribe({
        next: (user: any) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.setCookie('currentUser', JSON.stringify(user), { days: 7 });
          this.currentUserSubject.next(user);
        },
        error: (error) => {
        }
      });
    }
  }

  // Fetch current user and set auth data (used when tokens exist but no user data)
  private fetchAndSetCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.setAuthData(user);
        this.lastLoginTime = Date.now();
      },
      error: (error) => {
        // If we can't fetch user profile, clear invalid tokens
        this.clearStoredAuth();
        this.currentUserSubject.next(null);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
    }
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  // Force reload user from stored data (useful for debugging)
  forceReloadUserState(): void {
    const storedUser = this.getStoredUser();

    // Set login time to provide grace period for session validation
    if (storedUser) {
      this.lastLoginTime = Date.now();
    }

    this.currentUserSubject.next(storedUser);
  }

  // Clear all auth data (useful for debugging corrupted sessions)
  clearAllAuthData(): void {
    this.clearStoredAuth();
    this.currentUserSubject.next(null);
  }

  // Debug method to log current authentication state
  debugAuthState(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    const currentUser = this.currentUserValue;
    const isLoggedIn = this.isLoggedIn();
    const isAuthenticated = this.isAuthenticated();
    const allCookies = this.getAllCookies();


    if (token) {
      const isExpired = this.isTokenExpired(token);
      const expiration = this.getTokenExpiration(token);
    }

  }

  // Debug method specifically for cookies
  debugCookies(): void {
    const allCookies = this.getAllCookies();
  }

  // Check and sync authentication state (useful for components)
  checkAuthState(): Observable<User | null> {
    const token = this.getToken();
    const currentUser = this.currentUserValue;

    if (token && !this.isTokenExpired(token)) {
      if (!currentUser) {
        // We have a valid token but no user data, fetch it
        return this.getCurrentUser().pipe(
          tap(user => {
            this.setAuthData(user);
            this.lastLoginTime = Date.now();
          }),
          catchError(error => {
            this.clearStoredAuth();
            this.currentUserSubject.next(null);
            return of(null);
          })
        );
      } else {
        // We have both user data and valid token
        return of(currentUser);
      }
    } else {
      // No valid authentication
      if (currentUser) {
        // Clear invalid user data
        this.clearStoredAuth();
        this.currentUserSubject.next(null);
      }
      return of(null);
    }
  }

  // Simplified method to check if authentication is valid
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  // Method to initialize auth state (call from app component)
  initializeAuthState(): Observable<boolean> {
    return this.checkAuthState().pipe(
      map(user => {
        const isAuthenticated = user !== null;
        return isAuthenticated;
      })
    );
  }

  // Change password method
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${environment.apiUrl}/auth/change-password`, passwordData, {
      withCredentials: true
    });
  }

  // Forgot password - send OTP
  forgotPassword(email: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${environment.apiUrl}/auth/forgot-password`, {
      email
    });
  }

  // Verify OTP
  verifyOTP(email: string, otp: string, type: 'registration' | 'password-reset'): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${environment.apiUrl}/auth/verify-otp`, {
      email,
      otp,
      type
    });
  }

  // Resend OTP
  resendOTP(email: string, type: 'registration' | 'password-reset'): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${environment.apiUrl}/auth/resend-otp`, {
      email,
      type
    });
  }

  // Reset password using OTP
  resetPassword(email: string, otp: string, newPassword: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      email,
      otp,
      newPassword
    });
  }
}
