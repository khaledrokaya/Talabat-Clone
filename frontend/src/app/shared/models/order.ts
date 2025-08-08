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
  totalAmount?: number;
  total?: number;
  subtotal?: number;
  deliveryFee?: number;
  deliveryAddress?: Address;
  paymentMethod?: PaymentMethod;
  createdAt?: Date | string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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


