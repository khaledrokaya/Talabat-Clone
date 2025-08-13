import { body, query, param } from 'express-validator';

// Middleware to ensure JSON-only requests (no form-data)
export const validateJsonOnly = (req: any, res: any, next: any) => {
  const contentType = req.headers['content-type'];

  if (req.method !== 'GET' && req.method !== 'DELETE') {
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json. Form data and file uploads are not supported. Use data URLs for images.',
        expectedContentType: 'application/json',
        receivedContentType: contentType || 'not specified'
      });
    }
  }

  next();
};

export const validateCreateMeal = [
  validateJsonOnly,
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
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),

  body('preparationTime')
    .notEmpty()
    .withMessage('Preparation time is required')
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),

  body('ingredients')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Ingredients must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        for (let ingredient of value) {
          if (typeof ingredient !== 'string' || ingredient.trim().length === 0) {
            throw new Error('Each ingredient must be a non-empty string');
          }
        }
      }
      return true;
    }),

  body('ingredients.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ingredient cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each ingredient must be between 1 and 100 characters'),

  body('imageUrl')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true; // Optional field
      }

      if (typeof value !== 'string') {
        throw new Error('Image URL must be a string');
      }

      if (value.trim().length === 0) {
        throw new Error('Image URL cannot be empty if provided');
      }

      // Check if it's a data URL
      if (value.startsWith('data:image/')) {
        const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/=])+$/;
        if (!dataUrlPattern.test(value)) {
          throw new Error('Invalid data URL format. Expected: data:image/[jpeg|jpg|png|gif|webp];base64,[base64data]');
        }
        return true;
      }

      // Check if it's a regular URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Image URL must be a valid URL or data URL');
      }
    })
    .withMessage('Image URL must be a valid URL or data URL'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((value) => {
      if (value && value.length > 20) {
        throw new Error('Maximum 20 images allowed');
      }
      return true;
    }),

  body('images.*')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error('Each image must be a string (URL or data URL)');
      }

      if (value.trim().length === 0) {
        throw new Error('Image URL cannot be empty');
      }

      // Check if it's a data URL
      if (value.startsWith('data:image/')) {
        const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/=])+$/;
        if (!dataUrlPattern.test(value)) {
          throw new Error('Invalid data URL format. Expected: data:image/[jpeg|jpg|png|gif|webp];base64,[base64data]');
        }
        return true;
      }

      // Check if it's a regular URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Image must be a valid URL or data URL');
      }
    })
    .withMessage('Each image must be a valid URL or data URL'),

  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean (true or false)'),

  body('isVegan')
    .optional()
    .isBoolean()
    .withMessage('isVegan must be a boolean (true or false)'),

  body('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('isGlutenFree must be a boolean (true or false)'),

  body('spicyLevel')
    .optional()
    .isIn(['mild', 'medium', 'hot', 'very_hot'])
    .withMessage('Spicy level must be one of: mild, medium, hot, very_hot'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array')
    .custom((value) => {
      if (value && value.length > 8) {
        throw new Error('Maximum 8 allergens allowed');
      }
      return true;
    }),

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
    .withMessage('Invalid allergen. Must be one of: dairy, eggs, fish, shellfish, tree_nuts, peanuts, wheat, soy'),

  body('nutritionalInfo.calories')
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage('Calories must be a non-negative integer between 0 and 9999'),

  body('nutritionalInfo.protein')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Protein must be a non-negative number between 0 and 999 grams'),

  body('nutritionalInfo.carbs')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Carbs must be a non-negative number between 0 and 999 grams'),

  body('nutritionalInfo.fat')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Fat must be a non-negative number between 0 and 999 grams'),

  body('portionSize')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Portion size must be between 1 and 50 characters'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean (true or false)'),
];

export const validateUpdateMeal = [
  validateJsonOnly,
  param('mealId').isMongoId().withMessage('Invalid meal ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Meal name cannot be empty if provided')
    .isLength({ min: 2, max: 100 })
    .withMessage('Meal name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty if provided')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty if provided')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),

  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),

  body('ingredients')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Ingredients must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        for (let ingredient of value) {
          if (typeof ingredient !== 'string' || ingredient.trim().length === 0) {
            throw new Error('Each ingredient must be a non-empty string');
          }
        }
      }
      return true;
    }),

  body('ingredients.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ingredient cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each ingredient must be between 1 and 100 characters'),

  body('imageUrl')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true; // Optional field
      }

      if (typeof value !== 'string') {
        throw new Error('Image URL must be a string');
      }

      if (value.trim().length === 0) {
        throw new Error('Image URL cannot be empty if provided');
      }

      // Check if it's a data URL
      if (value.startsWith('data:image/')) {
        const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/=])+$/;
        if (!dataUrlPattern.test(value)) {
          throw new Error('Invalid data URL format. Expected: data:image/[jpeg|jpg|png|gif|webp];base64,[base64data]');
        }
        return true;
      }

      // Check if it's a regular URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Image URL must be a valid URL or data URL');
      }
    })
    .withMessage('Image URL must be a valid URL or data URL'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((value) => {
      if (value && value.length > 20) {
        throw new Error('Maximum 20 images allowed');
      }
      return true;
    }),

  body('images.*')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }

      if (typeof value !== 'string') {
        throw new Error('Each image must be a string (URL or data URL)');
      }

      if (value.trim().length === 0) {
        throw new Error('Image URL cannot be empty');
      }

      // Check if it's a data URL
      if (value.startsWith('data:image/')) {
        const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/=])+$/;
        if (!dataUrlPattern.test(value)) {
          throw new Error('Invalid data URL format. Expected: data:image/[jpeg|jpg|png|gif|webp];base64,[base64data]');
        }
        return true;
      }

      // Check if it's a regular URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Image must be a valid URL or data URL');
      }
    })
    .withMessage('Each image must be a valid URL or data URL'),

  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean (true or false)'),

  body('isVegan')
    .optional()
    .isBoolean()
    .withMessage('isVegan must be a boolean (true or false)'),

  body('isGlutenFree')
    .optional()
    .isBoolean()
    .withMessage('isGlutenFree must be a boolean (true or false)'),

  body('spicyLevel')
    .optional()
    .isIn(['mild', 'medium', 'hot', 'very_hot'])
    .withMessage('Spicy level must be one of: mild, medium, hot, very_hot'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array')
    .custom((value) => {
      if (value && value.length > 8) {
        throw new Error('Maximum 8 allergens allowed');
      }
      return true;
    }),

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
    .withMessage('Invalid allergen. Must be one of: dairy, eggs, fish, shellfish, tree_nuts, peanuts, wheat, soy'),

  body('nutritionalInfo.calories')
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage('Calories must be a non-negative integer between 0 and 9999'),

  body('nutritionalInfo.protein')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Protein must be a non-negative number between 0 and 999 grams'),

  body('nutritionalInfo.carbs')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Carbs must be a non-negative number between 0 and 999 grams'),

  body('nutritionalInfo.fat')
    .optional()
    .isFloat({ min: 0, max: 999 })
    .withMessage('Fat must be a non-negative number between 0 and 999 grams'),

  body('portionSize')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Portion size must be between 1 and 50 characters'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean (true or false)'),
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

export const validatePopularMeals = [
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

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
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
