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

const generateEmailBody = (content, title) => {
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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
          }
          .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 30px 0;
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

const buildVerificationEmail = (username, otp) => {
  return {
    subject: "Verify Your Email Address",
    content: `
      <h2>Verify Your Email</h2>
      <p>Hi ${username},</p>
      <p>Please use the OTP below to complete your account verification.</p>
      <div class="info-box">
        <p><strong>Your OTP:</strong> ${otp}</p>
        <p><strong>Expires in:</strong> 10 minutes</p>
      </div>
      <div class="divider"></div>
      <p>Do not share this OTP with anyone.</p>
      <p>If you did not create this account, you can ignore this email.</p>
    `,
  };
};

const sendEmail = async (to, subject, htmlContent) => {
  const params = {
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: generateEmailBody(htmlContent, subject),
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

export const sendVerificationEmail = async (to, username, otp) => {
  const { subject, content } = buildVerificationEmail(username, otp);
  return sendEmail(to, subject, content);
};
