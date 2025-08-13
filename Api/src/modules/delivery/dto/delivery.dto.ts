export interface UpdateLocationDTO {
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

export interface UpdateAvailabilityDTO {
  isOnline: boolean;
  isAcceptingOrders?: boolean;
}

export interface AcceptOrderDTO {
  orderId: string;
  estimatedDeliveryTime: number; // in minutes
}

export interface UpdateOrderStatusDTO {
  status: 'picked_up' | 'on_the_way' | 'delivered';
  notes?: string;
  deliveryProof?: {
    photo?: string;
    signature?: string;
    recipientName?: string;
  };
}

export interface SearchOrdersDTO {
  status?: 'pending' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AvailableOrdersDTO {
  page?: number;
  limit?: number;
  maxDistance?: number; // in kilometers;
}

export interface DeliveryEarningsDTO {
  dateFrom?: string;
  dateTo?: string;
  period?: 'day' | 'week' | 'month' | 'year' | 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export interface UpdateVehicleInfoDTO {
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  licensePlate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
}

export interface UpdateAvailableAreasDTO {
  areas: string[]; // array of area/zone IDs or names
  maxDeliveryDistance?: number; // in kilometers
}

export interface DeliveryPreferencesDTO {
  maxOrdersPerHour?: number;
  preferredDeliveryTime?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  breakTime?: {
    start: string;
    end: string;
  };
  workingDays?: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  )[];
}

export interface RateCustomerDTO {
  customerId: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface DeliveryHistoryFiltersDTO {
  startDate?: string;
  endDate?: string;
  minRating?: number;
  maxRating?: number;
  minEarnings?: number;
  maxEarnings?: number;
  page?: number;
  limit?: number;
}

export interface DeliveryStatsDTO {
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}
