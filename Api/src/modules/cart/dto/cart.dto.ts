export interface SelectedOptionDto {
  choiceName: string;
  price: number;
}

export interface AddToCartDto {
  mealId: string;
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
