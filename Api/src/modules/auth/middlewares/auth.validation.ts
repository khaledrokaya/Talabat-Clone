import { body } from 'express-validator';

export const registerCustomerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .trim(),

  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .trim(),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('address.street')
    .optional()
    .isString()
    .withMessage('Street must be a string'),
  body('address.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  body('address.state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  body('address.zipCode')
    .optional()
    .isString()
    .withMessage('Zip code must be a string'),
  body('address.coordinates.lat')
    .optional()
    .isFloat()
    .withMessage('Latitude must be a number'),
  body('address.coordinates.lng')
    .optional()
    .isFloat()
    .withMessage('Longitude must be a number'),
];

export const registerRestaurantValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .trim(),

  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .trim(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required for restaurants')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),

  // Restaurant specific validations
  body('restaurantDetails.name')
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ max: 100 })
    .withMessage('Restaurant name cannot exceed 100 characters'),

  body('restaurantDetails.description')
    .optional()
    .isString()
    .withMessage('Restaurant description must be a string'),

  body('restaurantDetails.cuisineType')
    .isArray({ min: 1 })
    .withMessage('At least one cuisine type is required'),

  body('restaurantDetails.averageDeliveryTime')
    .isInt({ min: 10, max: 120 })
    .withMessage('Average delivery time must be between 10 and 120 minutes'),

  body('restaurantDetails.minimumOrderAmount')
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),

  body('restaurantDetails.deliveryFee')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),

  body('restaurantDetails.serviceRadius')
    .isFloat({ min: 1 })
    .withMessage('Service radius must be at least 1 kilometer'),

  body('businessInfo.licenseNumber')
    .notEmpty()
    .withMessage('Business license number is required'),

  body('businessInfo.taxId').notEmpty().withMessage('Tax ID is required'),

  // Address validations (required for restaurants)
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('address.coordinates.lat')
    .optional()
    .isFloat()
    .withMessage('Latitude must be a number'),
  body('address.coordinates.lng')
    .optional()
    .isFloat()
    .withMessage('Longitude must be a number'),
];

export const registerDeliveryValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .trim(),

  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .trim(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required for delivery drivers')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),

  // Vehicle info validations
  body('vehicleInfo.type')
    .isIn(['bike', 'car', 'motorcycle', 'scooter'])
    .withMessage('Vehicle type must be one of: bike, car, motorcycle, scooter'),

  body('vehicleInfo.licensePlate')
    .optional()
    .isString()
    .withMessage('License plate must be a string'),

  body('vehicleInfo.color')
    .optional()
    .isString()
    .withMessage('Vehicle color must be a string'),

  body('vehicleInfo.model')
    .optional()
    .isString()
    .withMessage('Vehicle model must be a string'),

  // Delivery zones validation
  body('deliveryZones')
    .isArray({ min: 1 })
    .withMessage('At least one delivery zone is required'),

  // Documents validation
  body('documents.licenseNumber')
    .notEmpty()
    .withMessage('Driver license number is required'),

  body('documents.licenseImage')
    .optional()
    .isURL()
    .withMessage('License image must be a valid URL'),

  body('documents.vehicleRegistration')
    .optional()
    .isURL()
    .withMessage('Vehicle registration must be a valid URL'),

  body('documents.identityProof')
    .optional()
    .isURL()
    .withMessage('Identity proof must be a valid URL'),

  // Address validations (optional for delivery)
  body('address.street')
    .optional()
    .isString()
    .withMessage('Street must be a string'),
  body('address.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  body('address.state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  body('address.zipCode')
    .optional()
    .isString()
    .withMessage('Zip code must be a string'),
];

// Keep the old registerValidation for backward compatibility (can be removed later)
export const registerValidation = registerCustomerValidation;

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('type')
    .isIn(['registration', 'password-reset'])
    .withMessage('Type must be either registration or password-reset'),
];

export const resendOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('type')
    .isIn(['registration', 'password-reset'])
    .withMessage('Type must be either registration or password-reset'),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
];
