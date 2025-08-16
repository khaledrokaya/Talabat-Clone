import { body, param } from 'express-validator';

// Middleware to ensure JSON-only requests
export const validateJsonOnly = (req: any, res: any, next: any) => {
  const contentType = req.headers['content-type'];

  if (req.method !== 'GET' && req.method !== 'DELETE') {
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json',
        expectedContentType: 'application/json',
        receivedContentType: contentType || 'not specified'
      });
    }
  }

  next();
};

export const validateAddToCart = [
  validateJsonOnly,
  body('meal')
    .notEmpty()
    .withMessage('Valid meal is required'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('selectedOptions')
    .optional()
    .isArray()
    .withMessage('Selected options must be an array'),

  body('selectedOptions.*.choiceName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Choice name must be a non-empty string'),

  body('selectedOptions.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Option price must be a non-negative number'),

  body('specialInstructions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Special instructions cannot exceed 200 characters'),
];

export const validateUpdateCartItem = [
  validateJsonOnly,
  body('mealId')
    .isMongoId()
    .withMessage('Valid meal ID is required'),

  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('selectedOptions')
    .optional()
    .isArray()
    .withMessage('Selected options must be an array'),

  body('selectedOptions.*.choiceName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Choice name must be a non-empty string'),

  body('selectedOptions.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Option price must be a non-negative number'),
];

export const validateRemoveFromCart = [
  validateJsonOnly,
  body('mealId')
    .isMongoId()
    .withMessage('Valid meal ID is required'),

  body('selectedOptions')
    .optional()
    .isArray()
    .withMessage('Selected options must be an array'),

  body('selectedOptions.*.choiceName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Choice name must be a non-empty string'),

  body('selectedOptions.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Option price must be a non-negative number'),
];
