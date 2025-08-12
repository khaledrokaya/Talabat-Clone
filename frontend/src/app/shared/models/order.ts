import { Address } from './address';

export interface Order {
  _id?: string;
  id?: string;
  orderNumber?: string;
  customerId?: string;
  restaurantId?: string;
  customer?: any;
  restaurant?: any;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: PaymentMethod;
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  total?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    additionalInfo?: string;
  };
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  preparationTime?: number;
  specialInstructions?: string;
  rating?: {
    ratedAt?: Date | string;
    score?: number;
    comment?: string;
  };
  statusHistory?: any[];
  timeline?: any[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
}

export interface OrderItem {
  _id?: string;
  id?: string;
  mealId?: string;
  productId?: string;
  name?: string;
  productName?: string;
  price?: number;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  specialInstructions?: string;
  selectedOptions?: SelectedOption[];
}

export interface SelectedOption {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  additionalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash_on_delivery' | 'wallet' | 'credit_card' | 'cash' | 'card';


