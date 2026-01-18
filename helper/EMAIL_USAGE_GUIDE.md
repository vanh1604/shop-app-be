# Hướng Dẫn Sử Dụng Email Helper

## Cấu hình môi trường (.env)

Trước khi sử dụng, cần có các biến môi trường sau trong file `.env`:

```env
# AWS SES Configuration
AWS_REGION=ap-southeast-1
AWS_API_VERSION=2010-12-01
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Email Configuration
EMAIL_FORM=noreply@yourdomain.com
APP_NAME=Your Store Name
APP_URL=https://yourdomain.com
```

## Import các hàm cần thiết

```javascript
import {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  emailTemplates
} from './helper/send_email.js';
```

---

## 1. Gửi Email Chào Mừng (Welcome Email)

**Cách sử dụng đơn giản:**

```javascript
// Trong controller đăng ký người dùng
async function registerUser(req, res) {
  const { email, username } = req.body;

  // ... logic đăng ký user ...

  // Gửi email chào mừng
  try {
    await sendWelcomeEmail(email, username);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  res.json({ message: 'User registered successfully' });
}
```

---

## 2. Gửi Email Xác Nhận Đơn Hàng (Order Confirmation)

**Cách sử dụng:**

```javascript
// Trong controller tạo đơn hàng
async function createOrder(req, res) {
  // ... logic tạo đơn hàng ...

  const orderDetails = {
    orderId: order._id.toString(),
    customerName: user.name,
    orderDate: new Date().toLocaleDateString('vi-VN'),
    totalAmount: order.totalAmount.toFixed(2),
    items: order.items.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price.toFixed(2)
    }))
  };

  try {
    await sendOrderConfirmationEmail(user.email, orderDetails);
    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
  }

  res.json({ message: 'Order created successfully', order });
}
```

**Ví dụ dữ liệu orderDetails:**

```javascript
const orderDetails = {
  orderId: "67890abcdef",
  customerName: "Nguyễn Văn A",
  orderDate: "16/01/2024",
  totalAmount: "1,250,000",
  items: [
    { name: "iPhone 15 Pro", quantity: 1, price: "1,000,000" },
    { name: "Case iPhone", quantity: 2, price: "125,000" }
  ]
};
```

---

## 3. Gửi Email Thông Báo Đã Gửi Hàng (Order Shipped)

**Cách sử dụng:**

```javascript
// Trong controller cập nhật trạng thái đơn hàng
async function updateOrderStatus(req, res) {
  const { orderId } = req.params;

  // ... logic cập nhật trạng thái ...

  if (order.status === 'shipped') {
    const shippingDetails = {
      orderId: order._id.toString(),
      customerName: user.name,
      trackingNumber: order.trackingNumber,
      trackingUrl: `https://tracking.example.com/${order.trackingNumber}`,
      estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')
    };

    try {
      await sendOrderShippedEmail(user.email, shippingDetails);
      console.log('Shipping notification sent');
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
    }
  }

  res.json({ message: 'Order status updated' });
}
```

**Ví dụ dữ liệu shippingDetails:**

```javascript
const shippingDetails = {
  orderId: "67890abcdef",
  customerName: "Nguyễn Văn A",
  trackingNumber: "VN123456789",
  trackingUrl: "https://ghn.vn/tracking?code=VN123456789",
  estimatedDelivery: "20/01/2024"
};
```

---

## 4. Gửi Email Đặt Lại Mật Khẩu (Password Reset)

**Cách sử dụng:**

```javascript
import crypto from 'crypto';

// Trong controller quên mật khẩu
async function forgotPassword(req, res) {
  const { email } = req.body;

  // Tìm user
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Lưu token vào database
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
  await user.save();

  // Gửi email
  try {
    await sendPasswordResetEmail(user.email, resetToken, user.name);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(500).json({ message: 'Email could not be sent' });
  }
}
```

---

## 5. Gửi Email Xác Thực Tài Khoản (Email Verification)

**Cách sử dụng:**

```javascript
import crypto from 'crypto';

// Trong controller đăng ký
async function register(req, res) {
  const { email, name, password } = req.body;

  // Tạo verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Tạo user mới
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpire: Date.now() + 86400000, // 24 hours
    isVerified: false
  });

  // Gửi email xác thực
  try {
    await sendVerificationEmail(user.email, verificationToken, user.name);
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    // Xóa user nếu không gửi được email
    await User.findByIdAndDelete(user._id);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}

// API xác thực email
async function verifyEmail(req, res) {
  const { token } = req.query;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
}
```

---

## 6. Gửi Email Custom (Tùy Chỉnh)

**Cách sử dụng:**

```javascript
// Gửi email với nội dung tùy chỉnh
const customContent = `
  <h2>Thông Báo Đặc Biệt</h2>
  <p>Xin chào ${userName},</p>
  <p>Chúng tôi có chương trình khuyến mãi đặc biệt dành cho bạn!</p>

  <div class="info-box">
    <strong>Giảm giá 50%</strong> cho tất cả sản phẩm<br>
    Thời gian: 16/01/2024 - 20/01/2024
  </div>

  <a href="${process.env.APP_URL}/promotions" class="button">Xem Ngay</a>

  <div class="divider"></div>
  <p>Đừng bỏ lỡ cơ hội tuyệt vời này!</p>
`;

try {
  await sendEmail(
    userEmail,
    'Chương Trình Khuyến Mãi Đặc Biệt',
    customContent
  );
} catch (error) {
  console.error('Failed to send custom email:', error);
}
```

**Gửi email không sử dụng template (raw HTML):**

```javascript
const rawHTML = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Custom Email</h1>
      <p>This is a completely custom email without the default template.</p>
    </body>
  </html>
`;

await sendEmail(
  userEmail,
  'Custom Subject',
  rawHTML,
  { useTemplate: false } // Không dùng template mặc định
);
```

---

## 7. Gửi Email Cho Nhiều Người

```javascript
// Gửi cho nhiều người nhận
const recipients = [
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
];

await sendEmail(
  recipients, // Array of emails
  'Newsletter Tháng 1',
  newsletterContent
);
```

---

## 8. Sử dụng Email Templates Trực Tiếp

```javascript
import { emailTemplates, sendEmail, generateEmailBody } from './helper/send_email.js';

// Lấy template và tùy chỉnh
const { subject, content } = emailTemplates.welcome('Nguyễn Văn A');

// Tùy chỉnh thêm nội dung
const customizedContent = content + `
  <div class="info-box">
    <strong>Khuyến mãi:</strong> Sử dụng mã <strong>WELCOME10</strong> để được giảm 10% cho đơn hàng đầu tiên!
  </div>
`;

// Gửi email với nội dung đã tùy chỉnh
await sendEmail('user@example.com', subject, customizedContent);
```

---

## 9. Error Handling Best Practices

```javascript
async function sendEmailWithRetry(emailFunction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await emailFunction();
      return result;
    } catch (error) {
      console.error(`Email sending attempt ${i + 1} failed:`, error.message);

      if (i === maxRetries - 1) {
        // Lần thử cuối cùng thất bại
        throw new Error('Failed to send email after multiple attempts');
      }

      // Đợi trước khi thử lại (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

// Sử dụng
try {
  await sendEmailWithRetry(() =>
    sendWelcomeEmail('user@example.com', 'John Doe')
  );
  console.log('Email sent successfully');
} catch (error) {
  console.error('All email sending attempts failed');
  // Log vào database hoặc gửi notification cho admin
}
```

---

## 10. Testing Email Locally

```javascript
// Tạo một test endpoint
app.post('/api/test-email', async (req, res) => {
  const { type, email } = req.body;

  try {
    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(email, 'Test User');
        break;

      case 'order':
        await sendOrderConfirmationEmail(email, {
          orderId: 'TEST123',
          customerName: 'Test User',
          orderDate: new Date().toLocaleDateString('vi-VN'),
          totalAmount: '500,000',
          items: [
            { name: 'Test Product 1', quantity: 1, price: '300,000' },
            { name: 'Test Product 2', quantity: 2, price: '100,000' }
          ]
        });
        break;

      case 'shipped':
        await sendOrderShippedEmail(email, {
          orderId: 'TEST123',
          customerName: 'Test User',
          trackingNumber: 'VN999999999',
          trackingUrl: 'https://tracking.example.com/VN999999999',
          estimatedDelivery: new Date(Date.now() + 3 * 86400000).toLocaleDateString('vi-VN')
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid email type' });
    }

    res.json({ message: `${type} email sent successfully to ${email}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});
```

---

## CSS Classes Available

Các class CSS có sẵn trong template để bạn sử dụng:

- `.button` - Nút bấm với màu gradient
- `.info-box` - Hộp thông tin với border bên trái
- `.divider` - Đường phân cách ngang
- `.email-header` - Header với gradient background
- `.email-body` - Body chính của email
- `.email-footer` - Footer với thông tin liên hệ

**Ví dụ:**

```javascript
const content = `
  <h2>Xin chào!</h2>
  <p>Đây là nội dung email.</p>

  <div class="info-box">
    <strong>Lưu ý:</strong> Thông tin quan trọng ở đây
  </div>

  <a href="https://example.com" class="button">Click Me</a>

  <div class="divider"></div>

  <p>Thông tin thêm...</p>
`;
```

---

## Tips & Best Practices

1. **Luôn handle errors** khi gửi email để không ảnh hưởng flow chính
2. **Không bắt buộc** email phải gửi thành công cho các tính năng quan trọng (đăng ký, đặt hàng)
3. **Log email errors** để debug khi cần
4. **Test kỹ** trước khi deploy lên production
5. **Sử dụng queue** (Redis, Bull) cho việc gửi email để tránh block request
6. **Kiểm tra AWS SES limits** để tránh vượt quota

---

## Troubleshooting

### Email không gửi được?

1. Kiểm tra AWS credentials trong `.env`
2. Verify email sender trong AWS SES Console
3. Kiểm tra AWS SES region có đúng không
4. Xem logs để biết lỗi cụ thể

### Email vào spam?

1. Setup SPF, DKIM, DMARC records cho domain
2. Verify domain trong AWS SES
3. Tránh từ ngữ spam trong subject/content
4. Không gửi quá nhiều email trong thời gian ngắn
