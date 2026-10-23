import { CartItem } from '@/context/cart-context';
import { StoreSettings } from '@/types';

export function formatNaira(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace('NGN', '₦');
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function generateOrderRef(): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `KPO-${randomPart}`;
}

export function cleanPhoneNumber(phone: string): string {
  // Remove non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) {
    // Nigerian local format e.g. 0803... -> 234803...
    cleaned = '234' + cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function buildWhatsAppOrderUrl(params: {
  orderRef: string;
  customerName: string;
  customerLocation: string;
  customerWhatsapp: string;
  cart: CartItem[];
  total: number;
  settings: StoreSettings;
}): string {
  const { orderRef, customerName, customerLocation, customerWhatsapp, cart, total, settings } = params;

  const dateNow = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsList = cart
    .map(
      (item) =>
        `• ${item.product.name} (${item.product.volume || '1L'}) x ${item.quantity} = ${formatNaira(
          item.product.price * item.quantity
        )}`
    )
    .join('\n');

  const messageText = `*${settings.businessName.toUpperCase()} - NEW ORDER*
━━━━━━━━━━━━━━━━━━━━━
🔖 *Order Reference:* ${orderRef}
📅 *Order Date:* ${dateNow}

👤 *Customer Details:*
• *Name:* ${customerName}
• *Location:* ${customerLocation}
• *WhatsApp:* ${customerWhatsapp}

🛒 *Ordered Items:*
${itemsList}

💰 *TOTAL AMOUNT: ${formatNaira(total)}*
💳 *Payment Method:* Bank Transfer
⏳ *Payment Status:* Pending Confirmation

🏦 *Payment Instructions:*
Bank: ${settings.bankName}
Account Name: ${settings.bankAccountName}
Account Number: ${settings.bankAccountNumber}
━━━━━━━━━━━━━━━━━━━━━
I have placed this order on the website. Kindly confirm payment and dispatch details.`;

  const phone = cleanPhoneNumber(settings.whatsappNumber || '2348039284712');
  return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
}
