import { Document, Schema } from 'mongoose';
import { User, IBaseUser } from '../../shared/schemas/base-user.schema';

export interface IDelivery extends IBaseUser {
  role: 'delivery';
  vehicleInfo: {
    type: 'bike' | 'car' | 'motorcycle' | 'scooter';
    licensePlate?: string;
    color?: string;
    model?: string;
  };
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  deliveryZones: string[];
  ratings: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: {
      [key: number]: number;
    };
  };
  earnings: {
    totalEarnings: number;
    todayEarnings: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
  };
  deliveryHistory: string[];
  currentOrder?: string;
  isOnline: boolean;
  isAvailable: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    licenseNumber?: string;
    licenseImage?: string;
    vehicleRegistration?: string;
    identityProof?: string;
  };
}

const deliverySchema = new Schema({
  vehicleInfo: {
    type: {
      type: String,
      enum: ['bike', 'car', 'motorcycle', 'scooter'],
      required: [true, 'Vehicle type is required'],
    },
    licensePlate: {
      type: String,
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
  },
  workingHours: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true },
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true },
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true },
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true },
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true },
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: true },
    },
    sunday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      isWorking: { type: Boolean, default: false },
    },
  },
  currentLocation: {
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
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  deliveryZones: [
    {
      type: String,
      required: true,
      trim: true,
    },
  ],
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
  earnings: {
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Earnings cannot be negative'],
    },
    todayEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Earnings cannot be negative'],
    },
    weeklyEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Earnings cannot be negative'],
    },
    monthlyEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Earnings cannot be negative'],
    },
  },
  deliveryHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  currentOrder: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  documents: {
    licenseNumber: {
      type: String,
      trim: true,
    },
    licenseImage: {
      type: String,
      trim: true,
    },
    vehicleRegistration: {
      type: String,
      trim: true,
    },
    identityProof: {
      type: String,
      trim: true,
    },
  },
});

deliverySchema.index({ isOnline: 1, isAvailable: 1 });
deliverySchema.index({ deliveryZones: 1 });
deliverySchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });
deliverySchema.index({ 'ratings.averageRating': -1 });
deliverySchema.index({ verificationStatus: 1 });

deliverySchema.methods.updateLocation = function (lat: number, lng: number) {
  this.currentLocation = {
    lat,
    lng,
    lastUpdated: new Date(),
  };
  return this.save();
};

deliverySchema.methods.goOnline = function () {
  if (this.verificationStatus !== 'verified') {
    throw new Error('Cannot go online: Driver not verified');
  }
  this.isOnline = true;
  return this.save();
};

deliverySchema.methods.goOffline = function () {
  this.isOnline = false;
  this.isAvailable = false;
  return this.save();
};

deliverySchema.methods.assignOrder = function (orderId: string) {
  if (!this.isAvailable) {
    throw new Error('Driver is not available');
  }
  this.currentOrder = orderId;
  this.isAvailable = false;
  return this.save();
};

deliverySchema.methods.completeOrder = function (earnings: number = 0) {
  this.currentOrder = undefined;
  this.isAvailable = true;

  this.earnings.totalEarnings += earnings;
  this.earnings.todayEarnings += earnings;
  this.earnings.weeklyEarnings += earnings;
  this.earnings.monthlyEarnings += earnings;

  return this.save();
};

deliverySchema.methods.updateRating = function (newRating: number) {
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

deliverySchema.methods.isWorkingNow = function () {
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

  const todayHours = this.workingHours[today];
  if (!todayHours.isWorking) return false;

  return currentTime >= todayHours.start && currentTime <= todayHours.end;
};

deliverySchema.statics.findAvailableInZone = function (zone: string) {
  return this.find({
    role: 'delivery',
    isActive: true,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    deliveryZones: zone,
  });
};

deliverySchema.statics.findNearby = function (
  lat: number,
  lng: number,
  maxDistance: number = 5000,
) {
  return this.find({
    role: 'delivery',
    isActive: true,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    currentLocation: {
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

deliverySchema.statics.findTopRated = function (limit: number = 10) {
  return this.find({
    role: 'delivery',
    isActive: true,
    verificationStatus: 'verified',
  })
    .sort({ 'ratings.averageRating': -1, 'ratings.totalReviews': -1 })
    .limit(limit);
};

deliverySchema.statics.findByEarnings = function (minEarnings: number) {
  return this.find({
    role: 'delivery',
    isActive: true,
    verificationStatus: 'verified',
    'earnings.totalEarnings': { $gte: minEarnings },
  });
};

export const Delivery = User.discriminator<IDelivery>(
  'delivery',
  deliverySchema,
);
