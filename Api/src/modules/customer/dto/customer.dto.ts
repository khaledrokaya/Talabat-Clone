export interface UpdateCustomerProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryPreferences?: {
    preferredDeliveryTime?: string;
    specialInstructions?: string;
  };
}

export interface AddToFavoritesDTO {
  restaurantId: string;
}

export interface CustomerProfileResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer';
  isActive: boolean;
  isEmailVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  orderHistory?: string[];
  favoriteRestaurants?: string[];
  deliveryPreferences?: {
    preferredDeliveryTime?: string;
    specialInstructions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryPreferencesDTO {
  preferredDeliveryTime?: string;
  specialInstructions?: string;
}
