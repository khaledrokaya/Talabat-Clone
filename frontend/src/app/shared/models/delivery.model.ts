export interface DeliveryLocation {
  coordinates: [number, number]; // [longitude, latitude]
}

export interface DeliveryAvailability {
  isOnline: boolean;
}

export interface DeliveryOrderStatus {
  status: 'picked_up' | 'on_the_way' | 'delivered';
}

export interface DeliveryOrder {
  _id: string;
  orderNumber?: string;
  customer: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  restaurant?: {
    name: string;
    address?: string;
    phone?: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
  createdAt?: string;
  distance?: number; // Distance in kilometers from delivery person's location
  items: OrderItem[];
}

export interface OrderItem {
  mealId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryEarnings {
  totalEarnings: number;
  deliveryCount: number;
  breakdown: {
    date: string;
    earnings: number;
    deliveries?: number;
  }[];
}

export interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  averageRating: number;
  totalEarnings: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
}

export interface OrderFilters {
  status?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationResponse<T> {
  orders: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
