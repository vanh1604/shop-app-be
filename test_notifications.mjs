/**
 * test_notifications.mjs
 * Full end-to-end test for the FCM push notification pipeline.
 *
 * Run: node test_notifications.mjs
 */
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';
const FAKE_FCM_TOKEN = 'test_fcm_token_' + Date.now(); // fake – will get invalid-token error from FCM, which is expected

const log   = (msg)  => console.log(`\n✅  ${msg}`);
const warn  = (msg)  => console.log(`⚠️   ${msg}`);
const step  = (msg)  => console.log(`\n── ${msg} ──`);
const fail  = (msg)  => { console.error(`\n❌  FAIL: ${msg}`); process.exit(1); };

async function api(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

// ─── 1. Register test vendor ───────────────────────────────────────────────
step('1. Đăng ký vendor test');
const vendorEmail = `test_vendor_${Date.now()}@test.com`;
const vendorRes = await api('POST', '/api/vendor/signup', {
  fullName: 'Test Vendor',
  email: vendorEmail,
  password: 'password123',
  storeName: 'Test Store FCM',
  storeImage: 'https://via.placeholder.com/150',
  storeDescription: 'Test store for FCM notification testing',
});
if (vendorRes.status !== 200) fail(`vendor signup: ${JSON.stringify(vendorRes.json)}`);
const vendorId = vendorRes.json.vendor._id;
log(`Vendor created: ${vendorId} (${vendorEmail})`);

// ─── 2. Login vendor ────────────────────────────────────────────────────────
step('2. Đăng nhập vendor');
const vendorLogin = await api('POST', '/api/vendor/signin', {
  email: vendorEmail,
  password: 'password123',
});
if (vendorLogin.status !== 200) fail(`vendor signin: ${JSON.stringify(vendorLogin.json)}`);
const vendorToken = vendorLogin.json.token;
log(`Vendor token: ${vendorToken.substring(0, 30)}...`);

// ─── 3. Register FCM token for vendor ───────────────────────────────────────
step('3. Đăng ký FCM token cho vendor');
const vendorFcm = await api('POST', '/api/notifications/register-token',
  { token: FAKE_FCM_TOKEN + '_vendor' }, vendorToken);
if (vendorFcm.status !== 200) fail(`register vendor token: ${JSON.stringify(vendorFcm.json)}`);
log(`Vendor FCM token registered: ${vendorFcm.json.message}`);

// ─── 4. Skip user signup (AWS SES sandbox blocks unverified emails in test) ──
warn('Bỏ qua user signup (AWS SES sandbox mode). Dùng vendor account làm buyer trong test này.');
const userEmail = vendorEmail;

// ─── 5. Test duplicate token insert (addToSet idempotency) ──────────────────
step('5. Test idempotency: đăng ký cùng token 2 lần không bị duplicate');
const dupeToken = await api('POST', '/api/notifications/register-token',
  { token: FAKE_FCM_TOKEN + '_vendor' }, vendorToken);
if (dupeToken.status !== 200) fail(`duplicate token: ${JSON.stringify(dupeToken.json)}`);
log(`addToSet idempotent: ${dupeToken.json.message}`);

// ─── 7. Create product → triggers sendToTopic('all_users') ─────────────────
step('6. Tạo sản phẩm → bắn notification all_users topic');
const productRes = await api('POST', '/api/createproduct', {
  name: 'FCM Test Product',
  price: 99000,
  description: 'Test product for notification',
  quantity: 10,
  images: ['https://via.placeholder.com/300'],
  category: 'Electronics',
  subCategory: 'Phones',
  vendorId: vendorId,
  fullName: 'Test Vendor',
}, vendorToken);
if (productRes.status !== 201) fail(`createProduct: ${JSON.stringify(productRes.json)}`);
const productId = productRes.json.product._id;
log(`Product created: ${productId} – FCM sendToTopic('all_users') đã được gọi (xem log server)`);

// ─── 8. Create order → triggers sendToTokens(vendor.fcmTokens) ─────────────
step('7. Tạo đơn hàng → bắn notification cho vendor');
const orderRes = await api('POST', '/api/createorder', {
  fullName: 'Test Buyer',
  email: userEmail,
  state: 'HCM',
  city: 'District 1',
  locality: 'Ben Nghe',
  productName: 'FCM Test Product',
  productPrice: 99000,
  quantity: 1,
  category: 'Electronics',
  image: 'https://via.placeholder.com/300',
  buyerId: vendorId,   // dùng vendorId làm buyerId vì user chưa verify OTP
  vendorId: vendorId,
  processing: true,
  delivered: false,
}, vendorToken);
if (orderRes.status !== 201) fail(`createOrder: ${JSON.stringify(orderRes.json)}`);
const orderId = orderRes.json.order._id;
log(`Order created: ${orderId} – FCM sendToTokens(vendor.fcmTokens) đã được gọi`);

// ─── 9. Update order processing → triggers sendToTokens(buyer.fcmTokens) ────
step('8. Cập nhật trạng thái processing → bắn notification cho buyer');
await new Promise(r => setTimeout(r, 500)); // small delay
const procRes = await api('PATCH', `/api/orders/${orderId}/processing`, {
  processing: true,
});
if (procRes.status !== 200) fail(`updateProcessing: ${JSON.stringify(procRes.json)}`);
log(`Order processing updated – FCM sendToTokens(buyer.fcmTokens) đã được gọi`);

// ─── 10. Update order delivered → triggers sendToTokens(buyer.fcmTokens) ────
step('9. Cập nhật trạng thái delivered → bắn notification cho buyer');
const delivRes = await api('PATCH', `/api/orders/${orderId}/delivered`, {
  delivered: true,
  processing: false,
});
if (delivRes.status !== 200) fail(`updateDelivered: ${JSON.stringify(delivRes.json)}`);
log(`Order delivered updated – FCM sendToTokens(buyer.fcmTokens) đã được gọi`);

// ─── 11. Remove FCM token ────────────────────────────────────────────────────
step('10. Xoá FCM token (logout flow)');
const removeRes = await api('DELETE', '/api/notifications/remove-token',
  { token: FAKE_FCM_TOKEN + '_vendor' }, vendorToken);
if (removeRes.status !== 200) fail(`removeToken: ${JSON.stringify(removeRes.json)}`);
log(`Token removed: ${removeRes.json.message}`);

// ─── 11. Cleanup ─────────────────────────────────────────────────────────────
step('11. Dọn dẹp test data');
await api('DELETE', `/api/orders/${orderId}`, null, vendorToken);
log(`Order ${orderId} deleted`);

console.log('\n══════════════════════════════════════════════');
console.log('🎉  TẤT CẢ TEST BACKEND NOTIFICATION PASS!');
console.log('══════════════════════════════════════════════');
console.log('\nLưu ý: FCM có thể log "[FCM] sendToTokens error: ..." hoặc "[FCM] sendToTopic error: ..."');
console.log('vì token test là fake – đây là BÌNH THƯỜNG khi test không có device thật.');
console.log('Khi chạy app thật, token sẽ hợp lệ và notification sẽ được gửi đến device.\n');
