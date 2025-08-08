import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { Restaurant } from '../../shared/models/restaurant';
import { Product } from '../../shared/models/product';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})
export class RestaurantDetails implements OnInit {
  restaurant: Restaurant | null = null;
  menuCategories: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const restaurantId = params.get('id');
      if (restaurantId) {
        this.loadRestaurantDetails(restaurantId);
      }
    });
  }

  loadRestaurantDetails(id: string): void {
    this.loading = true;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.menuCategories = restaurant.categories || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading restaurant details:', error);
        this.errorMessage = 'فشل تحميل تفاصيل المطعم.';
        this.loading = false;
      }
    });
  }

  addToCart(product: Product, restaurant: Restaurant): void {
    // For simplicity, assuming no options are selected for now
    // In a real app, you'd have a modal or form to select options
    const cartItem: CartItem = {
      id: product._id, // Use product ID as item ID for simplicity
      productId: product._id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
      restaurantId: restaurant._id || '',
      restaurantName: restaurant.name,
      selectedOptions: []
    };
    this.cartService.addToCart(cartItem);
    alert(`${product.name} تم إضافته إلى السلة!`);
  }
}

