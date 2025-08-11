import * as nodemailer from 'nodemailer';
import { Helpers } from '../utils/helpers';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // In development mode, try to send email but don't fail if it doesn't work
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || 'noreply@talabat.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);

      // In development, don't fail the request if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV MODE] Email sending failed, but continuing...');
        return;
      }

      throw new Error('Failed to send email');
    }
  }

  /**
   * Send OTP email for registration
   */
  async sendRegistrationOTP(
    email: string,
    otp: string,
    firstName: string,
  ): Promise<void> {
    const subject = 'Welcome to Talabat - Verify Your Email';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #ff6b35; }
          .otp-code { font-size: 32px; font-weight: bold; color: #ff6b35; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; letter-spacing: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍽️ Talabat</div>
          </div>
          <h2>Welcome, ${firstName}!</h2>
          <p>Thank you for registering with Talabat. To complete your registration, please verify your email address using the OTP code below:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p>This OTP will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes.</p>
          <p>If you didn't create an account with Talabat, please ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Talabat Team</p>
            <p>&copy; ${new Date().getFullYear()} Talabat. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(
    email: string,
    otp: string,
    firstName: string,
  ): Promise<void> {
    const subject = 'Password Reset - Talabat';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #ff6b35; }
          .otp-code { font-size: 32px; font-weight: bold; color: #ff6b35; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; letter-spacing: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍽️ Talabat</div>
          </div>
          <h2>Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Use the OTP code below to reset your password:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p>This OTP will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your account is secure.
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Talabat Team</p>
            <p>&copy; ${new Date().getFullYear()} Talabat. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string,
  ): Promise<void> {
    const subject = 'Welcome to Talabat - Your Account is Ready!';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Talabat</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #ff6b35; }
          .welcome-section { text-align: center; margin: 30px 0; }
          .role-badge { display: inline-block; padding: 10px 20px; background-color: #ff6b35; color: white; border-radius: 25px; font-weight: bold; text-transform: capitalize; }
          .features { margin: 30px 0; }
          .feature { margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍽️ Talabat</div>
          </div>
          
          <div class="welcome-section">
            <h2>Welcome to Talabat, ${firstName}! 🎉</h2>
            <p>Your account has been successfully verified and you're ready to start your journey with us.</p>
            <div class="role-badge">${role.replace('_', ' ')}</div>
          </div>

          <div class="features">
            ${this.getRoleSpecificFeatures(role)}
          </div>

          <div class="footer">
            <p>Best regards,<br>The Talabat Team</p>
            <p>&copy; ${new Date().getFullYear()} Talabat. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Get role-specific features for welcome email
   */
  private getRoleSpecificFeatures(role: string): string {
    switch (role) {
      case 'customer':
        return `
          <div class="feature">
            <h3>🍕 Order Your Favorites</h3>
            <p>Browse thousands of restaurants and order your favorite meals with just a few taps.</p>
          </div>
          <div class="feature">
            <h3>🚚 Fast Delivery</h3>
            <p>Get your food delivered quickly and safely to your doorstep.</p>
          </div>
          <div class="feature">
            <h3>💳 Secure Payments</h3>
            <p>Pay safely with multiple payment options including cash on delivery.</p>
          </div>
        `;
      case 'restaurant_owner':
        return `
          <div class="feature">
            <h3>🏪 Manage Your Restaurant</h3>
            <p>Update your menu, prices, and restaurant information easily.</p>
          </div>
          <div class="feature">
            <h3>📊 Track Orders</h3>
            <p>Monitor incoming orders and manage them efficiently.</p>
          </div>
          <div class="feature">
            <h3>💰 Grow Your Business</h3>
            <p>Reach more customers and increase your revenue with our platform.</p>
          </div>
        `;
      case 'delivery':
        return `
          <div class="feature">
            <h3>🛵 Start Delivering</h3>
            <p>Accept delivery requests and start earning immediately.</p>
          </div>
          <div class="feature">
            <h3>📱 Easy-to-Use App</h3>
            <p>Navigate efficiently with our driver-friendly interface.</p>
          </div>
          <div class="feature">
            <h3>💵 Flexible Earnings</h3>
            <p>Work on your schedule and earn money on your terms.</p>
          </div>
        `;
      default:
        return `
          <div class="feature">
            <h3>🚀 Get Started</h3>
            <p>Explore all the features available in your dashboard.</p>
          </div>
        `;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    firstName: string,
    orderDetails: any,
  ): Promise<void> {
    const subject = `Order Confirmed - #${orderDetails.orderNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #ff6b35; }
          .order-details { margin: 20px 0; }
          .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; padding: 15px 0; border-top: 2px solid #ff6b35; margin-top: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍽️ Talabat</div>
          </div>
          <h2>Order Confirmed! 🎉</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your order! Your order <strong>#${orderDetails.orderNumber}</strong> has been confirmed and is being prepared.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            ${orderDetails.items?.map((item: any) => `
              <div class="order-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${item.price.toFixed(2)}</span>
              </div>
            `).join('') || ''}
            
            <div class="total">
              <div style="display: flex; justify-content: space-between;">
                <span>Total:</span>
                <span>$${orderDetails.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          <p><strong>Estimated Delivery Time:</strong> ${orderDetails.estimatedDeliveryTime || '30-45 minutes'}</p>
          <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'Not specified'}</p>

          <div class="footer">
            <p>We'll keep you updated on your order status!</p>
            <p>Best regards,<br>The Talabat Team</p>
            <p>&copy; ${new Date().getFullYear()} Talabat. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

// Export singleton instance - lazy loaded
let emailServiceInstance: EmailService | null = null;

export const emailService = {
  getInstance(): EmailService {
    if (!emailServiceInstance) {
      emailServiceInstance = new EmailService();
    }
    return emailServiceInstance;
  },

  // Proxy methods for backward compatibility
  async sendEmail(options: EmailOptions): Promise<void> {
    return this.getInstance().sendEmail(options);
  },

  async sendRegistrationOTP(email: string, otp: string, firstName: string): Promise<void> {
    return this.getInstance().sendRegistrationOTP(email, otp, firstName);
  },

  async sendPasswordResetOTP(email: string, otp: string, firstName: string): Promise<void> {
    return this.getInstance().sendPasswordResetOTP(email, otp, firstName);
  },

  async sendWelcomeEmail(email: string, firstName: string, role: string): Promise<void> {
    return this.getInstance().sendWelcomeEmail(email, firstName, role);
  },

  async sendOrderConfirmation(email: string, firstName: string, orderDetails: any): Promise<void> {
    return this.getInstance().sendOrderConfirmation(email, firstName, orderDetails);
  }
};
