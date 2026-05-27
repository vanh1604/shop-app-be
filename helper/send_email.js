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
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "Cửa hàng của chúng tôi"}. Bảo lưu mọi quyền.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi tại ${process.env.EMAIL_FORM || "support@example.com"}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const buildVerificationEmail = (username, otp) => {
  return {
    subject: "Xác minh địa chỉ email của bạn",
    content: `
      <h2>Xác minh Email</h2>
      <p>Chào ${username},</p>
      <p>Vui lòng sử dụng mã OTP dưới đây để hoàn tất việc xác minh tài khoản của bạn.</p>
      <div class="info-box">
        <p><strong>Mã OTP của bạn:</strong> ${otp}</p>
        <p><strong>Hết hạn trong:</strong> 10 phút</p>
      </div>
      <div class="divider"></div>
      <p>Không chia sẻ mã OTP này với bất kỳ ai.</p>
      <p>Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này.</p>
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
