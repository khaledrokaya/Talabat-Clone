import Cart, { ICart, ICartItem } from '../schemas/cart.schema';
import { User } from '../../shared/schemas/base-user.schema';
import { AppError } from '../../shared/middlewares/error.middleware';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from '../dto/cart.dto';

export class CartService {
  /**
   * Get user's cart
   */
  async getCart(customerId: string): Promise<ICart> {
    const cart = await Cart.findOrCreateCart(customerId);
    await cart.populate('items.mealId', 'name price isAvailable');
    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(customerId: string, addToCartData: AddToCartDto): Promise<ICart> {
    const { meal, quantity = 1, selectedOptions, specialInstructions } = addToCartData;

    // Validate meal data
    if (!meal || !meal._id || !meal.name || meal.price === undefined || meal.isAvailable === undefined) {
      throw new AppError('Invalid meal data provided', 400);
    }

    if (!meal.isAvailable) {
      throw new AppError('Meal is not available', 400);
    }

    // Get or create cart
    const cart = await Cart.findOrCreateCart(customerId);

    // Extract restaurant info from meal
    const restaurantId = typeof meal.restaurantId === 'string' ? meal.restaurantId : meal.restaurantId._id;
    const restaurantName = typeof meal.restaurantId === 'string' ? 'Restaurant' : meal.restaurantId.name;
    console.log(meal)
    // Check if adding item from different restaurant
    if (cart.restaurantId && cart.restaurantId.toString() !== restaurantId) {
      // Clear cart if different restaurant
      cart.clearCart();
    }

    // Calculate item price including options
    let itemPrice = meal.price;
    if (selectedOptions && selectedOptions.length > 0) {
      const optionsPrice = selectedOptions.reduce((total, option) => total + option.price, 0);
      itemPrice += optionsPrice;
    }

    // Prepare cart item
    const cartItemData: Partial<ICartItem> = {
      mealId: meal._id,
      mealName: meal.name,
      price: itemPrice,
      quantity,
      totalPrice: itemPrice * quantity,
      selectedOptions,
      specialInstructions,
    };

    // Set restaurant info if not set
    if (!cart.restaurantId) {
      cart.restaurantId = restaurantId;
      cart.restaurantName = restaurantName;
    }

    // Add item to cart
    cart.addItem(cartItemData);
    await cart.save();

    // Populate and return
    await cart.populate('items.mealId', 'name price isAvailable');
    return cart;
  }

  /**
   * Update item quantity in cart
   */
  async updateCartItem(customerId: string, updateData: UpdateCartItemDto): Promise<ICart> {
    const { mealId, quantity, selectedOptions } = updateData;

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    // Verify meal exists
    const meal = cart.items.find((e) => e.mealId._id.toString() === mealId);

    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    // Update item quantity
    meal.quantity = quantity;
    await cart.save();

    // Populate and return
    await cart.populate('items.mealId', 'name price isAvailable');
    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(customerId: string, removeData: RemoveFromCartDto): Promise<ICart> {
    const { mealId, selectedOptions } = removeData;

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    // Remove item from cart
    cart.items = cart.items.filter((item) => item.mealId._id.toString() !== mealId);
    await cart.save();

    // Populate and return
    await cart.populate('items.mealId', 'name price isAvailable');
    return cart;
  }

  /**
   * Clear cart
   */
  async clearCart(customerId: string): Promise<ICart> {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.clearCart();
    await cart.save();

    return cart;
  }

  /**
   * Create cart for user (called when user signs up)
   */
  async createCart(customerId: string): Promise<ICart> {
    // Check if user exists
    const user = await User.findById(customerId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'customer') {
      throw new AppError('Only customers can have carts', 400);
    }

    // Check if cart already exists
    const existingCart = await Cart.findOne({ customerId });
    if (existingCart) {
      return existingCart;
    }

    // Create new cart
    const cart = await Cart.create({
      customerId,
      items: [],
      totalAmount: 0,
    });

    return cart;
  }

  /**
   * Validate cart items (check if meals are still available)
   */
  async validateCart(customerId: string): Promise<{ isValid: boolean; invalidItems: string[] }> {
    const cart = await Cart.findOne({ customerId }).populate('items.mealId');
    if (!cart) {
      return { isValid: true, invalidItems: [] };
    }

    const invalidItems: string[] = [];

    for (const item of cart.items) {
      const meal = item.mealId as any;
      if (!meal || !meal.isAvailable) {
        invalidItems.push(item.mealName);
      }
    }

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
    };
  }

  /**
   * Sync cart with meal updates (remove unavailable items)
   */
  async syncCart(customerId: string): Promise<ICart> {
    const cart = await Cart.findOne({ customerId }).populate('items.mealId');
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    let cartModified = false;

    // Remove items that are no longer available
    cart.items = cart.items.filter((item) => {
      const meal = item.mealId as any;
      if (!meal || !meal.isAvailable) {
        cartModified = true;
        return false;
      }
      return true;
    });

    // Clear restaurant info if no items left
    if (cart.items.length === 0) {
      cart.restaurantId = undefined;
      cart.restaurantName = undefined;
      cartModified = true;
    }

    if (cartModified) {
      cart.calculateTotal();
      await cart.save();
    }

    // Populate and return
    await cart.populate('items.mealId', 'name price isAvailable');
    return cart;
  }
}
