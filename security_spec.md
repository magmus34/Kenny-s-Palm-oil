# Security Specification for Kenny's Premium Palm Oil

## 1. Data Invariants & Access Control Model

1. **Single Private Admin Account**:
   - Access to administrative capabilities is governed by a secure, server-side admin session issued only upon verification of the administrator password.
   - The admin password is never sent in frontend JS or public responses, and is verified in constant time (`crypto.timingSafeEqual`) on the server.
   - Client-side registration, sign-up, and admin account creation are strictly eliminated. The `/admins` collection in Firestore cannot be written to or read by any client.

2. **Protected Server API Endpoints**:
   - All critical administrative mutations are routed through protected Next.js API endpoints (`/api/admin/orders`, `/api/admin/products`, `/api/admin/banner`, etc.).
   - Unauthenticated visitors attempting direct API requests to these endpoints receive `401 Unauthorized`.
   - Admin sessions use secure HTTP-only cookies with HMAC SHA-256 signatures and expiration controls.

3. **Product & Category Integrity**:
   - Products and categories are strictly validated against bounds (name length, non-negative price, non-negative stock).
   - Valid items can only be created, modified, or deleted by the authenticated administrator via the protected dashboard and API.

4. **Settings & Banner Isolation**:
   - Store settings (bank account details, WhatsApp number) and Homepage Banner settings are validated against schemas (`isValidStoreSettings`, `isValidBannerSettings`).
   - Only authorized administrator updates are accepted.

5. **Order Creation & Tampering Guard**:
   - Anyone (guest customers) can place an order into `/orders`, but:
     * Must contain valid order reference format.
     * Initial `paymentStatus` MUST be `'Pending'` (customers cannot mark their own orders as `'Confirmed'`).
     * Initial `orderStatus` MUST be `'Pending'`.
     * Customer name, location, and WhatsApp number must satisfy length and format bounds.
     * `items` array must be non-empty and bounded.
   - Order status transitions are restricted to authorized states:
     * `paymentStatus`: `Pending` | `Confirmed`
     * `orderStatus`: `Pending` | `Confirmed` | `Delivered` | `Cancelled`

## 2. Threat Mitigation & Verification Payloads

1. **Payload 1: Unauthenticated Admin Endpoint Tampering**
   - Target: `POST /api/admin/products` without admin cookie
   - Expected Result: `401 Unauthorized`

2. **Payload 2: Direct Order Status Manipulation via API**
   - Target: `PATCH /api/admin/orders` without admin cookie
   - Expected Result: `401 Unauthorized`

3. **Payload 3: Self-Confirmed Payment Exploit**
   - Target: `POST /orders/order-hack-1`
   - Content: `{ orderRef: "KPO-999", paymentStatus: "Confirmed", orderStatus: "Delivered", total: 100 }`
   - Expected Result: `PERMISSION_DENIED` (guest orders must have `paymentStatus == 'Pending'` and `orderStatus == 'Pending'`)

4. **Payload 4: Empty Order Insertion**
   - Target: `POST /orders/order-empty`
   - Content: `{ customerName: "Test", customerLocation: "Lagos", customerWhatsapp: "08012345678", items: [], total: 0 }`
   - Expected Result: `PERMISSION_DENIED` (items array must have items.size() > 0)

5. **Payload 5: Negative Price or Stock Injection**
   - Target: `POST /products/prod-neg`
   - Content: `{ name: "Palm Oil 1L", price: -500, stockQuantity: -10 }`
   - Expected Result: `PERMISSION_DENIED` (price and stock must be non-negative numbers)

6. **Payload 6: Direct Client Admin Creation Attempt**
   - Target: `SET /admins/random-uid`
   - Expected Result: `PERMISSION_DENIED` (direct write to /admins is strictly disabled: `allow read, write: if false`)

