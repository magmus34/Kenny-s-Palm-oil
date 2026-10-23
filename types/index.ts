export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  volume: string; // e.g. "1 Litre Bottle", "2.5 Litres Gallon", "5 Litres Keg", "10 Litres", "25 Litres Keg"
  imageUrl: string;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
}

export interface StoreSettings {
  businessName: string;
  storeDescription: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  pickupAddress: string;
  deliveryInfo: string;
  supportEmail: string;
  currency?: string;
  currencySymbol?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  volume: string;
  imageUrl?: string;
}

export type PaymentStatus = 'Pending' | 'Confirmed';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderRef: string;
  customerName: string;
  customerLocation: string;
  customerWhatsapp: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProfile {
  email: string;
  role: 'admin';
  displayName?: string;
  createdAt?: string;
}

export interface BannerSettings {
  heading: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  showBanner: boolean;
  showButton: boolean;
  updatedAt?: string;
}
