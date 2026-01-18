import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { configDotenv } from "dotenv";
configDotenv();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateEmailBody = (content, title = "Welcome") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .email-body {
            padding: 40px 30px;
            height: auto;
          }
          .email-body h2 {
          
            color: #333;
            font-size: 22px;
            margin-top: 0;
          }
          .email-body p {
            margin: 15px 0;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 20px 0;
            background-color: #667eea;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #5568d3;
          }
          .email-footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .email-footer p {
            margin: 5px 0;
          }
          .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 30px 0;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              margin: 10px;
            }
            .email-body {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>${process.env.APP_NAME || "Our Store"}</h1>
          </div>
          <div class="email-body">
            ${content}
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "Our Store"}. All rights reserved.</p>
            <p>If you have any questions, please contact us at ${process.env.EMAIL_FORM || "support@example.com"}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Template Examples
export const emailTemplates = {
  welcome: (username) => ({
    subject: `Welcome to ${process.env.APP_NAME}!`,
    content: `
      <h2>Hello ${username}!</h2>
      <p>Thank you for joining ${process.env.APP_NAME}. We're excited to have you on board!</p>
      <p>Get started by exploring our products and services.</p>
      <a href="${process.env.APP_URL || "#"}" class="button">Start Shopping</a>
      <div class="divider"></div>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `,
  }),

  orderConfirmation: (orderDetails) => ({
    subject: `Order Confirmation - #${orderDetails.orderId}`,
    content: `
      <h2>Thank You for Your Order!</h2>
      <p>Hi ${orderDetails.customerName},</p>
      <p>Your order has been confirmed and will be shipped soon.</p>

      <div class="info-box">
        <strong>Order Details:</strong><br>
        Order ID: <strong>#${orderDetails.orderId}</strong><br>
        Order Date: ${orderDetails.orderDate}<br>
        Total Amount: <strong>$${orderDetails.totalAmount}</strong>
      </div>

      <h3>Items Ordered:</h3>
      ${orderDetails.items
        .map(
          (item) => `
        <p>• ${item.name} (x${item.quantity}) - $${item.price}</p>
      `,
        )
        .join("")}

      <div class="divider"></div>
      <p>You can track your order status by clicking the button below:</p>
      <a href="${process.env.APP_URL}/orders/${orderDetails.orderId}" class="button">Track Order</a>
    `,
  }),

  orderShipped: (shippingDetails) => ({
    subject: `Your Order Has Been Shipped! - #${shippingDetails.orderId}`,
    content: `
      <h2>Great News! Your Order is On Its Way</h2>
      <p>Hi ${shippingDetails.customerName},</p>
      <p>Your order has been shipped and is on its way to you!</p>

      <div class="info-box">
        <strong>Shipping Information:</strong><br>
        Order ID: <strong>#${shippingDetails.orderId}</strong><br>
        Tracking Number: <strong>${shippingDetails.trackingNumber}</strong><br>
        Estimated Delivery: ${shippingDetails.estimatedDelivery}
      </div>

      <a href="${shippingDetails.trackingUrl || "#"}" class="button">Track Your Package</a>

      <div class="divider"></div>
      <p>Thank you for shopping with us!</p>
    `,
  }),

  passwordReset: (resetToken, username) => ({
    subject: "Reset Your Password",
    content: `
      <h2>Password Reset Request</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <a href="${process.env.APP_URL}/reset-password?token=${resetToken}" class="button">Reset Password</a>

      <div class="info-box">
        <strong>Note:</strong> This link will expire in 1 hour for security reasons.
      </div>

      <div class="divider"></div>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    `,
  }),

  accountVerification: (username, otp) => ({
    subject: "Verify Your Email Address",
    content: `
      <h2>Verify Your Email</h2>
      <p>Hi ${username},</p>
      <p>Thank you for registering! Please verify your email address to activate your account.</p>
      <div class="info-box">
        <strong>Note:</strong> This verification link will expire in 24 hours.
      </div>
      <div class="divider">
      <p>Your One-Time password (OTP) for email verification is:</p>
      <p><strong>${otp}</strong></p>
      <p><strong>Note:</strong> This OTP will expire in 10 minutes.</p>
      <p><strong>Note:</strong> Do not share this OTP with anyone.</p>
      <p><strong>Note:</strong> If you didn't create an account, please ignore this email.</p>
      </div>

      <div class="divider"></div>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  }),
};

export const sendEmail = async (to, subject, htmlContent, options = {}) => {
  const { title = subject, useTemplate = true } = options;

  const finalBody = useTemplate
    ? generateEmailBody(htmlContent, title)
    : htmlContent;

  const params = {
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: finalBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: process.env.EMAIL_FORM,
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Helper functions for common email types
export const sendWelcomeEmail = async (to, username) => {
  const { subject, content } = emailTemplates.welcome(username);
  return sendEmail(to, subject, content);
};

export const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const { subject, content } = emailTemplates.orderConfirmation(orderDetails);
  return sendEmail(to, subject, content);
};

export const sendOrderShippedEmail = async (to, shippingDetails) => {
  const { subject, content } = emailTemplates.orderShipped(shippingDetails);
  return sendEmail(to, subject, content);
};

export const sendPasswordResetEmail = async (to, resetToken, username) => {
  const { subject, content } = emailTemplates.passwordReset(
    resetToken,
    username,
  );
  return sendEmail(to, subject, content);
};

export const sendVerificationEmail = async (
  to,

  username,
  otp,
) => {
  const { subject, content } = emailTemplates.accountVerification(
    username,
    otp,
  );
  return sendEmail(to, subject, content);
};

export default sendEmail;
