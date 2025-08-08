import { Address } from './address';

export interface User {
  id: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: 'customer' | 'restaurant_owner' | 'delivery' | 'admin';
  phone: string;
  addresses: Address[];
  favoriteRestaurants: string[];
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}