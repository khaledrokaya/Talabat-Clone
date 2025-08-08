export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  restaurantId: string;
  isAvailable: boolean;
  options?: ProductOption[];
}

export interface ProductOption {
  name: string;
  type: 'size' | 'addon' | 'choice';
  required: boolean;
  choices: ProductChoice[];
}

export interface ProductChoice {
  name: string;
  price: number;
  isDefault: boolean;
}

