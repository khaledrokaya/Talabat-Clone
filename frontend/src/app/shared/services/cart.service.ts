import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  restaurantId: string;
  restaurantName?: string;
  selectedOptions?: any[];
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  restaurantId?: string;
  restaurantName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], totalAmount: 0 });
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    // Load cart from localStorage on service initialization
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartSubject.next(JSON.parse(savedCart));
    }
  }

  get currentCart(): Cart {
    return this.cartSubject.value;
  }

  addToCart(item: CartItem): void {
    const currentCart = this.currentCart;
    
    // Check if adding item from different restaurant
    if (currentCart.restaurantId && currentCart.restaurantId !== item.restaurantId) {
      // Clear cart if different restaurant
      this.clearCart();
    }

    const existingItemIndex = currentCart.items.findIndex(
      cartItem => cartItem.productId === item.productId && 
      JSON.stringify(cartItem.selectedOptions) === JSON.stringify(item.selectedOptions)
    );

    if (existingItemIndex > -1) {
      // Update existing item
      currentCart.items[existingItemIndex].quantity += item.quantity;
      currentCart.items[existingItemIndex].totalPrice = 
        currentCart.items[existingItemIndex].quantity * currentCart.items[existingItemIndex].unitPrice;
    } else {
      // Add new item
      currentCart.items.push(item);
      currentCart.restaurantId = item.restaurantId;
      currentCart.restaurantName = item.restaurantName;
    }

    this.updateCartTotal(currentCart);
    this.saveCart(currentCart);
  }

  removeFromCart(itemId: string): void {
    const currentCart = this.currentCart;
    currentCart.items = currentCart.items.filter(item => item.id !== itemId);
    
    if (currentCart.items.length === 0) {
      currentCart.restaurantId = undefined;
      currentCart.restaurantName = undefined;
    }

    this.updateCartTotal(currentCart);
    this.saveCart(currentCart);
  }

  updateQuantity(itemId: string, quantity: number): void {
    const currentCart = this.currentCart;
    const itemIndex = currentCart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        currentCart.items[itemIndex].quantity = quantity;
        currentCart.items[itemIndex].totalPrice = 
          currentCart.items[itemIndex].quantity * currentCart.items[itemIndex].unitPrice;
        this.updateCartTotal(currentCart);
        this.saveCart(currentCart);
      }
    }
  }

  clearCart(): void {
    const emptyCart: Cart = { items: [], totalAmount: 0 };
    this.saveCart(emptyCart);
  }

  getItemCount(): number {
    return this.currentCart.items.reduce((count, item) => count + item.quantity, 0);
  }

  private updateCartTotal(cart: Cart): void {
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }
}

