export interface CreateMealDTO {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  preparationTime: number;
}

export interface UpdateMealDTO extends Partial<CreateMealDTO> {
  isAvailable?: boolean;
  discount?: {
    percentage: number;
    validUntil: Date;
  };
}

export interface SearchMealsDTO {
  search?: string;
  category?: string;
  maxPrice?: number;
  minRating?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  restaurantId?: string;
  page?: number;
  limit?: number;
}
