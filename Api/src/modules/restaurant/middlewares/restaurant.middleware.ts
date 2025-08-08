import { body, query, param } from 'express-validator';

export const validateCreateMeal = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Meal name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Meal name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'appetizer',
      'main_course',
      'dessert',
      'beverage',
      'salad',
      'soup',
      'sandwich',
      'pizza',
      'pasta',
      'seafood',
      'meat',
      'vegetarian',
      'vegan',
    ])
    .withMessage('Invalid category'),

  body('prepTime')
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),

  body('ingredients.*')
    .trim()
    .notEmpty()
    .withMessage('Ingredient cannot be empty'),

  body('images').optional().isArray().withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean'),

  body('isVegan')
    .optional()
    .isBoolean()
    .withMessage('isVegan must be a boolean'),

  body('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('isGlutenFree must be a boolean'),

  body('spicyLevel')
    .optional()
    .isIn(['mild', 'medium', 'hot', 'very_hot'])
    .withMessage('Invalid spicy level'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('allergens.*')
    .optional()
    .isIn([
      'dairy',
      'eggs',
      'fish',
      'shellfish',
      'tree_nuts',
      'peanuts',
      'wheat',
      'soy',
    ])
    .withMessage('Invalid allergen'),

  body('nutritionalInfo.calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories must be a non-negative integer'),

  body('nutritionalInfo.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a non-negative number'),

  body('nutritionalInfo.carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a non-negative number'),

  body('nutritionalInfo.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be a non-negative number'),

  body('portionSize')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Portion size must be between 1 and 50 characters'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
];

export const validateUpdateMeal = [
  param('mealId').isMongoId().withMessage('Invalid meal ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Meal name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),

  body('category')
    .optional()
    .trim()
    .isIn([
      'appetizer',
      'main_course',
      'dessert',
      'beverage',
      'salad',
      'soup',
      'sandwich',
      'pizza',
      'pasta',
      'seafood',
      'meat',
      'vegetarian',
      'vegan',
    ])
    .withMessage('Invalid category'),

  body('prepTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),

  body('ingredients')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),

  body('ingredients.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ingredient cannot be empty'),

  body('images').optional().isArray().withMessage('Images must be an array'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean'),

  body('isVegan')
    .optional()
    .isBoolean()
    .withMessage('isVegan must be a boolean'),

  body('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('isGlutenFree must be a boolean'),

  body('spicyLevel')
    .optional()
    .isIn(['mild', 'medium', 'hot', 'very_hot'])
    .withMessage('Invalid spicy level'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('allergens.*')
    .optional()
    .isIn([
      'dairy',
      'eggs',
      'fish',
      'shellfish',
      'tree_nuts',
      'peanuts',
      'wheat',
      'soy',
    ])
    .withMessage('Invalid allergen'),

  body('nutritionalInfo.calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories must be a non-negative integer'),

  body('nutritionalInfo.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a non-negative number'),

  body('nutritionalInfo.carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a non-negative number'),

  body('nutritionalInfo.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be a non-negative number'),

  body('portionSize')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Portion size must be between 1 and 50 characters'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
];

export const validateSearchMeals = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),

  query('category')
    .optional()
    .isIn([
      'appetizer',
      'main_course',
      'dessert',
      'beverage',
      'salad',
      'soup',
      'sandwich',
      'pizza',
      'pasta',
      'seafood',
      'meat',
      'vegetarian',
      'vegan',
    ])
    .withMessage('Invalid category'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a non-negative number'),

  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Min rating must be between 0 and 5'),

  query('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean'),

  query('isVegan')
    .optional()
    .isBoolean()
    .withMessage('isVegan must be a boolean'),

  query('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('isGlutenFree must be a boolean'),

  query('restaurantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid restaurant ID'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateMealDiscount = [
  param('mealId').isMongoId().withMessage('Invalid meal ID'),

  body('percentage')
    .isFloat({ min: 1, max: 99 })
    .withMessage('Discount percentage must be between 1 and 99'),

  body('validUntil')
    .isISO8601()
    .withMessage('Valid until must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Valid until date must be in the future');
      }
      return true;
    }),
];

export const validateMealId = [
  param('mealId').isMongoId().withMessage('Invalid meal ID'),
];

export const validateCategory = [
  param('category')
    .isIn([
      'appetizer',
      'main_course',
      'dessert',
      'beverage',
      'salad',
      'soup',
      'sandwich',
      'pizza',
      'pasta',
      'seafood',
      'meat',
      'vegetarian',
      'vegan',
    ])
    .withMessage('Invalid category'),
];

export const validateAnalyticsQuery = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),

  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query?.from && value) {
        const fromDate = new Date(req.query.from as string);
        const toDate = new Date(value);
        if (toDate <= fromDate) {
          throw new Error('To date must be after from date');
        }
      }
      return true;
    }),
];
