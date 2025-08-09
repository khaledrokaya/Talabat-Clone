import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  mealId: any;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  customerId: any;
  restaurantId: any;
  deliveryPersonId?: any;
  items: IOrderItem[];
  status:
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked-up'
  | 'on-the-way'
  | 'delivered'
  | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'digital-wallet';
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    additionalInfo?: string;
  };
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  preparationTime: number; // in minutes
  specialInstructions?: string;
  cancellationReason?: string;
  statusReason?: string;
  rating?: {
    food: number;
    delivery: number;
    overall: number;
    comment?: string;
    ratedAt: Date;
  };
  statusHistory: {
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy?: any;
  }[];
  timeline: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  mealId: {
    type: Schema.Types.ObjectId,
    ref: 'Meal',
    required: [true, 'Meal ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Meal price is required'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [200, 'Special instructions cannot exceed 200 characters'],
  },
});

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Restaurant ID is required'],
    },
    deliveryPersonId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    status: {
      type: String,
      required: [true, 'Order status is required'],
      enum: {
        values: [
          'pending',
          'confirmed',
          'preparing',
          'ready',
          'assigned',
          'picked-up',
          'on-the-way',
          'delivered',
          'cancelled',
        ],
        message: 'Please select a valid order status',
      },
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Please select a valid payment status',
      },
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'card', 'digital-wallet'],
        message: 'Please select a valid payment method',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax is required'],
      min: [0, 'Tax cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    deliveryAddress: {
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
          required: [true, 'Latitude is required'],
        },
        lng: {
          type: Number,
          required: [true, 'Longitude is required'],
        },
      },
      additionalInfo: {
        type: String,
        trim: true,
        maxlength: [200, 'Additional info cannot exceed 200 characters'],
      },
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        lowercase: true,
        trim: true,
      },
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    preparationTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [0, 'Preparation time cannot be negative'],
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Cancellation reason cannot exceed 300 characters'],
    },
    rating: {
      food: {
        type: Number,
        min: [1, 'Food rating must be at least 1'],
        max: [5, 'Food rating cannot exceed 5'],
      },
      delivery: {
        type: Number,
        min: [1, 'Delivery rating must be at least 1'],
        max: [5, 'Delivery rating cannot exceed 5'],
      },
      overall: {
        type: Number,
        min: [1, 'Overall rating must be at least 1'],
        max: [5, 'Overall rating cannot exceed 5'],
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Rating comment cannot exceed 500 characters'],
      },
      ratedAt: {
        type: Date,
        default: Date.now,
      },
    },
    statusReason: {
      type: String,
      trim: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        note: {
          type: String,
          trim: true,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        note: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// Indexes for better performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ deliveryPersonId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ estimatedDeliveryTime: 1 });

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function (
  status: string,
  note?: string,
) {
  this.timeline.push({
    status,
    timestamp: new Date(),
    note,
  });
  return this.save();
};

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus: string, note?: string) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note,
  });

  // Set estimated delivery time for confirmed orders
  if (newStatus === 'confirmed' && !this.estimatedDeliveryTime) {
    const estimatedTime = new Date();
    estimatedTime.setMinutes(
      estimatedTime.getMinutes() + this.preparationTime + 30,
    ); // preparation + delivery time
    this.estimatedDeliveryTime = estimatedTime;
  }

  // Set actual delivery time for delivered orders
  if (newStatus === 'delivered' && !this.actualDeliveryTime) {
    this.actualDeliveryTime = new Date();
  }

  return this.save();
};

// Method to calculate delivery time
orderSchema.methods.getDeliveryDuration = function (): number | null {
  if (this.actualDeliveryTime && this.createdAt) {
    return Math.round(
      (this.actualDeliveryTime.getTime() - this.createdAt.getTime()) /
      (1000 * 60),
    ); // in minutes
  }
  return null;
};

// Static method to find orders by customer
orderSchema.statics.findByCustomer = function (
  customerId: string,
  options: any = {},
) {
  const query: any = { customerId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('restaurantId', 'firstName lastName name phone')
    .populate('deliveryPersonId', 'firstName lastName phone')
    .sort({ createdAt: -1 });
};

// Static method to find orders by restaurant
orderSchema.statics.findByRestaurant = function (
  restaurantId: string,
  options: any = {},
) {
  const query: any = { restaurantId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('customerId', 'firstName lastName phone email')
    .populate('deliveryPersonId', 'firstName lastName phone')
    .sort({ createdAt: -1 });
};

// Static method to find orders by delivery person
orderSchema.statics.findByDeliveryPerson = function (
  deliveryPersonId: string,
  options: any = {},
) {
  const query: any = { deliveryPersonId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('customerId', 'firstName lastName phone')
    .populate('restaurantId', 'firstName lastName name phone address')
    .sort({ createdAt: -1 });
};

export default mongoose.model<IOrder>('Order', orderSchema);
