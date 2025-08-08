export interface Restaurant {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  cuisine?: string;
  rating?: number;
  reviewsCount?: number;
  totalReviews?: number;
  deliveryTime?: number;
  estimatedDeliveryTime?: number;
  minimumOrder?: number;
  deliveryFee?: number;
  image?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  isOpen?: boolean;
  isApproved?: boolean;
  status?: string;
  ownerId?: string;
  categories?: any[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

