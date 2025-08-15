import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CartService } from '../services/cart.service';
import { AppError } from '../../shared/middlewares/error.middleware';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class CartController {
  private cartService = new CartService();

  /**
   * Get user's cart
   */
  getCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const customerId = req.user!.id;
      const cart = await this.cartService.getCart(customerId);

      res.json(
        Helpers.formatResponse(true, 'Cart retrieved successfully', cart),
      );
    },
  );

  /**
   * Add item to cart
   */
  addToCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const customerId = req.user!.id;
      const cart = await this.cartService.addToCart(customerId, req.body);

      res.status(201).json(
        Helpers.formatResponse(true, 'Item added to cart successfully', cart),
      );
    },
  );

  /**
   * Update item quantity in cart
   */
  updateCartItem = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const customerId = req.user!.id;
      const cart = await this.cartService.updateCartItem(customerId, req.body);

      res.json(
        Helpers.formatResponse(true, 'Cart item updated successfully', cart),
      );
    },
  );

  /**
   * Remove item from cart
   */
  removeFromCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const customerId = req.user!.id;
      const cart = await this.cartService.removeFromCart(customerId, req.body);

      res.json(
        Helpers.formatResponse(true, 'Item removed from cart successfully', cart),
      );
    },
  );

  /**
   * Clear cart
   */
  clearCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const customerId = req.user!.id;
      const cart = await this.cartService.clearCart(customerId);

      res.json(
        Helpers.formatResponse(true, 'Cart cleared successfully', cart),
      );
    },
  );

  /**
   * Create cart (called when user signs up)
   */
  createCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const customerId = req.user!.id;
      const cart = await this.cartService.createCart(customerId);

      res.status(201).json(
        Helpers.formatResponse(true, 'Cart created successfully', cart),
      );
    },
  );

  /**
   * Validate cart items
   */
  validateCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const customerId = req.user!.id;
      const validation = await this.cartService.validateCart(customerId);

      res.json(
        Helpers.formatResponse(true, 'Cart validation completed', validation),
      );
    },
  );

  /**
   * Sync cart with meal updates
   */
  syncCart = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const customerId = req.user!.id;
      const cart = await this.cartService.syncCart(customerId);

      res.json(
        Helpers.formatResponse(true, 'Cart synced successfully', cart),
      );
    },
  );
}
