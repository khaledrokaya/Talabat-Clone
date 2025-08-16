export interface SelectedOptionDto {
  choiceName: string;
  price: number;
}

export interface MealDto {
  _id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  restaurantId: string | {
    _id: string;
    name: string;
  };
}

export interface AddToCartDto {
  meal: MealDto;
  quantity?: number;
  selectedOptions?: SelectedOptionDto[];
  specialInstructions?: string;
}

export interface UpdateCartItemDto {
  mealId: string;
  quantity: number;
  selectedOptions?: SelectedOptionDto[];
}

export interface RemoveFromCartDto {
  mealId: string;
  selectedOptions?: SelectedOptionDto[];
}
