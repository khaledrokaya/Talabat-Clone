import { User } from '../../shared/schemas/base-user.schema';
import { Restaurant } from '../../restaurant/schemas/restaurant.schema';
import { Delivery } from '../../delivery/schemas/delivery.schema';
import { Customer } from '../../customer/schemas/customer.schema';
import OTP from '../schemas/otp.schema';
import Cart from '../../cart/schemas/cart.schema';
import { emailService } from '../../shared/services/email.service';
import { Helpers } from '../../shared/utils/helpers';
import { AppError } from '../../shared/middlewares/error.middleware';
import {
  RegisterUserDTO,
  LoginUserDTO,
  VerifyOTPDTO,
  ResendOTPDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from '../dto/auth.dto';
import {
  IAuthResponse,
  ILoginResponse,
  IRegisterResponse,
  IVerifyOTPResponse,
  ITokenPayload,
} from '../interfaces/auth.interface';

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterUserDTO): Promise<IRegisterResponse> {
    const { email, password, role, ...otherData } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new AppError('User already exists with this email', 400);
      } else {
        // Delete existing unverified user
        await User.findByIdAndDelete(existingUser._id);
        await OTP.deleteMany({ email: email.toLowerCase() });
      }
    }

    // Hash password
    const hashedPassword = await Helpers.hashPassword(password);

    // Create user based on role
    let user;
    const commonData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: otherData.firstName,
      lastName: otherData.lastName,
      phone: otherData.phone,
      role,
      address: otherData.address,
      isActive: true,
      isEmailVerified: false,
    };

    switch (role) {
      case 'customer':
        user = new Customer(commonData);
        break;

      case 'restaurant_owner':
        if (!userData.restaurantDetails || !userData.businessInfo) {
          throw new AppError(
            'Restaurant details and business info are required',
            400,
          );
        }
        user = new Restaurant({
          ...commonData,
          restaurantDetails: userData.restaurantDetails,
          businessInfo: userData.businessInfo,
          verificationStatus: 'pending',
        });
        break;

      case 'delivery':
        if (!userData.vehicleInfo || !userData.deliveryZones) {
          throw new AppError(
            'Vehicle info and delivery zones are required',
            400,
          );
        }
        user = new Delivery({
          ...commonData,
          vehicleInfo: userData.vehicleInfo,
          deliveryZones: userData.deliveryZones,
          documents: userData.documents,
          verificationStatus: 'pending',
        });
        break;

      default:
        throw new AppError('Invalid role specified', 400);
    }

    // Keep email verification as false until OTP is verified
    user.isEmailVerified = false;
    await user.save();

    // Create cart for customer users
    if (role === 'customer') {
      await Cart.create({
        customerId: user._id,
        items: [],
        totalAmount: 0,
      });
    }

    // Generate OTP for email verification
    const otp = Helpers.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(
      otpExpiry.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN || '10'),
    );

    // Save OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose: 'email_verification',
      expiresAt: otpExpiry,
    });

    // Send registration OTP email
    await emailService.sendRegistrationOTP(
      email.toLowerCase(),
      otp,
      user.firstName,
    );

    // Prepare response message based on role
    let message = '';
    const responseData: any = {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    switch (role) {
      case 'customer':
        message = 'Customer registered successfully. Please verify your email with the OTP sent.';
        break;
      case 'restaurant_owner':
        message = 'Restaurant registered successfully. Please verify your email with the OTP sent before admin approval.';
        responseData.verificationStatus = 'pending';
        break;
      case 'delivery':
        message = 'Delivery driver registered successfully. Please verify your email with the OTP sent before admin approval.';
        responseData.verificationStatus = 'pending';
        break;
    }

    return {
      success: true,
      message,
      data: responseData,
    };
  }

  /**
   * Verify OTP and complete registration/password reset
   */
  async verifyOTP(otpData: VerifyOTPDTO): Promise<IVerifyOTPResponse> {
    const { email, otp, type } = otpData;

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose:
        type === 'registration' ? 'email_verification' : 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    if (otpRecord.attempts >= 5) {
      throw new AppError('Maximum OTP attempts exceeded', 400);
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (type === 'registration') {
      // Verify email for registration
      user.isEmailVerified = true;
      await user.save();

      // Send welcome email
      await emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        user.role,
      );
    }

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = Helpers.generateToken(tokenPayload);
    const refreshToken = Helpers.generateRefreshToken(tokenPayload);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      success: true,
      message:
        type === 'registration'
          ? 'Email verified successfully'
          : 'OTP verified successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Login user
   */
  async login(loginData: LoginUserDTO): Promise<ILoginResponse> {
    const { email, password } = loginData;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password',
    );
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate new OTP for verification
      await OTP.deleteMany({
        email: email.toLowerCase(),
        purpose: 'email_verification',
      });

      const otp = Helpers.generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(
        otpExpiry.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN || '10'),
      );

      await OTP.create({
        email: email.toLowerCase(),
        otp,
        purpose: 'email_verification',
        expiresAt: otpExpiry,
      });

      // Send registration OTP email
      await emailService.sendRegistrationOTP(
        email.toLowerCase(),
        otp,
        user.firstName,
      );

      // Create a custom error that the frontend can handle
      const error = new AppError('Please verify your email first. A new OTP has been sent to your email.', 403);
      (error as any).errorCode = 'EMAIL_NOT_VERIFIED';
      (error as any).email = email.toLowerCase();
      throw error;
    }

    // Verify password
    const isPasswordValid = await Helpers.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = Helpers.generateToken(tokenPayload);
    const refreshToken = Helpers.generateRefreshToken(tokenPayload);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600 // 1 hour in seconds
        }
      },
    };
  }

  /**
   * Resend OTP
   */
  async resendOTP(resendData: ResendOTPDTO): Promise<IAuthResponse> {
    const { email, type } = resendData;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (type === 'registration' && user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Delete existing OTPs
    await OTP.deleteMany({
      email: email.toLowerCase(),
      purpose:
        type === 'registration' ? 'email_verification' : 'password_reset',
    });

    // Generate new OTP
    const otp = Helpers.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(
      otpExpiry.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN || '10'),
    );

    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose:
        type === 'registration' ? 'email_verification' : 'password_reset',
      expiresAt: otpExpiry,
    });

    // Send OTP based on type
    if (type === 'registration') {
      await emailService.sendRegistrationOTP(
        email.toLowerCase(),
        otp,
        user.firstName,
      );
    } else {
      await emailService.sendPasswordResetOTP(
        email.toLowerCase(),
        otp,
        user.firstName,
      );
    }

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  /**
   * Forgot password
   */
  async forgotPassword(forgotData: ForgotPasswordDTO): Promise<IAuthResponse> {
    const { email } = forgotData;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email first', 400);
    }

    // Delete existing password reset OTPs
    await OTP.deleteMany({
      email: email.toLowerCase(),
      purpose: 'password_reset',
    });

    // Generate OTP
    const otp = Helpers.generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(
      otpExpiry.getMinutes() + parseInt(process.env.OTP_EXPIRES_IN || '10'),
    );

    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose: 'password_reset',
      expiresAt: otpExpiry,
    });

    // Send password reset OTP email
    await emailService.sendPasswordResetOTP(
      email.toLowerCase(),
      otp,
      user.firstName,
    );

    return {
      success: true,
      message: 'Password reset OTP sent to your email',
    };
  }

  /**
   * Reset password
   */
  async resetPassword(resetData: ResetPasswordDTO): Promise<IAuthResponse> {
    const { email, otp, newPassword } = resetData;

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await Helpers.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(
    userId: string,
    changeData: ChangePasswordDTO,
  ): Promise<IAuthResponse> {
    const { currentPassword, newPassword } = changeData;

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await Helpers.comparePassword(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedNewPassword = await Helpers.hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Logout user (handled on client side, but can be used for token blacklisting)
   */
  async logout(): Promise<IAuthResponse> {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
