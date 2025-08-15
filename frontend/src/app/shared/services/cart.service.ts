import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface CartItem {
  id?: string;
  mealId: string;
  mealName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  restaurantId: string;
  restaurantName?: string;
  selectedOptions?: {
    choiceName: string;
    price: number;
  }[];
  specialInstructions?: string;
}

export interface Cart {
  _id?: string;
  customerId?: string;
  items: CartItem[];
  totalAmount: number;
  restaurantId?: string;
  restaurantName?: string;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], totalAmount: 0 });
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize cart when service is created
    this.initializeCart();

    // Listen to auth state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User logged in - load their cart
        this.loadCartFromAPI().subscribe();
      } else {
        // User logged out - clear cart
        this.cartSubject.next({ items: [], totalAmount: 0 });
      }
    });
  }

  private initializeCart(): void {
    if (this.authService.isLoggedIn()) {
      this.loadCartFromAPI().subscribe();
    }
  }

  private loadCartFromAPI(): Observable<Cart> {
    if (!this.authService.isLoggedIn()) {
      const emptyCart = { items: [], totalAmount: 0 };
      this.cartSubject.next(emptyCart);
      return of(emptyCart);
    }

    return this.http.get<ApiResponse<Cart>>(`${environment.apiUrl}/cart`).pipe(
      map((response) => {
        if (response.success) {
          // Convert mealId objects to strings if needed
          const cart = response.data;
          cart.items = cart.items.map(item => ({
            ...item,
            id: item.mealId,
            mealId: typeof item.mealId === 'object' ? (item.mealId as any)._id : item.mealId
          }));
          this.cartSubject.next(cart);
          return cart;
        }
        throw new Error(response.message);
      }),
      catchError((error) => {
        console.error('Failed to load cart:', error);
        // If cart doesn't exist, create one
        if (error.status === 404) {
          return this.createCart().pipe(
            map(() => ({ items: [], totalAmount: 0 }))
          );
        }
        const emptyCart = { items: [], totalAmount: 0 };
        this.cartSubject.next(emptyCart);
        return of(emptyCart);
      })
    );
  }

  private createCart(): Observable<Cart> {
    return this.http.post<ApiResponse<Cart>>(`${environment.apiUrl}/cart/create`, {}).pipe(
      map((response) => {
        if (response.success) {
          const cart = response.data;
          this.cartSubject.next(cart);
          return cart;
        }
        throw new Error(response.message);
      }),
      catchError((error) => {
        console.error('Failed to create cart:', error);
        const emptyCart = { items: [], totalAmount: 0 };
        this.cartSubject.next(emptyCart);
        return of(emptyCart);
      })
    );
  }

  get currentCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(item: Omit<CartItem, 'id' | 'totalPrice'>): Observable<boolean> {
    // If user is not logged in, throw error
    if (!this.authService.isLoggedIn()) {
      throw new Error('Please log in to add items to cart');
    }

    const addToCartData = {
      mealId: item.mealId,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions,
      specialInstructions: item.specialInstructions
    };

    return this.http.post<ApiResponse<Cart>>(`${environment.apiUrl}/cart/add`, addToCartData).pipe(
      tap((response) => {
        if (response.success) {
          const cart = response.data;
          // Convert mealId objects to strings if needed
          cart.items = cart.items.map(item => ({
            ...item,
            id: item.mealId,
            mealId: typeof item.mealId === 'object' ? (item.mealId as any)._id : item.mealId
          }));
          this.cartSubject.next(cart);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to add item to cart:', error);
        return of(false);
      })
    );
  }

  removeFromCart(itemId: string, selectedOptions?: any[]): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Please log in to modify cart items');
    }

    const removeData = {
      mealId: itemId,
      selectedOptions: selectedOptions
    };

    return this.http.delete<ApiResponse<Cart>>(`${environment.apiUrl}/cart/remove`, { body: removeData }).pipe(
      tap((response) => {
        if (response.success) {
          const cart = response.data;
          cart.items = cart.items.map(item => ({
            ...item,
            id: item.mealId,
            mealId: typeof item.mealId === 'object' ? (item.mealId as any)._id : item.mealId
          }));
          this.cartSubject.next(cart);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to remove item from cart:', error);
        return of(false);
      })
    );
  }

  updateQuantity(itemId: string, quantity: number, selectedOptions?: any[]): Observable<boolean> {
    if (quantity <= 0) {
      return this.removeFromCart(itemId, selectedOptions);
    }

    if (!this.authService.isLoggedIn()) {
      throw new Error('Please log in to modify cart items');
    }

    const updateData = {
      mealId: itemId,
      quantity: quantity,
      selectedOptions: selectedOptions
    };

    return this.http.put<ApiResponse<Cart>>(`${environment.apiUrl}/cart/update`, updateData).pipe(
      tap((response) => {
        if (response.success) {
          const cart = response.data;
          cart.items = cart.items.map(item => ({
            ...item,
            id: item.mealId,
            mealId: typeof item.mealId === 'object' ? (item.mealId as any)._id : item.mealId
          }));
          this.cartSubject.next(cart);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to update quantity:', error);
        return of(false);
      })
    );
  }

  clearCart(): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Please log in to clear cart');
    }

    return this.http.delete<ApiResponse<Cart>>(`${environment.apiUrl}/cart/clear`).pipe(
      tap((response) => {
        if (response.success) {
          this.cartSubject.next(response.data);
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to clear cart:', error);
        return of(false);
      })
    );
  }

  getItemCount(): number {
    return this.currentCart.items.reduce((count, item) => count + item.quantity, 0);
  }

  validateCart(): Observable<{ isValid: boolean; invalidItems: string[] }> {
    if (!this.authService.isLoggedIn()) {
      return of({ isValid: true, invalidItems: [] });
    }

    return this.http.get<ApiResponse<{ isValid: boolean; invalidItems: string[] }>>(`${environment.apiUrl}/cart/validate`).pipe(
      map((response) => response.data),
      catchError(() => of({ isValid: true, invalidItems: [] }))
    );
  }

  syncCart(): Observable<Cart> {
    if (!this.authService.isLoggedIn()) {
      return of(this.currentCart);
    }

    return this.http.post<ApiResponse<Cart>>(`${environment.apiUrl}/cart/sync`, {}).pipe(
      map((response) => {
        if (response.success) {
          const cart = response.data;
          cart.items = cart.items.map(item => ({
            ...item,
            id: item.mealId,
            mealId: typeof item.mealId === 'object' ? (item.mealId as any)._id : item.mealId
          }));
          this.cartSubject.next(cart);
          return cart;
        }
        throw new Error(response.message);
      }),
      catchError(() => of(this.currentCart))
    );
  }

  // Method to refresh cart from API
  refreshCart(): Observable<Cart> {
    if (!this.authService.isLoggedIn()) {
      return of(this.currentCart);
    }

    return this.loadCartFromAPI();
  }
}

