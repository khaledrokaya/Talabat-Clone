import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  mealId: any;
  mealName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: {
    choiceName: string;
    price: number;
  }[];
  specialInstructions?: string;
}

export interface ICart extends Document {
  _id: string;
  customerId: any;
  restaurantId?: any;
  restaurantName?: string;
  items: ICartItem[];
  totalAmount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema({
  mealId: {
    type: Schema.Types.ObjectId,
    ref: 'Meal',
    required: [true, 'Meal ID is required'],
  },
  mealName: {
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
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  selectedOptions: [{
    choiceName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Option price cannot be negative'],
    },
  }],
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [200, 'Special instructions cannot exceed 200 characters'],
  },
});

const cartSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      unique: true, // Each customer can have only one cart
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
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
cartSchema.index({ customerId: 1 });
cartSchema.index({ restaurantId: 1 });
cartSchema.index({ lastUpdated: 1 });

// Method to calculate total amount
cartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.items.reduce((total: number, item: ICartItem) => {
    return total + item.totalPrice;
  }, 0);
  this.lastUpdated = new Date();
  return this;
};

// Method to add item to cart
cartSchema.methods.addItem = function (itemData: Partial<ICartItem>) {
  const existingItemIndex = this.items.findIndex((item: ICartItem) => {
    return item.mealId.toString() === itemData.mealId?.toString() &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(itemData.selectedOptions);
  });

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += itemData.quantity || 1;
    this.items[existingItemIndex].totalPrice =
      this.items[existingItemIndex].quantity * this.items[existingItemIndex].price;
  } else {
    // Add new item
    this.items.push(itemData);
  }

  return this.calculateTotal();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (mealId: string, quantity: number, selectedOptions?: any[]) {
  const itemIndex = this.items.findIndex((item: ICartItem) => {
    return item.mealId.toString() === mealId &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions);
  });

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
      this.items[itemIndex].totalPrice =
        this.items[itemIndex].quantity * this.items[itemIndex].price;
    }

    // Clear restaurant info if no items left
    if (this.items.length === 0) {
      this.restaurantId = undefined;
      this.restaurantName = undefined;
    }

    return this.calculateTotal();
  }

  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (mealId: string, selectedOptions?: any[]) {
  const initialLength = this.items.length;
  this.items = this.items.filter((item: ICartItem) => {
    return !(item.mealId.toString() === mealId &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions));
  });

  if (this.items.length === initialLength) {
    throw new Error('Item not found in cart');
  }

  // Clear restaurant info if no items left
  if (this.items.length === 0) {
    this.restaurantId = undefined;
    this.restaurantName = undefined;
  }

  return this.calculateTotal();
};

// Method to clear all items
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.totalAmount = 0;
  this.restaurantId = undefined;
  this.restaurantName = undefined;
  this.lastUpdated = new Date();
  return this;
};

// Static method to find or create cart for customer
cartSchema.statics.findOrCreateCart = async function (customerId: string) {
  let cart = await this.findOne({ customerId }).populate('items.mealId', 'name price isAvailable');

  if (!cart) {
    cart = await this.create({
      customerId,
      items: [],
      totalAmount: 0,
    });
  }

  return cart;
};

// Middleware to update lastUpdated before save
cartSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<ICart>('Cart', cartSchema);
