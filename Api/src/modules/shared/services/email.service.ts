import nodemailer from 'nodemailer';
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
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
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
          .welcome-box { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
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
          
          <div class="welcome-box">
            <h1>🎉 Welcome to Talabat!</h1>
            <p>Your ${role} account has been successfully created and verified.</p>
          </div>
          
          <p>Hi ${firstName},</p>
          <p>Congratulations! Your account is now active and ready to use. Here's what you can do:</p>
          
          <div class="features">
            ${role === 'customer'
        ? `
              <div class="feature">🍕 Browse restaurants and discover amazing food</div>
              <div class="feature">🛒 Order your favorite meals with ease</div>
              <div class="feature">🚚 Track your orders in real-time</div>
              <div class="feature">⭐ Rate and review your dining experience</div>
            `
        : role === 'restaurant_owner'
          ? `
              <div class="feature">🏪 Manage your restaurant profile</div>
              <div class="feature">📋 Add and manage your menu items</div>
              <div class="feature">📊 Track orders and sales analytics</div>
              <div class="feature">🚚 Assign delivery drivers</div>
            `
          : role === 'delivery'
            ? `
              <div class="feature">📦 Receive delivery assignments</div>
              <div class="feature">🗺️ Navigate with integrated maps</div>
              <div class="feature">💰 Track your earnings</div>
              <div class="feature">⚡ Update delivery status in real-time</div>
            `
            : ''
      }
          </div>
          
          <p>Ready to get started? Visit our platform and explore all the features we have to offer!</p>
          
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
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    firstName: string,
    orderNumber: string,
    orderDetails: any,
  ): Promise<void> {
    const subject = `Order Confirmation - ${orderNumber}`;

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
          .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍽️ Talabat</div>
          </div>
          <h2>Order Confirmation</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your order! We're preparing your delicious meal.</p>
          
          <div class="order-details">
            <h3>Order #${orderNumber}</h3>
            <p><strong>Total Amount:</strong> ${Helpers.formatCurrency(orderDetails.totalAmount)}</p>
            <p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>
          </div>
          
          <p>You can track your order status through our app or website.</p>
          
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
}

// Export singleton instance
export const emailService = new EmailService();
