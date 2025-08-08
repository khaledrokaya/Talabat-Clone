import { Schema } from 'mongoose';
import { User, IBaseUser } from '../../shared/schemas/base-user.schema';

export interface IRestaurant extends IBaseUser {
  role: 'restaurant_owner';
  restaurantDetails: {
    name: string;
    description?: string;
    cuisineType: string[];
    averageDeliveryTime: number;
    minimumOrderAmount: number;
    deliveryFee: number;
    serviceRadius: number;
    openingHours: {
      [key: string]: {
        open: string;
        close: string;
        isOpen: boolean;
      };
    };
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
  businessInfo: {
    licenseNumber: string;
    taxId: string;
    bankAccountDetails?: {
      bankName: string;
      accountNumber: string;
      routingNumber: string;
    };
    commissionRate: number;
  };
  ratings: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: {
      [key: number]: number;
    };
  };
  menu?: string[];
  orderHistory?: string[];
  isOperational: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

const restaurantSchema = new Schema({
  restaurantDetails: {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Restaurant name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    cuisineType: [
      {
        type: String,
        required: true,
        enum: [
          'Italian',
          'Chinese',
          'Indian',
          'Mexican',
          'American',
          'Japanese',
          'Thai',
          'Mediterranean',
          'French',
          'Lebanese',
          'Fast Food',
          'Desserts',
          'Healthy',
          'Vegan',
          'Other',
        ],
      },
    ],
    averageDeliveryTime: {
      type: Number,
      required: [true, 'Average delivery time is required'],
      min: [10, 'Delivery time cannot be less than 10 minutes'],
      max: [120, 'Delivery time cannot exceed 120 minutes'],
    },
    minimumOrderAmount: {
      type: Number,
      required: [true, 'Minimum order amount is required'],
      min: [0, 'Minimum order amount cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative'],
    },
    serviceRadius: {
      type: Number,
      required: [true, 'Service radius is required'],
      min: [1, 'Service radius must be at least 1 km'],
      max: [50, 'Service radius cannot exceed 50 km'],
    },
    openingHours: {
      monday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
      tuesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
      wednesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
      thursday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
      friday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
      saturday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
      sunday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '22:00' },
        isOpen: { type: Boolean, default: true },
      },
    },
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      lng: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  businessInfo: {
    licenseNumber: {
      type: String,
      required: [true, 'Business license number is required'],
      unique: true,
      trim: true,
    },
    taxId: {
      type: String,
      required: [true, 'Tax ID is required'],
      unique: true,
      trim: true,
    },
    bankAccountDetails: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      routingNumber: { type: String, trim: true },
    },
    commissionRate: {
      type: Number,
      default: 0.15,
      min: [0, 'Commission rate cannot be negative'],
      max: [1, 'Commission rate cannot exceed 100%'],
    },
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative'],
    },
    ratingBreakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  menu: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Meal',
    },
  ],
  orderHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  isOperational: {
    type: Boolean,
    default: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
});

restaurantSchema.index({ 'restaurantDetails.cuisineType': 1 });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ 'ratings.averageRating': -1 });
restaurantSchema.index({ verificationStatus: 1, isOperational: 1 });

restaurantSchema.methods.updateRating = function (newRating: number) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  this.ratings.ratingBreakdown[newRating] =
    (this.ratings.ratingBreakdown[newRating] || 0) + 1;
  this.ratings.totalReviews += 1;

  let totalPoints = 0;
  for (let i = 1; i <= 5; i++) {
    totalPoints += i * (this.ratings.ratingBreakdown[i] || 0);
  }
  this.ratings.averageRating = totalPoints / this.ratings.totalReviews;

  return this.save();
};

restaurantSchema.methods.isOpenNow = function () {
  const now = new Date();
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const today = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);

  const todayHours = this.restaurantDetails.openingHours[today];
  if (!todayHours.isOpen) return false;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

restaurantSchema.methods.toggleOperationalStatus = function () {
  this.isOperational = !this.isOperational;
  return this.save();
};

restaurantSchema.statics.findNearby = function (
  lat: number,
  lng: number,
  maxDistance: number = 10000,
) {
  return this.find({
    role: 'restaurant_owner',
    isActive: true,
    isOperational: true,
    verificationStatus: 'verified',
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

restaurantSchema.statics.findByCuisine = function (cuisineTypes: string[]) {
  return this.find({
    role: 'restaurant_owner',
    isActive: true,
    isOperational: true,
    verificationStatus: 'verified',
    'restaurantDetails.cuisineType': { $in: cuisineTypes },
  });
};

restaurantSchema.statics.findTopRated = function (limit: number = 10) {
  return this.find({
    role: 'restaurant_owner',
    isActive: true,
    isOperational: true,
    verificationStatus: 'verified',
  })
    .sort({ 'ratings.averageRating': -1, 'ratings.totalReviews': -1 })
    .limit(limit);
};

export const Restaurant = User.discriminator<IRestaurant>(
  'restaurant_owner',
  restaurantSchema,
);
