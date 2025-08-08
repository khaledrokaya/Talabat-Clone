import mongoose, { Document, Schema } from 'mongoose';

export interface IMeal extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  restaurantId: mongoose.Types.ObjectId;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number; // in minutes
  discount?: {
    percentage: number;
    validUntil: Date;
  };
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>(
  {
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
      maxlength: [100, 'Meal name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Meal description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Meal image is required'],
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
        },
        message: 'Please provide a valid image URL',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'appetizers',
          'main-course',
          'desserts',
          'beverages',
          'salads',
          'soups',
          'pizza',
          'pasta',
          'burgers',
          'sandwiches',
          'seafood',
          'vegetarian',
          'kids-menu',
        ],
        message: 'Please select a valid category',
      },
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Restaurant ID is required'],
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    allergens: [
      {
        type: String,
        enum: [
          'dairy',
          'eggs',
          'nuts',
          'gluten',
          'soy',
          'seafood',
          'shellfish',
          'sesame',
        ],
        trim: true,
      },
    ],
    nutritionalInfo: {
      calories: { type: Number, min: 0 },
      protein: { type: Number, min: 0 },
      carbs: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    preparationTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [1, 'Preparation time must be at least 1 minute'],
      max: [180, 'Preparation time cannot exceed 180 minutes'],
    },
    discount: {
      percentage: {
        type: Number,
        min: [0, 'Discount percentage cannot be negative'],
        max: [100, 'Discount percentage cannot exceed 100%'],
      },
      validUntil: {
        type: Date,
        validate: {
          validator: function (v: Date) {
            return v > new Date();
          },
          message: 'Discount expiry date must be in the future',
        },
      },
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative'],
      },
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
mealSchema.index({ restaurantId: 1 });
mealSchema.index({ category: 1 });
mealSchema.index({ isAvailable: 1 });
mealSchema.index({ price: 1 });
mealSchema.index({ 'ratings.average': -1 });
mealSchema.index({ name: 'text', description: 'text' });

// Virtual for discounted price
mealSchema.virtual('discountedPrice').get(function () {
  if (this.discount && this.discount.validUntil > new Date()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

// Virtual for effective price (considering discount)
mealSchema.virtual('effectivePrice').get(function () {
  if (this.discount && this.discount.validUntil > new Date()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

// Method to check if meal is on discount
mealSchema.methods.isOnDiscount = function (): boolean {
  return !!(this.discount && this.discount.validUntil > new Date());
};

// Static method to find meals by restaurant
mealSchema.statics.findByRestaurant = function (
  restaurantId: string,
  options: any = {},
) {
  const query = { restaurantId, isAvailable: true };

  if (options.category) {
    (query as any).category = options.category;
  }

  if (options.vegetarian) {
    (query as any).isVegetarian = true;
  }

  if (options.vegan) {
    (query as any).isVegan = true;
  }

  if (options.glutenFree) {
    (query as any).isGlutenFree = true;
  }

  return this.find(query)
    .populate('restaurantId', 'firstName lastName name')
    .sort(options.sortBy || '-createdAt');
};

// Static method to search meals
mealSchema.statics.searchMeals = function (
  searchTerm: string,
  filters: any = {},
) {
  const query: any = {
    $text: { $search: searchTerm },
    isAvailable: true,
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.maxPrice) {
    query.price = { $lte: filters.maxPrice };
  }

  if (filters.minRating) {
    query['ratings.average'] = { $gte: filters.minRating };
  }

  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('restaurantId', 'firstName lastName name');
};

export default mongoose.model<IMeal>('Meal', mealSchema);
