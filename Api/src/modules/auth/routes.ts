import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { authenticate } from '../shared/middlewares/auth.middleware';
import { validateRequest } from '../shared/middlewares/validation.middleware';
import {
  registerCustomerValidation,
  registerRestaurantValidation,
  registerDeliveryValidation,
  loginValidation,
  verifyOTPValidation,
  resendOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from './middlewares/auth.validation';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/register/customer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Customer's password (min 6 characters, must contain uppercase, lowercase, and number)
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Customer's first name
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Customer's last name
 *               phone:
 *                 type: string
 *                 description: Optional phone number
 *               address:
 *                 type: object
 *                 description: Optional delivery address
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *             example:
 *               email: "john.customer@example.com"
 *               password: "SecurePass123"
 *               firstName: "John"
 *               lastName: "Customer"
 *               phone: "+1234567890"
 *               address:
 *                 street: "123 Main St"
 *                 city: "New York"
 *                 state: "NY"
 *                 zipCode: "10001"
 *     responses:
 *       201:
 *         description: Customer registered successfully, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Customer registered successfully. Please verify your email with the OTP sent."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "customer"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       409:
 *         description: Customer already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User with this email already exists"
 */
router.post(
  '/register/customer',
  registerCustomerValidation,
  validateRequest,
  authController.registerCustomer,
);

/**
 * @swagger
 * /api/auth/register/restaurant:
 *   post:
 *     summary: Register a new restaurant
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - restaurantDetails
 *               - businessInfo
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Restaurant owner's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (min 6 characters, must contain uppercase, lowercase, and number)
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Restaurant owner's first name
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Restaurant owner's last name
 *               phone:
 *                 type: string
 *                 description: Restaurant contact phone number
 *               restaurantDetails:
 *                 type: object
 *                 required:
 *                   - name
 *                   - cuisineType
 *                   - averageDeliveryTime
 *                   - minimumOrderAmount
 *                   - deliveryFee
 *                   - serviceRadius
 *                 properties:
 *                   name:
 *                     type: string
 *                     maxLength: 100
 *                     description: Restaurant name
 *                   description:
 *                     type: string
 *                     description: Restaurant description
 *                   cuisineType:
 *                     type: array
 *                     items:
 *                       type: string
 *                     minItems: 1
 *                     description: Types of cuisine offered
 *                   averageDeliveryTime:
 *                     type: number
 *                     minimum: 10
 *                     maximum: 120
 *                     description: Average delivery time in minutes
 *                   minimumOrderAmount:
 *                     type: number
 *                     minimum: 0
 *                     description: Minimum order amount
 *                   deliveryFee:
 *                     type: number
 *                     minimum: 0
 *                     description: Delivery fee
 *                   serviceRadius:
 *                     type: number
 *                     minimum: 1
 *                     description: Service radius in kilometers
 *               businessInfo:
 *                 type: object
 *                 required:
 *                   - licenseNumber
 *                   - taxId
 *                 properties:
 *                   licenseNumber:
 *                     type: string
 *                     description: Business license number
 *                   taxId:
 *                     type: string
 *                     description: Tax identification number
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *             example:
 *               email: "owner@pizzaplace.com"
 *               password: "SecurePass123"
 *               firstName: "Mario"
 *               lastName: "Rossi"
 *               phone: "+1234567890"
 *               restaurantDetails:
 *                 name: "Mario's Pizza Place"
 *                 description: "Authentic Italian pizza and pasta"
 *                 cuisineType: ["Italian", "Pizza"]
 *                 averageDeliveryTime: 30
 *                 minimumOrderAmount: 15
 *                 deliveryFee: 3.99
 *                 serviceRadius: 10
 *               businessInfo:
 *                 licenseNumber: "BL123456789"
 *                 taxId: "TAX987654321"
 *               address:
 *                 street: "456 Restaurant Ave"
 *                 city: "New York"
 *                 state: "NY"
 *                 zipCode: "10002"
 *     responses:
 *       201:
 *         description: Restaurant registered successfully, pending admin approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Restaurant registered successfully. Your application is pending admin approval."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "restaurant"
 *                     verificationStatus:
 *                       type: string
 *                       example: "pending"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       409:
 *         description: Restaurant already exists
 */
router.post(
  '/register/restaurant',
  registerRestaurantValidation,
  validateRequest,
  authController.registerRestaurant,
);

/**
 * @swagger
 * /api/auth/register/delivery:
 *   post:
 *     summary: Register a new delivery driver
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phone
 *               - vehicleInfo
 *               - deliveryZones
 *               - documents
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Delivery driver's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (min 6 characters, must contain uppercase, lowercase, and number)
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Driver's first name
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Driver's last name
 *               phone:
 *                 type: string
 *                 description: Driver's contact phone number
 *               vehicleInfo:
 *                 type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [bike, car, motorcycle, scooter]
 *                     description: Type of delivery vehicle
 *                   licensePlate:
 *                     type: string
 *                     description: Vehicle license plate number
 *                   color:
 *                     type: string
 *                     description: Vehicle color
 *                   model:
 *                     type: string
 *                     description: Vehicle model
 *               deliveryZones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Areas where driver can deliver
 *               documents:
 *                 type: object
 *                 required:
 *                   - licenseNumber
 *                 properties:
 *                   licenseNumber:
 *                     type: string
 *                     description: Driver's license number
 *                   licenseImage:
 *                     type: string
 *                     description: Driver's license image URL
 *                   vehicleRegistration:
 *                     type: string
 *                     description: Vehicle registration document URL
 *                   identityProof:
 *                     type: string
 *                     description: Identity proof document URL
 *               address:
 *                 type: object
 *                 description: Driver's address
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *             example:
 *               email: "driver@delivery.com"
 *               password: "SecurePass123"
 *               firstName: "Ahmed"
 *               lastName: "Hassan"
 *               phone: "+1234567890"
 *               vehicleInfo:
 *                 type: "motorcycle"
 *                 licensePlate: "ABC123"
 *                 color: "Red"
 *                 model: "Honda CB"
 *               deliveryZones: ["Downtown", "Midtown", "Brooklyn"]
 *               documents:
 *                 licenseNumber: "DL123456789"
 *                 licenseImage: "https://example.com/license.jpg"
 *                 vehicleRegistration: "https://example.com/registration.pdf"
 *                 identityProof: "https://example.com/id.jpg"
 *               address:
 *                 street: "789 Driver St"
 *                 city: "New York"
 *                 state: "NY"
 *                 zipCode: "10003"
 *     responses:
 *       201:
 *         description: Delivery driver registered successfully, pending admin approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Delivery driver registered successfully. Your application is pending admin approval."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "delivery"
 *                     verificationStatus:
 *                       type: string
 *                       example: "pending"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       409:
 *         description: Delivery driver already exists
 */
router.post(
  '/register/delivery',
  registerDeliveryValidation,
  validateRequest,
  authController.registerDelivery,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *             example:
 *               email: "john.doe@example.com"
 *               password: "SecurePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [customer, restaurant, delivery]
 *                         isEmailVerified:
 *                           type: boolean
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *                           description: "Access token expiration time in seconds"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email is required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *       403:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please verify your email before logging in"
 */
router.post('/login', loginValidation, validateRequest, authController.login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for registration or password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - type
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 length: 6
 *               type:
 *                 type: string
 *                 enum: [registration, password-reset]
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  '/verify-otp',
  verifyOTPValidation,
  validateRequest,
  authController.verifyOTP,
);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - type
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               type:
 *                 type: string
 *                 enum: [registration, password-reset]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post(
  '/resend-otp',
  resendOTPValidation,
  validateRequest,
  authController.resendOTP,
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *       404:
 *         description: User not found
 */
router.post(
  '/forgot-password',
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword,
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 length: 6
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  '/reset-password',
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword,
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password (requires authentication)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/change-password',
  authenticate,
  changePasswordValidation,
  validateRequest,
  authController.changePassword,
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Check authentication status
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Unauthorized
 */
router.get('/check', authenticate, authController.checkAuth);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/debug-cookies:
 *   get:
 *     summary: Debug cookie information (development only)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Cookie debug information
 */
router.get('/debug-cookies', authController.debugCookies);

export default router;
