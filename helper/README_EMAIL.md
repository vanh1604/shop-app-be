# 📧 Email Helper - Quick Start

## 🚀 Cài Đặt Nhanh

### 1. Kiểm tra file `.env` đã có đủ các biến sau:

```env
AWS_REGION=ap-southeast-2
AWS_API_VERSION=2010-12-01
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
EMAIL_FORM=VietAnhScout@gmail.com
APP_NAME=Dreamabtme store
APP_URL=http://localhost:3000
```

### 2. Verify email trong AWS SES Console

- Đăng nhập AWS Console
- Vào SES (Simple Email Service)
- Verify địa chỉ email `VietAnhScout@gmail.com`
- Click link xác nhận trong email AWS gửi đến

---

## 📖 Cách Sử Dụng Cơ Bản

### Import các hàm:

```javascript
import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
} from './helper/send_email.js';
```

### 1. Email Chào Mừng:

```javascript
await sendWelcomeEmail('user@example.com', 'Tên User');
```

### 2. Email Xác Nhận Đơn Hàng:

```javascript
await sendOrderConfirmationEmail('user@example.com', {
  orderId: '12345',
  customerName: 'Nguyễn Văn A',
  orderDate: '16/01/2024',
  totalAmount: '1,500,000',
  items: [
    { name: 'iPhone 15', quantity: 1, price: '1,500,000' }
  ]
});
```

### 3. Email Thông Báo Đã Gửi Hàng:

```javascript
await sendOrderShippedEmail('user@example.com', {
  orderId: '12345',
  customerName: 'Nguyễn Văn A',
  trackingNumber: 'VN123456789',
  trackingUrl: 'https://tracking.ghn.vn',
  estimatedDelivery: '20/01/2024'
});
```

### 4. Email Đặt Lại Mật Khẩu:

```javascript
const resetToken = crypto.randomBytes(32).toString('hex');
await sendPasswordResetEmail('user@example.com', resetToken, 'Tên User');
```

### 5. Email Xác Thực Tài Khoản:

```javascript
const verifyToken = crypto.randomBytes(32).toString('hex');
await sendVerificationEmail('user@example.com', verifyToken, 'Tên User');
```

---

## ⚡ Best Practices

### 1. Không chặn flow chính:

```javascript
// ✅ ĐÚNG - Không chờ email
sendWelcomeEmail(email, name).catch(err =>
  console.error('Email failed:', err)
);

res.json({ success: true });
```

```javascript
// ❌ SAI - Chờ email sẽ làm chậm response
await sendWelcomeEmail(email, name);
res.json({ success: true });
```

### 2. Handle errors đúng cách:

```javascript
try {
  await sendOrderConfirmationEmail(email, orderDetails);
} catch (error) {
  // Log error nhưng không throw
  console.error('Failed to send email:', error);
  // Đơn hàng vẫn được tạo thành công
}
```

### 3. Validate email trước khi gửi:

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ message: 'Invalid email' });
}
```

---

## 🧪 Test Email

### Tạo test endpoint trong `routes`:

```javascript
// routes/testRoute.js
import express from 'express';
import { sendWelcomeEmail } from '../helper/send_email.js';

const router = express.Router();

router.post('/test-email', async (req, res) => {
  const { email } = req.body;

  try {
    await sendWelcomeEmail(email, 'Test User');
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message
    });
  }
});

export default router;
```

### Test bằng curl:

```bash
curl -X POST http://localhost:4000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

---

## 🎨 Custom Email Content

### Sử dụng CSS classes có sẵn:

```javascript
const customContent = `
  <h2>Tiêu Đề Email</h2>
  <p>Nội dung chính...</p>

  <div class="info-box">
    <strong>Lưu ý:</strong> Thông tin quan trọng
  </div>

  <a href="https://example.com" class="button">Click Here</a>

  <div class="divider"></div>

  <p>Thông tin thêm...</p>
`;

await sendEmail(userEmail, 'Subject', customContent);
```

---

## 📁 Files Hướng Dẫn

- **`EMAIL_USAGE_GUIDE.md`** - Hướng dẫn chi tiết đầy đủ
- **`email_examples.js`** - 10 ví dụ code thực tế sẵn dùng
- **`send_email.js`** - File chính chứa các hàm helper

---

## 🐛 Troubleshooting

### Email không gửi được?

1. **Check AWS credentials:**
   ```bash
   # Kiểm tra trong .env
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```

2. **Verify email sender:**
   - Vào AWS SES Console
   - Kiểm tra email đã được verify chưa

3. **Check logs:**
   ```javascript
   console.log('Sending email to:', email);
   ```

### Email vào spam?

1. Verify domain trong AWS SES (không chỉ email)
2. Setup SPF, DKIM records
3. Tránh từ ngữ spam trong subject/content

---

## 💡 Tips

1. **Môi trường Development**: AWS SES Sandbox chỉ gửi được đến verified emails
2. **Production**: Request move out of Sandbox để gửi bất kỳ email nào
3. **Rate Limits**: Free tier: 200 emails/day, sau đó $0.10/1000 emails
4. **Best Time**: Gửi email vào 9-11h sáng có tỷ lệ mở cao nhất

---

## 📞 Support

Nếu cần trợ giúp:
1. Xem `EMAIL_USAGE_GUIDE.md` cho hướng dẫn chi tiết
2. Tham khảo `email_examples.js` cho ví dụ cụ thể
3. Check AWS SES documentation

---

**Made with ❤️ for Dreamabtme Store**
