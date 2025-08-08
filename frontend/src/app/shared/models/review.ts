export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  reply?: string;
  replyDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RestaurantResponse {
  message: string;
  date: Date;
}

