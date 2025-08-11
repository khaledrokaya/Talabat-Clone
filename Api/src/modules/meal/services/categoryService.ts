import { Request, Response } from 'express';

export interface MealCategory {
  _id: string;
  name: string;
  nameAr: string;
  count: number;
  color: string;
}

// Authentic Talabat Categories
const PREDEFINED_CATEGORIES: MealCategory[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Pizza',
    nameAr: 'البيتزا',
    count: 0,
    color: '#ff6b6b'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Burgers',
    nameAr: 'البرجر',
    count: 0,
    color: '#4ecdc4'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Fried Chicken',
    nameAr: 'دجاج مقلي',
    count: 0,
    color: '#45b7d1'
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Seafood',
    nameAr: 'أسماك ومأكولات البحرية',
    count: 0,
    color: '#96ceb4'
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Desserts',
    nameAr: 'الحلويات',
    count: 0,
    color: '#ffeaa7'
  },
  {
    _id: '507f1f77bcf86cd799439016',
    name: 'Grilled',
    nameAr: 'مشويات',
    count: 0,
    color: '#fd79a8'
  },
  {
    _id: '507f1f77bcf86cd799439017',
    name: 'Sandwiches',
    nameAr: 'ساندوتشات',
    count: 0,
    color: '#fdcb6e'
  },
  {
    _id: '507f1f77bcf86cd799439018',
    name: 'Shawarma',
    nameAr: 'شاورما',
    count: 0,
    color: '#6c5ce7'
  },
  {
    _id: '507f1f77bcf86cd799439019',
    name: 'Fast Food',
    nameAr: 'الوجبات السريعة',
    count: 0,
    color: '#a29bfe'
  },
  {
    _id: '507f1f77bcf86cd799439020',
    name: 'Pasta',
    nameAr: 'مكرونة',
    count: 0,
    color: '#e17055'
  },
  {
    _id: '507f1f77bcf86cd799439021',
    name: 'Breakfast',
    nameAr: 'الإفطار',
    count: 0,
    color: '#00b894'
  },
  {
    _id: '507f1f77bcf86cd799439022',
    name: 'Asian',
    nameAr: 'آسيوي',
    count: 0,
    color: '#74b9ff'
  },
  {
    _id: '507f1f77bcf86cd799439023',
    name: 'Street Food',
    nameAr: 'أكلات الشارع',
    count: 0,
    color: '#55a3ff'
  },
  {
    _id: '507f1f77bcf86cd799439024',
    name: 'Pastries',
    nameAr: 'الفطائـر',
    count: 0,
    color: '#ffa502'
  },
  {
    _id: '507f1f77bcf86cd799439025',
    name: 'Waffles',
    nameAr: 'الوافل',
    count: 0,
    color: '#ff7675'
  },
  {
    _id: '507f1f77bcf86cd799439026',
    name: 'American',
    nameAr: 'أمريكي',
    count: 0,
    color: '#fd79a8'
  },
  {
    _id: '507f1f77bcf86cd799439027',
    name: 'Ice Cream',
    nameAr: 'آيس كريم',
    count: 0,
    color: '#fdcb6e'
  },
  {
    _id: '507f1f77bcf86cd799439028',
    name: 'Italian',
    nameAr: 'إيطالي',
    count: 0,
    color: '#00b894'
  },
  {
    _id: '507f1f77bcf86cd799439029',
    name: 'Arabic Sweets',
    nameAr: 'حلويات عربية',
    count: 0,
    color: '#e84393'
  },
  {
    _id: '507f1f77bcf86cd799439030',
    name: 'Chicken',
    nameAr: 'دجاج',
    count: 0,
    color: '#fdcb6e'
  },
  {
    _id: '507f1f77bcf86cd799439031',
    name: 'Snacks',
    nameAr: 'سناكس',
    count: 0,
    color: '#a29bfe'
  },
  {
    _id: '507f1f77bcf86cd799439032',
    name: 'BBQ',
    nameAr: 'شواء',
    count: 0,
    color: '#fd79a8'
  },
  {
    _id: '507f1f77bcf86cd799439033',
    name: 'Chocolate',
    nameAr: 'شوكولاتة',
    count: 0,
    color: '#6c5ce7'
  },
  {
    _id: '507f1f77bcf86cd799439034',
    name: 'Chinese',
    nameAr: 'صيني',
    count: 0,
    color: '#ff7675'
  },
  {
    _id: '507f1f77bcf86cd799439035',
    name: 'Arabic',
    nameAr: 'عربي',
    count: 0,
    color: '#00b894'
  },
  {
    _id: '507f1f77bcf86cd799439036',
    name: 'Coffee',
    nameAr: 'قهوة',
    count: 0,
    color: '#795548'
  },
  {
    _id: '507f1f77bcf86cd799439037',
    name: 'Calzone',
    nameAr: 'كالزوني',
    count: 0,
    color: '#ff6b6b'
  },
  {
    _id: '507f1f77bcf86cd799439038',
    name: 'Kebab',
    nameAr: 'كباب',
    count: 0,
    color: '#fd79a8'
  },
  {
    _id: '507f1f77bcf86cd799439039',
    name: 'Crepe',
    nameAr: 'كريب',
    count: 0,
    color: '#fdcb6e'
  },
  {
    _id: '507f1f77bcf86cd799439040',
    name: 'Koshari',
    nameAr: 'كشري',
    count: 0,
    color: '#e17055'
  },
  {
    _id: '507f1f77bcf86cd799439041',
    name: 'Cake',
    nameAr: 'كيك',
    count: 0,
    color: '#ffeaa7'
  },
  {
    _id: '507f1f77bcf86cd799439042',
    name: 'Bakery',
    nameAr: 'مخبوزات',
    count: 0,
    color: '#fab1a0'
  },
  {
    _id: '507f1f77bcf86cd799439043',
    name: 'Beverages',
    nameAr: 'مشروبات',
    count: 0,
    color: '#74b9ff'
  },
  {
    _id: '507f1f77bcf86cd799439044',
    name: 'Egyptian',
    nameAr: 'مصري',
    count: 0,
    color: '#00b894'
  },
  {
    _id: '507f1f77bcf86cd799439045',
    name: 'Pastry',
    nameAr: 'معجنات',
    count: 0,
    color: '#fab1a0'
  },
  {
    _id: '507f1f77bcf86cd799439046',
    name: 'Nuts',
    nameAr: 'مكسرات',
    count: 0,
    color: '#e17055'
  },
  {
    _id: '507f1f77bcf86cd799439047',
    name: 'Manakish',
    nameAr: 'مناقيش',
    count: 0,
    color: '#fdcb6e'
  },
  {
    _id: '507f1f77bcf86cd799439048',
    name: 'Mandi',
    nameAr: 'مندي',
    count: 0,
    color: '#fd79a8'
  },
  {
    _id: '507f1f77bcf86cd799439049',
    name: 'Vegetarian',
    nameAr: 'نباتي',
    count: 0,
    color: '#00b894'
  },
  {
    _id: '507f1f77bcf86cd799439050',
    name: 'Noodles',
    nameAr: 'نودلز',
    count: 0,
    color: '#ff7675'
  }
];

export class CategoryService {
  /**
   * Get all categories with updated meal counts
   */
  static async getCategories(): Promise<MealCategory[]> {
    // TODO: When you add meal counting functionality, update the count for each category
    // For now, return static categories with count 0
    return PREDEFINED_CATEGORIES;
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string): Promise<MealCategory | null> {
    return PREDEFINED_CATEGORIES.find(cat => cat._id === categoryId) || null;
  }

  /**
   * Update meal count for a category (to be called when meals are added/removed)
   */
  static async updateCategoryCount(categoryId: string, increment: number = 1): Promise<void> {
    // TODO: Implement this when you have meal-category relationship in database
    // This would update the count in the database
    console.log(`Category ${categoryId} count would be updated by ${increment}`);
  }
}

// Controller functions
export const getCategoriesController = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getCategories();
    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCategoryByIdController = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const category = await CategoryService.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
