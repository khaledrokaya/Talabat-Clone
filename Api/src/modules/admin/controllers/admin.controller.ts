import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats = asyncHandler(
    async (req: Request, res: Response, __next: NextFunction) => {
      const stats = await this.adminService.getDashboardStats(req.query);

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Dashboard statistics retrieved successfully',
            stats,
          ),
        );
    },
  );

  /**
   * Get all users with filtering
   */
  getUsers = asyncHandler(
    async (req: Request, res: Response, __next: NextFunction) => {
      const result = await this.adminService.getUsers(req.query);

      res.status(200).json(
        Helpers.formatResponse(
          true,
          'Users retrieved successfully',
          result.users,
          {
            totalUsers: result.totalUsers,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
          },
        ),
      );
    },
  );

  /**
   * Get user by ID
   */
  getUserById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId } = req.params;
      const user = await this.adminService.getUserById(userId);

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'User retrieved successfully', user),
        );
    },
  );

  /**
   * Approve or reject restaurant/delivery registration
   */
  approveUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId } = req.params;
      await this.adminService.approveUser({
        userId,
        ...req.body,
      });

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'User approval status updated successfully',
          ),
        );
    },
  );

  /**
   * Update user active status
   */
  updateUserStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId } = req.params;
      await this.adminService.updateUserStatus({
        userId,
        ...req.body,
      });

      res
        .status(200)
        .json(Helpers.formatResponse(true, 'User status updated successfully'));
    },
  );

  /**
   * Delete user (soft delete)
   */
  deleteUser = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId } = req.params;
      await this.adminService.deleteUser(userId);

      res
        .status(200)
        .json(Helpers.formatResponse(true, 'User deleted successfully'));
    },
  );

  /**
   * Get pending restaurant approvals
   */
  getPendingRestaurants = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const restaurants = await this.adminService.getPendingRestaurants();

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Pending restaurants retrieved successfully',
            restaurants,
          ),
        );
    },
  );

  /**
   * Get pending delivery user approvals
   */
  getPendingDeliveryUsers = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const deliveryUsers = await this.adminService.getPendingDeliveryUsers();

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Pending delivery users retrieved successfully',
            deliveryUsers,
          ),
        );
    },
  );

  /**
   * Get platform analytics
   */
  getPlatformAnalytics = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const analytics = await this.adminService.getPlatformAnalytics(
        req.query as any,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Platform analytics retrieved successfully',
            analytics,
          ),
        );
    },
  );
}
