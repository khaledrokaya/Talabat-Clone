export interface ICartItem {
  mealId: string;
  mealName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: {
    choiceName: string;
    price: number;
  }[];
  specialInstructions?: string;
}

export interface ICartResponse {
  _id: string;
  customerId: string;
  restaurantId?: string;
  restaurantName?: string;
  items: ICartItem[];
  totalAmount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddToCartRequest {
  mealId: string;
  quantity?: number;
  selectedOptions?: {
    choiceName: string;
    price: number;
  }[];
  specialInstructions?: string;
}

export interface IUpdateCartItemRequest {
  mealId: string;
  quantity: number;
  selectedOptions?: {
    choiceName: string;
    price: number;
  }[];
}

export interface IRemoveFromCartRequest {
  mealId: string;
  selectedOptions?: {
    choiceName: string;
    price: number;
  }[];
}
