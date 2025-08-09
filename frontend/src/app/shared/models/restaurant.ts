export interface Restaurant {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  cuisine?: string;
  rating?: number;
  reviewsCount?: number;
  totalReviews?: number;
  deliveryTime?: number;
  estimatedDeliveryTime?: number;
  minimumOrder?: number;
  deliveryFee?: number;
  image?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  isOpen?: boolean;
  isApproved?: boolean;
  status?: string;
  ownerId?: string;
  categories?: any[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // API Response structure matching
  restaurantDetails?: {
    name: string;
    description?: string;
    cuisineType: string[];
    averageDeliveryTime: number;
    minimumOrderAmount: number;
    deliveryFee: number;
    serviceRadius: number;
    openingHours: {
      [key: string]: {
        open: string;
        close: string;
        isOpen: boolean;
      };
    };
  };
  ratings?: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown?: {
      [key: number]: number;
    };
  };
  menu?: any[];
  isOperational?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export interface Meal {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  restaurantId: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number;
  discount?: {
    percentage: number;
    validUntil: Date;
  };
  ratings: {
    average: number;
    count: number;
  };
  restaurant?: {
    name: string;
    rating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

