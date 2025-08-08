export interface RegisterCustomerDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface RegisterRestaurantDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  restaurantDetails: {
    name: string;
    description?: string;
    cuisineType: string[];
    averageDeliveryTime: number;
    minimumOrderAmount: number;
    deliveryFee: number;
    serviceRadius: number;
  };
  businessInfo: {
    licenseNumber: string;
    taxId: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface RegisterDeliveryDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleInfo: {
    type: 'bike' | 'car' | 'motorcycle' | 'scooter';
    licensePlate?: string;
    color?: string;
    model?: string;
  };
  deliveryZones: string[];
  documents: {
    licenseNumber: string;
    licenseImage?: string;
    vehicleRegistration?: string;
    identityProof?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

// Union type for registration that includes role and type-specific properties
export type RegisterUserDTO =
  | (RegisterCustomerDTO & { role: 'customer' })
  | (RegisterRestaurantDTO & { role: 'restaurant_owner' })
  | (RegisterDeliveryDTO & { role: 'delivery' });

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface VerifyOTPDTO {
  email: string;
  otp: string;
  type: 'registration' | 'password-reset';
}

export interface ResendOTPDTO {
  email: string;
  type: 'registration' | 'password-reset';
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
