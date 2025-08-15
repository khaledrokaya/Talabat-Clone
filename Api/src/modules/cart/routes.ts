import { Router } from 'express';
import { CartController } from './controllers/cart.controller';
import { authenticate, authorize } from '../shared/middlewares/auth.middleware';
import {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
} from './middlewares/cart.middleware';

const router = Router();
const cartController = new CartController();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the current user's cart with all items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: "Cart retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     restaurantId:
 *                       type: string
 *                     restaurantName:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mealId:
 *                             type: string
 *                           mealName:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                           totalPrice:
 *                             type: number
 *                           selectedOptions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 choiceName:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *                           specialInstructions:
 *                             type: string
 *                     totalAmount:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can access cart
 */
router.get('/', authenticate, authorize('customer'), cartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     description: Add a meal item to the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealId
 *             properties:
 *               mealId:
 *                 type: string
 *                 description: ID of the meal to add
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 default: 1
 *                 description: Quantity of the meal
 *               selectedOptions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     choiceName:
 *                       type: string
 *                     price:
 *                       type: number
 *               specialInstructions:
 *                 type: string
 *                 maxLength: 200
 *                 description: Special instructions for the meal
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Validation error or meal not available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can add to cart
 *       404:
 *         description: Meal not found
 */
router.post('/add', authenticate, authorize('customer'), validateAddToCart, cartController.addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of an item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealId
 *               - quantity
 *             properties:
 *               mealId:
 *                 type: string
 *                 description: ID of the meal to update
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: New quantity for the meal
 *               selectedOptions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     choiceName:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can update cart
 *       404:
 *         description: Cart or meal not found
 */
router.put('/update', authenticate, authorize('customer'), validateUpdateCartItem, cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/remove:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealId
 *             properties:
 *               mealId:
 *                 type: string
 *                 description: ID of the meal to remove
 *               selectedOptions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     choiceName:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can remove from cart
 *       404:
 *         description: Cart or item not found
 */
router.delete('/remove', authenticate, authorize('customer'), validateRemoveFromCart, cartController.removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can clear cart
 *       404:
 *         description: Cart not found
 */
router.delete('/clear', authenticate, authorize('customer'), cartController.clearCart);

/**
 * @swagger
 * /api/cart/create:
 *   post:
 *     summary: Create cart
 *     description: Create a new cart for the user (typically called during signup)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cart created successfully
 *       400:
 *         description: Only customers can have carts
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/create', authenticate, authorize('customer'), cartController.createCart);

/**
 * @swagger
 * /api/cart/validate:
 *   get:
 *     summary: Validate cart items
 *     description: Check if all cart items are still available
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     invalidItems:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can validate cart
 */
router.get('/validate', authenticate, authorize('customer'), cartController.validateCart);

/**
 * @swagger
 * /api/cart/sync:
 *   post:
 *     summary: Sync cart with meal updates
 *     description: Remove unavailable items and update cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart synced successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only customers can sync cart
 *       404:
 *         description: Cart not found
 */
router.post('/sync', authenticate, authorize('customer'), cartController.syncCart);

export default router;
