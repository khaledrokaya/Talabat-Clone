import { Schema, model, Document } from 'mongoose';

export interface IMealCategory extends Document {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  mealCount: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  image: {
    type: String,
    default: null
  },
  sortOrder: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mealCount: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
MealCategorySchema.index({ slug: 1 });
MealCategorySchema.index({ isActive: 1, sortOrder: 1 });

export const MealCategory = model<IMealCategory>('MealCategory', MealCategorySchema);
