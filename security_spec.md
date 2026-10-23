# Security Specification for Kenny's Premium Palm Oil

## 1. Data Invariants

1. **Product Integrity**: Products can only be created, modified, or deleted by authenticated administrators (`isAdmin`). Public users have read-only access to products.
2. **Category Integrity**: Categories can only be created, modified, or deleted by authenticated administrators. Public users have read-only access.
3. **Settings Isolation**: Store settings (which contain official bank account details, business WhatsApp number, and store branding) can only be updated by authenticated administrators. Public users have read-only access to `/settings/store`.
4. **Order Creation & Tampering Guard**: Anyone (guest customers) can place an order into `/orders`, but:
   - Must contain valid order reference format.
   - Initial `paymentStatus` MUST be `'Pending'` (customers cannot mark their own orders as `'Confirmed'` or `'Paid'`).
   - Initial `orderStatus` MUST be `'Pending'`.
   - Customer name, location, and WhatsApp number must satisfy strict length and format bounds.
   - `items` array must be non-empty and bounded.
   - Once an order is created, guest customers cannot read all orders or update any order.
   - Only authenticated administrators can read the orders list, view customer PII, update order/payment statuses, or delete orders.
5. **Admin Access Control**: The `admins` collection can only be written by authenticated administrators. Bootstrapped admin is `eowolabi34@gmail.com` with `email_verified == true`.
6. **No Client Query Reliance**: The rules themselves reject unauthorized operations regardless of what query or payload a malicious client constructs.

## 2. The Dirty Dozen Malicious Payloads

1. **Payload 1: Unauthenticated Product Injection**
   - Target: `POST /products/fake-product`
   - Content: `{ name: "Free Oil", price: 0, stockQuantity: 999 }`
   - Expected Result: `PERMISSION_DENIED` (only admin can create products)

2. **Payload 2: Guest Price Modification**
   - Target: `UPDATE /products/prod-1`
   - Content: `{ price: 10 }`
   - Expected Result: `PERMISSION_DENIED` (public cannot write to products)

3. **Payload 3: Bank Account Hijacking**
   - Target: `UPDATE /settings/store`
   - Content: `{ bankAccountNumber: "9999999999", bankAccountName: "Scammer", bankName: "Evil Bank" }`
   - Expected Result: `PERMISSION_DENIED` (only verified admin can update store settings)

4. **Payload 4: Self-Confirmed Payment Exploit**
   - Target: `POST /orders/order-hack-1`
   - Content: `{ orderRef: "KPO-999", paymentStatus: "Confirmed", orderStatus: "Delivered", total: 100 }`
   - Expected Result: `PERMISSION_DENIED` (guest orders must start with paymentStatus == 'Pending' and orderStatus == 'Pending')

5. **Payload 5: PII Harvester (Reading All Customer Orders)**
   - Target: `LIST /orders`
   - Content: `getDocs(collection(db, 'orders'))`
   - Expected Result: `PERMISSION_DENIED` (guest users are strictly forbidden from listing/reading customer orders)

6. **Payload 6: Order Post-Creation State Tampering**
   - Target: `UPDATE /orders/order-1`
   - Content: `{ paymentStatus: "Confirmed" }`
   - Expected Result: `PERMISSION_DENIED` (unauthenticated user cannot modify order status)

7. **Payload 7: Privilege Escalation (Self-Admin Role Registration)**
   - Target: `SET /admins/random-uid`
   - Content: `{ email: "attacker@gmail.com", role: "admin" }`
   - Expected Result: `PERMISSION_DENIED` (only existing verified admin can register admin documents)

8. **Payload 8: Giant Payload / Denial of Wallet Attack**
   - Target: `POST /orders/order-dos`
   - Content: `{ customerName: "A" * 10000, customerLocation: "B" * 50000, items: [...] }`
   - Expected Result: `PERMISSION_DENIED` (fields exceed maxLength bounds)

9. **Payload 9: Email Spoofing Attack Without Verification**
   - Target: `WRITE /products/prod-1`
   - Token: `{ email: "eowolabi34@gmail.com", email_verified: false }`
   - Expected Result: `PERMISSION_DENIED` (bootstrapped admin requires email_verified == true)

10. **Payload 10: Empty Order Insertion**
    - Target: `POST /orders/order-empty`
    - Content: `{ customerName: "Test", customerLocation: "Lagos", customerWhatsapp: "08012345678", items: [], total: 0 }`
    - Expected Result: `PERMISSION_DENIED` (items array must have items.size() > 0)

11. **Payload 11: Negative Price or Stock Injection**
    - Target: `POST /products/prod-neg`
    - Content: `{ name: "Palm Oil 1L", price: -500, stockQuantity: -10 }`
    - Expected Result: `PERMISSION_DENIED` (price and stock must be non-negative numbers)

12. **Payload 12: Order Deletion by Anonymous User**
    - Target: `DELETE /orders/order-1`
    - Expected Result: `PERMISSION_DENIED` (only admin can delete orders)
