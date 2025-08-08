export interface Meal {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  rating?: number;
  reviewsCount?: number;
  restaurantId?: string;
  restaurant?: {
    _id?: string;
    id?: string;
    name: string;
    image?: string;
  };
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  discount?: {
    percentage: number;
    validUntil?: Date;
  };
  tags?: string[];
  spicyLevel?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  portionSize?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
