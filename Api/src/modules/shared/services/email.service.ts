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
    } catch (error) {
      // In development, don't fail the request if email fails
      if (process.env.NODE_ENV === 'development') {
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
    const subject = 'Talabat - Email Verification Required';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Talabat</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa; 
            margin: 0; 
            padding: 0; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 40px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); 
            padding: 40px 30px; 
            text-align: center; 
          }
          .logo { 
            font-size: 32px; 
            font-weight: 700; 
            color: #ffffff; 
            margin-bottom: 8px; 
            letter-spacing: -0.5px; 
          }
          .tagline { 
            color: rgba(255, 255, 255, 0.9); 
            font-size: 14px; 
            font-weight: 400; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting { 
            font-size: 24px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 20px; 
          }
          .message { 
            font-size: 16px; 
            color: #5a6c7d; 
            margin-bottom: 30px; 
            line-height: 1.7; 
          }
          .otp-container { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            border: 2px solid #e9ecef; 
            border-radius: 12px; 
            padding: 30px; 
            text-align: center; 
            margin: 30px 0; 
          }
          .otp-label { 
            font-size: 14px; 
            font-weight: 600; 
            color: #6c757d; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            margin-bottom: 15px; 
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: 700; 
            color: #FF6B35; 
            letter-spacing: 8px; 
            font-family: 'Courier New', monospace; 
            background: #ffffff; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #dee2e6; 
            display: inline-block; 
            min-width: 200px; 
          }
          .expiry-notice { 
            background-color: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px 20px; 
            margin: 25px 0; 
            border-radius: 4px; 
          }
          .expiry-notice p { 
            margin: 0; 
            font-size: 14px; 
            color: #856404; 
            font-weight: 500; 
          }
          .security-note { 
            background-color: #f8f9fa; 
            border: 1px solid #dee2e6; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
          }
          .security-note p { 
            margin: 0; 
            font-size: 14px; 
            color: #6c757d; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
          }
          .footer-content { 
            font-size: 14px; 
            color: #6c757d; 
            line-height: 1.6; 
          }
          .footer-content .company { 
            font-weight: 600; 
            color: #495057; 
            margin-bottom: 8px; 
          }
          .copyright { 
            font-size: 12px; 
            color: #adb5bd; 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid #dee2e6; 
          }
          .button-container { 
            text-align: center; 
            margin: 30px 0; 
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); 
            color: #ffffff; 
            text-decoration: none; 
            padding: 14px 30px; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px; 
            transition: all 0.3s ease; 
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 20px; border-radius: 8px; }
            .header, .content, .footer { padding: 25px 20px; }
            .greeting { font-size: 20px; }
            .otp-code { font-size: 28px; letter-spacing: 4px; min-width: 150px; }
            .otp-container { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">TALABAT</div>
            <div class="tagline">Food Delivery Platform</div>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome, ${firstName}!</div>
            
            <div class="message">
              Thank you for registering with Talabat. To complete your account setup and ensure the security of your account, please verify your email address using the verification code below.
            </div>
            
            <div class="otp-container">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-notice">
              <p><strong>Important:</strong> This verification code will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes for security purposes.</p>
            </div>
            
            <div class="security-note">
              <p><strong>Security Notice:</strong> If you did not create an account with Talabat, please disregard this email. Your information remains secure, and no account has been created.</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="company">The Talabat Team</div>
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>If you need assistance, please contact our support team.</p>
              <div class="copyright">
                &copy; ${new Date().getFullYear()} Talabat. All rights reserved.
              </div>
            </div>
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
    const subject = 'Talabat - Password Reset Verification';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Talabat</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa; 
            margin: 0; 
            padding: 0; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 40px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); 
            padding: 40px 30px; 
            text-align: center; 
          }
          .logo { 
            font-size: 32px; 
            font-weight: 700; 
            color: #ffffff; 
            margin-bottom: 8px; 
            letter-spacing: -0.5px; 
          }
          .tagline { 
            color: rgba(255, 255, 255, 0.9); 
            font-size: 14px; 
            font-weight: 400; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting { 
            font-size: 24px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 20px; 
          }
          .message { 
            font-size: 16px; 
            color: #5a6c7d; 
            margin-bottom: 30px; 
            line-height: 1.7; 
          }
          .otp-container { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            border: 2px solid #e9ecef; 
            border-radius: 12px; 
            padding: 30px; 
            text-align: center; 
            margin: 30px 0; 
          }
          .otp-label { 
            font-size: 14px; 
            font-weight: 600; 
            color: #6c757d; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            margin-bottom: 15px; 
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: 700; 
            color: #FF6B35; 
            letter-spacing: 8px; 
            font-family: 'Courier New', monospace; 
            background: #ffffff; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #dee2e6; 
            display: inline-block; 
            min-width: 200px; 
          }
          .expiry-notice { 
            background-color: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px 20px; 
            margin: 25px 0; 
            border-radius: 4px; 
          }
          .expiry-notice p { 
            margin: 0; 
            font-size: 14px; 
            color: #856404; 
            font-weight: 500; 
          }
          .security-warning { 
            background-color: #fff5f5; 
            border: 1px solid #fed7d7; 
            border-left: 4px solid #e53e3e; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
          }
          .security-warning p { 
            margin: 0; 
            font-size: 14px; 
            color: #c53030; 
            font-weight: 500; 
          }
          .security-warning .warning-title { 
            font-weight: 600; 
            color: #742a2a; 
            margin-bottom: 8px; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
          }
          .footer-content { 
            font-size: 14px; 
            color: #6c757d; 
            line-height: 1.6; 
          }
          .footer-content .company { 
            font-weight: 600; 
            color: #495057; 
            margin-bottom: 8px; 
          }
          .copyright { 
            font-size: 12px; 
            color: #adb5bd; 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid #dee2e6; 
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 20px; border-radius: 8px; }
            .header, .content, .footer { padding: 25px 20px; }
            .greeting { font-size: 20px; }
            .otp-code { font-size: 28px; letter-spacing: 4px; min-width: 150px; }
            .otp-container { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">TALABAT</div>
            <div class="tagline">Food Delivery Platform</div>
          </div>
          
          <div class="content">
            <div class="greeting">Password Reset Request</div>
            
            <div class="message">
              Hello ${firstName},<br><br>
              We received a request to reset your password for your Talabat account. To proceed with the password reset, please use the verification code below.
            </div>
            
            <div class="otp-container">
              <div class="otp-label">Reset Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-notice">
              <p><strong>Time Sensitive:</strong> This verification code will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes for security purposes.</p>
            </div>
            
            <div class="security-warning">
              <div class="warning-title">Security Alert</div>
              <p>If you did not request a password reset, please ignore this email and ensure your account remains secure. Consider changing your password if you suspect unauthorized access.</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="company">The Talabat Security Team</div>
              <p>This is an automated security message. Please do not reply to this email.</p>
              <p>For security concerns, please contact our support team immediately.</p>
              <div class="copyright">
                &copy; ${new Date().getFullYear()} Talabat. All rights reserved.
              </div>
            </div>
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
    const subject = 'Welcome to Talabat - Your Account is Active';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Talabat</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa; 
            margin: 0; 
            padding: 0; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 40px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); 
            padding: 40px 30px; 
            text-align: center; 
          }
          .logo { 
            font-size: 32px; 
            font-weight: 700; 
            color: #ffffff; 
            margin-bottom: 8px; 
            letter-spacing: -0.5px; 
          }
          .tagline { 
            color: rgba(255, 255, 255, 0.9); 
            font-size: 14px; 
            font-weight: 400; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .welcome-section { 
            text-align: center; 
            margin-bottom: 40px; 
          }
          .greeting { 
            font-size: 28px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 15px; 
          }
          .welcome-message { 
            font-size: 16px; 
            color: #5a6c7d; 
            margin-bottom: 25px; 
            line-height: 1.7; 
          }
          .role-badge { 
            display: inline-block; 
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); 
            color: #ffffff; 
            padding: 12px 24px; 
            border-radius: 25px; 
            font-weight: 600; 
            font-size: 14px; 
            text-transform: capitalize; 
            letter-spacing: 0.5px; 
          }
          .features-section { 
            margin: 40px 0; 
          }
          .features-title { 
            font-size: 20px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 25px; 
            text-align: center; 
          }
          .feature { 
            background-color: #f8f9fa; 
            border: 1px solid #e9ecef; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            border-left: 4px solid #FF6B35; 
          }
          .feature-title { 
            font-size: 16px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 8px; 
          }
          .feature-description { 
            font-size: 14px; 
            color: #5a6c7d; 
            line-height: 1.6; 
          }
          .cta-section { 
            background-color: #f8f9fa; 
            padding: 30px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 30px 0; 
          }
          .cta-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 15px; 
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); 
            color: #ffffff; 
            text-decoration: none; 
            padding: 14px 30px; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px; 
            margin-top: 15px; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
          }
          .footer-content { 
            font-size: 14px; 
            color: #6c757d; 
            line-height: 1.6; 
          }
          .footer-content .company { 
            font-weight: 600; 
            color: #495057; 
            margin-bottom: 8px; 
          }
          .copyright { 
            font-size: 12px; 
            color: #adb5bd; 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid #dee2e6; 
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 20px; border-radius: 8px; }
            .header, .content, .footer { padding: 25px 20px; }
            .greeting { font-size: 24px; }
            .feature { padding: 15px; }
            .cta-section { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">TALABAT</div>
            <div class="tagline">Food Delivery Platform</div>
          </div>
          
          <div class="content">
            <div class="welcome-section">
              <div class="greeting">Welcome to Talabat, ${firstName}!</div>
              <div class="welcome-message">
                Your account has been successfully verified and activated. You're now ready to explore all the features and services available on our platform.
              </div>
              <div class="role-badge">${role.replace('_', ' ')}</div>
            </div>

            <div class="features-section">
              <div class="features-title">What You Can Do Now</div>
              ${this.getRoleSpecificFeatures(role)}
            </div>

            <div class="cta-section">
              <div class="cta-title">Ready to Get Started?</div>
              <p style="color: #6c757d; margin-bottom: 0;">Log in to your account and begin your journey with Talabat.</p>
              <a href="#" class="cta-button">Access Your Account</a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="company">The Talabat Team</div>
              <p>Thank you for choosing Talabat for your food delivery needs.</p>
              <p>If you have any questions, our support team is here to help.</p>
              <div class="copyright">
                &copy; ${new Date().getFullYear()} Talabat. All rights reserved.
              </div>
            </div>
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
            <div class="feature-title">Browse and Order</div>
            <div class="feature-description">Discover thousands of restaurants and order your favorite meals with ease. From local favorites to international cuisine, find exactly what you're craving.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Fast and Reliable Delivery</div>
            <div class="feature-description">Enjoy quick delivery service that brings your food fresh and hot to your doorstep. Track your order in real-time from kitchen to delivery.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Secure Payment Options</div>
            <div class="feature-description">Pay safely with multiple payment methods including credit cards, digital wallets, and cash on delivery for your convenience.</div>
          </div>
        `;
      case 'restaurant_owner':
        return `
          <div class="feature">
            <div class="feature-title">Restaurant Management</div>
            <div class="feature-description">Easily manage your restaurant profile, update menu items, set prices, and control availability. Keep your customers informed with real-time updates.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Order Processing</div>
            <div class="feature-description">Receive and process orders efficiently through our streamlined dashboard. Monitor order status and communicate with delivery partners seamlessly.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Business Analytics</div>
            <div class="feature-description">Access detailed insights about your sales, popular items, and customer preferences to grow your business and maximize revenue.</div>
          </div>
        `;
      case 'delivery':
        return `
          <div class="feature">
            <div class="feature-title">Delivery Management</div>
            <div class="feature-description">Accept delivery requests and manage your route efficiently. Our system helps you optimize delivery times and maximize your earnings.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Flexible Schedule</div>
            <div class="feature-description">Work on your own schedule with the flexibility to choose when and where you want to deliver. Set your availability and work at your convenience.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Earnings Tracking</div>
            <div class="feature-description">Monitor your earnings, track completed deliveries, and access detailed reports to understand your performance and income patterns.</div>
          </div>
        `;
      default:
        return `
          <div class="feature">
            <div class="feature-title">Platform Access</div>
            <div class="feature-description">Explore all the features available in your dashboard and customize your experience according to your preferences.</div>
          </div>
          <div class="feature">
            <div class="feature-title">Support Resources</div>
            <div class="feature-description">Access our comprehensive help center, tutorials, and customer support to make the most of your Talabat experience.</div>
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
    const subject = `Order Confirmation - ${orderDetails.orderNumber}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Talabat</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f8f9fa; 
            margin: 0; 
            padding: 0; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 40px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            padding: 40px 30px; 
            text-align: center; 
          }
          .logo { 
            font-size: 32px; 
            font-weight: 700; 
            color: #ffffff; 
            margin-bottom: 8px; 
            letter-spacing: -0.5px; 
          }
          .tagline { 
            color: rgba(255, 255, 255, 0.9); 
            font-size: 14px; 
            font-weight: 400; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .confirmation-title { 
            font-size: 28px; 
            font-weight: 600; 
            color: #28a745; 
            text-align: center; 
            margin-bottom: 20px; 
          }
          .greeting { 
            font-size: 16px; 
            color: #5a6c7d; 
            margin-bottom: 30px; 
            line-height: 1.7; 
          }
          .order-number { 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            border: 2px solid #e9ecef; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 25px 0; 
          }
          .order-number-label { 
            font-size: 14px; 
            font-weight: 600; 
            color: #6c757d; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            margin-bottom: 8px; 
          }
          .order-number-value { 
            font-size: 24px; 
            font-weight: 700; 
            color: #28a745; 
            font-family: 'Courier New', monospace; 
          }
          .order-details { 
            background-color: #f8f9fa; 
            border: 1px solid #e9ecef; 
            border-radius: 8px; 
            padding: 25px; 
            margin: 30px 0; 
          }
          .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #e9ecef; 
            padding-bottom: 10px; 
          }
          .order-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 0; 
            border-bottom: 1px solid #e9ecef; 
          }
          .order-item:last-child { 
            border-bottom: none; 
          }
          .item-details { 
            flex: 1; 
          }
          .item-name { 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 4px; 
          }
          .item-quantity { 
            font-size: 14px; 
            color: #6c757d; 
          }
          .item-price { 
            font-weight: 600; 
            color: #28a745; 
            font-size: 16px; 
          }
          .total-section { 
            background-color: #ffffff; 
            border: 2px solid #28a745; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 8px 0; 
          }
          .total-label { 
            font-size: 18px; 
            font-weight: 700; 
            color: #2c3e50; 
          }
          .total-amount { 
            font-size: 24px; 
            font-weight: 700; 
            color: #28a745; 
          }
          .delivery-info { 
            background-color: #f8f9fa; 
            border-left: 4px solid #17a2b8; 
            padding: 20px; 
            margin: 25px 0; 
            border-radius: 4px; 
          }
          .delivery-info h4 { 
            color: #2c3e50; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .delivery-info p { 
            margin: 8px 0; 
            color: #5a6c7d; 
            font-size: 14px; 
          }
          .status-update { 
            background-color: #d1ecf1; 
            border: 1px solid #bee5eb; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 25px 0; 
            text-align: center; 
          }
          .status-update p { 
            margin: 0; 
            color: #0c5460; 
            font-weight: 500; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
          }
          .footer-content { 
            font-size: 14px; 
            color: #6c757d; 
            line-height: 1.6; 
          }
          .footer-content .company { 
            font-weight: 600; 
            color: #495057; 
            margin-bottom: 8px; 
          }
          .copyright { 
            font-size: 12px; 
            color: #adb5bd; 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid #dee2e6; 
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 20px; border-radius: 8px; }
            .header, .content, .footer { padding: 25px 20px; }
            .confirmation-title { font-size: 24px; }
            .order-details, .delivery-info { padding: 15px; }
            .order-item { flex-direction: column; align-items: flex-start; }
            .item-price { margin-top: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">TALABAT</div>
            <div class="tagline">Food Delivery Platform</div>
          </div>
          
          <div class="content">
            <div class="confirmation-title">Order Confirmed!</div>
            
            <div class="greeting">
              Hello ${firstName},<br><br>
              Thank you for your order! We're excited to prepare your meal and deliver it fresh to your location.
            </div>
            
            <div class="order-number">
              <div class="order-number-label">Order Number</div>
              <div class="order-number-value">${orderDetails.orderNumber}</div>
            </div>
            
            <div class="order-details">
              <div class="section-title">Order Details</div>
              ${orderDetails.items?.map((item: any) => `
                <div class="order-item">
                  <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantity: ${item.quantity}</div>
                  </div>
                  <div class="item-price">$${item.price.toFixed(2)}</div>
                </div>
              `).join('') || '<div class="order-item"><div class="item-details"><div class="item-name">Order details not available</div></div></div>'}
            </div>

            <div class="total-section">
              <div class="total-row">
                <div class="total-label">Total Amount</div>
                <div class="total-amount">$${orderDetails.total?.toFixed(2) || '0.00'}</div>
              </div>
            </div>

            <div class="delivery-info">
              <h4>Delivery Information</h4>
              <p><strong>Estimated Delivery Time:</strong> ${orderDetails.estimatedDeliveryTime || '30-45 minutes'}</p>
              <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress || 'Address not specified'}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod || 'Not specified'}</p>
            </div>

            <div class="status-update">
              <p>We'll send you updates about your order status via email and SMS. You can also track your order in real-time through our mobile app.</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="company">The Talabat Team</div>
              <p>Thank you for choosing Talabat for your food delivery needs.</p>
              <p>For order support, please contact our customer service team.</p>
              <div class="copyright">
                &copy; ${new Date().getFullYear()} Talabat. All rights reserved.
              </div>
            </div>
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
