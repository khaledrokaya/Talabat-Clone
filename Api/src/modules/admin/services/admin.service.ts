import { User } from '../../shared/schemas/base-user.schema';
import { Restaurant } from '../../restaurant/schemas/restaurant.schema';
import { Delivery } from '../../delivery/schemas/delivery.schema';
import { Customer } from '../../customer/schemas/customer.schema';
import Order from '../../order/schemas/order.schema';
import { AppError } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import {
  ApproveUserDTO,
  UpdateUserStatusDTO,
  GetUsersFilterDTO,
  AdminDashboardStatsDTO,
} from '../dto/admin.dto';
import {
  IAdminDashboardStats,
  IUserManagement,
} from '../interfaces/admin.interface';

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(
    filters: AdminDashboardStatsDTO = {},
  ): Promise<IAdminDashboardStats> {
    const { dateRange } = filters;

    // Set date range
    const startDate = dateRange?.from
      ? new Date(dateRange.from)
      : new Date(new Date().getFullYear(), 0, 1);
    const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();

    // User statistics
    const totalUsers = await User.countDocuments();
    const customers = await Customer.countDocuments();
    const restaurants = await Restaurant.countDocuments();
    const delivery = await Delivery.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] },
    });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const orderCount = revenueResult[0]?.orderCount || 0;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Restaurant statistics
    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({
      isActive: true,
    });
    const pendingRestaurants = await Restaurant.countDocuments({
      verificationStatus: 'pending',
    });
    const verifiedRestaurants = await Restaurant.countDocuments({
      verificationStatus: 'verified',
    });
    const rejectedRestaurants = await Restaurant.countDocuments({
      verificationStatus: 'rejected',
    });

    // Delivery statistics
    const totalDelivery = await Delivery.countDocuments();
    const activeDelivery = await Delivery.countDocuments({ isActive: true });
    const pendingDelivery = await Delivery.countDocuments({
      verificationStatus: 'pending',
    });
    const verifiedDelivery = await Delivery.countDocuments({
      verificationStatus: 'verified',
    });
    const onlineDelivery = await Delivery.countDocuments({ isOnline: true });

    // Revenue statistics
    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: thisMonth, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const monthlyRevenue = monthlyRevenueResult[0]?.monthlyRevenue || 0;

    // Platform revenue (commission)
    const platformRevenueResult = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurant',
        },
      },
      {
        $unwind: '$restaurant',
      },
      {
        $group: {
          _id: null,
          totalPlatformRevenue: {
            $sum: {
              $multiply: [
                '$totalAmount',
                '$restaurant.businessInfo.commissionRate',
              ],
            },
          },
          averageCommission: {
            $avg: '$restaurant.businessInfo.commissionRate',
          },
        },
      },
    ]);

    const totalPlatformRevenue =
      platformRevenueResult[0]?.totalPlatformRevenue || 0;
    const averageCommission =
      platformRevenueResult[0]?.averageCommission || 0.15;

    // Top restaurants by revenue
    const topRestaurants = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$restaurantId',
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurant',
        },
      },
      {
        $unwind: '$restaurant',
      },
      {
        $project: {
          id: '$_id',
          name: '$restaurant.restaurantDetails.name',
          revenue: 1,
          orders: 1,
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return {
      users: {
        total: totalUsers,
        customers,
        restaurants,
        delivery,
        activeUsers,
        newUsersThisMonth,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        totalRevenue,
        averageOrderValue,
      },
      restaurants: {
        total: totalRestaurants,
        active: activeRestaurants,
        pending: pendingRestaurants,
        verified: verifiedRestaurants,
        rejected: rejectedRestaurants,
      },
      delivery: {
        total: totalDelivery,
        active: activeDelivery,
        pending: pendingDelivery,
        verified: verifiedDelivery,
        online: onlineDelivery,
      },
      revenue: {
        totalPlatformRevenue,
        monthlyRevenue,
        averageCommission,
        topRestaurants,
      },
    };
  }

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(filters: GetUsersFilterDTO = {}): Promise<IUserManagement> {
    const { role, status, page = 1, limit = 20, search } = filters;

    // Build query
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      switch (status) {
        case 'active':
          query.isActive = true;
          break;
        case 'inactive':
          query.isActive = false;
          break;
        case 'pending':
          query.verificationStatus = 'pending';
          break;
        case 'verified':
          query.verificationStatus = 'verified';
          break;
        case 'rejected':
          query.verificationStatus = 'rejected';
          break;
      }
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    // Get users
    const users = await User.find(query)
      .select(
        'email firstName lastName role isActive isEmailVerified verificationStatus createdAt lastLogin',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / pageLimit);

    return {
      users: users.map((user) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: (user as any).verificationStatus,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })),
      totalUsers,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Approve or reject restaurant/delivery registration
   */
  async approveUser(approvalData: ApproveUserDTO): Promise<void> {
    const { userId, status, reason } = approvalData;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'restaurant_owner' && user.role !== 'delivery') {
      throw new AppError(
        'Only restaurant and delivery users require approval',
        400,
      );
    }

    // Update verification status
    (user as any).verificationStatus = status;
    await user.save();

    // Send notification email (if needed)
    // await emailService.sendApprovalNotification(user.email, user.firstName, status, reason);

    console.log(
      `User ${userId} ${status} by admin. Reason: ${reason || 'N/A'}`,
    );
  }

  /**
   * Update user active status
   */
  async updateUserStatus(statusData: UpdateUserStatusDTO): Promise<void> {
    const { userId, isActive, reason } = statusData;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot modify admin user status', 403);
    }

    user.isActive = isActive;
    await user.save();

    console.log(
      `User ${userId} ${isActive ? 'activated' : 'deactivated'} by admin. Reason: ${reason || 'N/A'}`,
    );
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot delete admin user', 403);
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    console.log(`User ${userId} soft deleted by admin`);
  }

  /**
   * Get pending restaurant approvals
   */
  async getPendingRestaurants(): Promise<any[]> {
    const pendingRestaurants = await Restaurant.find({
      verificationStatus: 'pending',
    }).sort({ createdAt: -1 });

    return pendingRestaurants;
  }

  /**
   * Get pending delivery approvals
   */
  async getPendingDeliveryUsers(): Promise<any[]> {
    const pendingDelivery = await Delivery.find({
      verificationStatus: 'pending',
    }).sort({ createdAt: -1 });

    return pendingDelivery;
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(dateRange?: {
    from: string;
    to: string;
  }): Promise<any> {
    const startDate = dateRange?.from
      ? new Date(dateRange.from)
      : new Date(new Date().getFullYear(), 0, 1);
    const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();

    // Order trends
    const orderTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      orderTrends,
      userGrowth,
      dateRange: { startDate, endDate },
    };
  }
}
