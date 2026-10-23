import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';
import {
  Product,
  Category,
  StoreSettings,
  BannerSettings,
  Order,
  PaymentStatus,
  OrderStatus,
} from '@/types';

// Default initial settings for Kenny's Premium Palm Oil
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  businessName: "Kenny's Premium Palm Oil",
  storeDescription:
    "Pure, natural Nigerian palm oil extracted from fresh, sun-ripened oil palm fruit bunches in Ondo and Edo states. 100% unadulterated, unbleached, with zero chemical additives or artificial coloring.",
  logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80',
  whatsappNumber: '+2348039284712',
  bankName: 'Guaranty Trust Bank (GTBank)',
  bankAccountName: "Kenny's Premium Agro Commodities",
  bankAccountNumber: '0281947382',
  pickupAddress: 'Shop 14, Mile 12 International Market Complex, Kosofe, Lagos, Nigeria',
  deliveryInfo: 'Fast dispatch across Lagos within 24 hours. Inter-state interstate bus park dispatch to Abuja, Port Harcourt, Ibadan, and nationwide within 48 hours.',
  supportEmail: 'orders@kennyspalmoil.ng',
  currency: 'NGN',
  currencySymbol: '₦',
};

// Seed initial authentic palm oil inventory if collection is completely fresh
export const INITIAL_CATEGORIES = [
  {
    name: 'Retail Bottles',
    slug: 'retail-bottles',
    description: 'Everyday cooking sizes for small households and kitchens.',
  },
  {
    name: 'Family Gallons',
    slug: 'family-gallons',
    description: 'Economical 2.5L and 5L gallon containers for medium and large families.',
  },
  {
    name: 'Commercial Kegs',
    slug: 'commercial-kegs',
    description: 'Heavy duty 10L and 25L drums for caterers, restaurants, and soup makers.',
  },
];

export const INITIAL_PRODUCTS = [
  {
    name: 'Pure Palm Oil - 1 Litre Kitchen Bottle',
    description:
      'Convenient 1-litre sealed PET bottle with tamper-evident cap. Perfect for daily family cooking, beans, egusi, and ofada stew. Deep vibrant red, sweet nutty aroma.',
    price: 3200,
    categoryName: 'Retail Bottles',
    volume: '1 Litre Bottle',
    imageUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    stockQuantity: 45,
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Pure Palm Oil - 2 Litres Handy Jug',
    description:
      'Ergonomic 2-litre handled container. Pours easily without oily mess. Extracted from freshly harvested NIFOR oil palm nuts with rich carotene content.',
    price: 6200,
    categoryName: 'Family Gallons',
    volume: '2 Litres Gallon',
    imageUrl:
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    stockQuantity: 30,
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Premium Red Palm Oil - 5 Litres Big Gallon',
    description:
      'Our most popular household size. 5 litres of thick, pure, traditional palm oil. Settles smoothly without white sediment or bad aftertaste.',
    price: 14800,
    categoryName: 'Family Gallons',
    volume: '5 Litres Gallon',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    stockQuantity: 24,
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Pure Farm Palm Oil - 10 Litres Chef Keg',
    description:
      'Sturdy 10-litre food-grade drum with double air-tight locking cap. Favoured by bukas, boarding schools, and big events.',
    price: 28500,
    categoryName: 'Commercial Kegs',
    volume: '10 Litres Keg',
    imageUrl:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    stockQuantity: 15,
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Bulk Commercial Keg - 25 Litres Heavy Duty',
    description:
      'Full 25-litre heavy-gauge industrial plastic drum. Wholesale grade unadulterated red oil directly from mill press. Best bulk pricing for restaurants and resellers.',
    price: 68000,
    categoryName: 'Commercial Kegs',
    volume: '25 Litres Heavy Keg',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    stockQuantity: 12,
    isAvailable: true,
    isFeatured: true,
  },
];

// ==========================================
// STORE SETTINGS
// ==========================================
export function subscribeStoreSettings(
  callback: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
) {
  const settingsDocRef = doc(db, 'settings', 'store');
  return onSnapshot(
    settingsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreSettings;
        callback({ ...DEFAULT_STORE_SETTINGS, ...data });
      } else {
        callback(DEFAULT_STORE_SETTINGS);
      }
    },
    (error) => {
      console.warn('Store settings listener note:', error.message);
      if (onError) onError(error);
      callback(DEFAULT_STORE_SETTINGS);
    }
  );
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'store'));
    if (snap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...(snap.data() as StoreSettings) };
    }
    return DEFAULT_STORE_SETTINGS;
  } catch (error) {
    console.warn('Falling back to default settings due to:', error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  const path = 'settings/store';
  try {
    await setDoc(
      doc(db, 'settings', 'store'),
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// HOMEPAGE BANNER SETTINGS
// ==========================================

export const DEFAULT_BANNER_SETTINGS: BannerSettings = {
  heading: "Kenny's Premium Palm Oil",
  subtitle: '100% Pure, Unadulterated & Fresh Palm Oil • Direct Mill Extraction from Edo & Ondo',
  badge: 'Fresh 2026 Harvest',
  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  buttonText: 'Shop All Sizes',
  buttonLink: '#catalog',
  showBanner: true,
  showButton: true,
};

export function subscribeBannerSettings(
  callback: (settings: BannerSettings) => void,
  onError?: (err: Error) => void
) {
  const bannerDocRef = doc(db, 'settings', 'banner');
  return onSnapshot(
    bannerDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<BannerSettings>;
        callback({
          ...DEFAULT_BANNER_SETTINGS,
          ...data,
          showBanner: data.showBanner !== undefined ? Boolean(data.showBanner) : true,
          showButton: data.showButton !== undefined ? Boolean(data.showButton) : true,
        });
      } else {
        callback(DEFAULT_BANNER_SETTINGS);
      }
    },
    (error) => {
      console.warn('Banner settings listener note:', error.message);
      if (onError) onError(error);
      callback(DEFAULT_BANNER_SETTINGS);
    }
  );
}

export async function getBannerSettings(): Promise<BannerSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'banner'));
    if (snap.exists()) {
      const data = snap.data() as Partial<BannerSettings>;
      return {
        ...DEFAULT_BANNER_SETTINGS,
        ...data,
        showBanner: data.showBanner !== undefined ? Boolean(data.showBanner) : true,
        showButton: data.showButton !== undefined ? Boolean(data.showButton) : true,
      };
    }
    return DEFAULT_BANNER_SETTINGS;
  } catch (error) {
    console.warn('Falling back to default banner settings due to:', error);
    return DEFAULT_BANNER_SETTINGS;
  }
}

export async function updateBannerSettings(settings: Partial<BannerSettings>): Promise<void> {
  const path = 'settings/banner';
  try {
    await setDoc(
      doc(db, 'settings', 'banner'),
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}


// ==========================================
// PRODUCTS
// ==========================================
export function subscribeProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'products'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          volume: data.volume || '1L',
          imageUrl: data.imageUrl || '',
          stockQuantity: Number(data.stockQuantity) || 0,
          isAvailable: Boolean(data.isAvailable),
          isFeatured: Boolean(data.isFeatured),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        });
      });
      callback(items);
    },
    (error) => {
      console.warn('Products subscription note (operating with local state until connected):', error.message);
      if (onError) onError(error);
      callback(
        INITIAL_PRODUCTS.map((p, idx) => ({
          ...p,
          id: `prod-${idx}`,
          categoryId: `cat-${idx % 3}`,
        }))
      );
    }
  );
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const path = 'products';
  try {
    const docRef = await addDoc(collection(db, path), {
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      categoryId: product.categoryId || '',
      categoryName: product.categoryName || '',
      volume: product.volume || '1L',
      imageUrl: product.imageUrl || '',
      stockQuantity: Number(product.stockQuantity),
      isAvailable: Boolean(product.isAvailable),
      isFeatured: Boolean(product.isFeatured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    const cleanUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (product.name !== undefined) cleanUpdates.name = product.name;
    if (product.description !== undefined) cleanUpdates.description = product.description;
    if (product.price !== undefined) cleanUpdates.price = Number(product.price);
    if (product.categoryId !== undefined) cleanUpdates.categoryId = product.categoryId;
    if (product.categoryName !== undefined) cleanUpdates.categoryName = product.categoryName;
    if (product.volume !== undefined) cleanUpdates.volume = product.volume;
    if (product.imageUrl !== undefined) cleanUpdates.imageUrl = product.imageUrl;
    if (product.stockQuantity !== undefined) cleanUpdates.stockQuantity = Number(product.stockQuantity);
    if (product.isAvailable !== undefined) cleanUpdates.isAvailable = Boolean(product.isAvailable);
    if (product.isFeatured !== undefined) cleanUpdates.isFeatured = Boolean(product.isFeatured);

    await updateDoc(doc(db, 'products', id), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// CATEGORIES
// ==========================================
export function subscribeCategories(
  callback: (categories: Category[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'categories'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        });
      });
      callback(items);
    },
    (error) => {
      console.warn('Categories subscription note:', error.message);
      if (onError) onError(error);
      callback(
        INITIAL_CATEGORIES.map((c, idx) => ({
          ...c,
          id: `cat-${idx}`,
        }))
      );
    }
  );
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const path = 'categories';
  try {
    const docRef = await addDoc(collection(db, path), {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  const path = `categories/${id}`;
  try {
    const cleanUpdates: Record<string, any> = {};
    if (category.name !== undefined) cleanUpdates.name = category.name;
    if (category.slug !== undefined) cleanUpdates.slug = category.slug;
    if (category.description !== undefined) cleanUpdates.description = category.description;
    await updateDoc(doc(db, 'categories', id), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// ORDERS
// ==========================================
export function subscribeOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'orders'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          orderRef: data.orderRef || '',
          customerName: data.customerName || '',
          customerLocation: data.customerLocation || '',
          customerWhatsapp: data.customerWhatsapp || '',
          items: Array.isArray(data.items) ? data.items : [],
          subtotal: Number(data.subtotal) || 0,
          total: Number(data.total) || 0,
          paymentMethod: data.paymentMethod || 'Bank Transfer',
          paymentStatus: data.paymentStatus || 'Pending',
          orderStatus: data.orderStatus || 'Pending',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        });
      });
      // Sort in memory by createdAt descending
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export async function createGuestOrder(orderData: {
  orderRef: string;
  customerName: string;
  customerLocation: string;
  customerWhatsapp: string;
  items: Order['items'];
  subtotal: number;
  total: number;
  paymentMethod?: string;
}): Promise<string> {
  const path = 'orders';
  try {
    // Generate order document ID
    const newDocRef = doc(collection(db, 'orders'));
    await setDoc(newDocRef, {
      orderRef: orderData.orderRef,
      customerName: orderData.customerName.trim(),
      customerLocation: orderData.customerLocation.trim(),
      customerWhatsapp: orderData.customerWhatsapp.trim(),
      items: orderData.items,
      subtotal: Number(orderData.subtotal),
      total: Number(orderData.total),
      paymentMethod: orderData.paymentMethod || 'Bank Transfer',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatus(
  orderId: string,
  updates: {
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
  }
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const clean: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.paymentStatus) clean.paymentStatus = updates.paymentStatus;
    if (updates.orderStatus) clean.orderStatus = updates.orderStatus;
    await updateDoc(doc(db, 'orders', orderId), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// IMAGE UPLOAD TO FIREBASE STORAGE
// ==========================================
export async function uploadImageToStorage(
  file: File,
  folder = 'products'
): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Please select a JPG, PNG, or WebP image.');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB. Please upload a smaller image.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

// ==========================================
// INITIAL SEEDING HELPER
// ==========================================
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (snap.empty) {
      // 1. Seed store settings & banner settings
      await setDoc(doc(db, 'settings', 'store'), {
        ...DEFAULT_STORE_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'settings', 'banner'), {
        ...DEFAULT_BANNER_SETTINGS,
        updatedAt: new Date().toISOString(),
      });

      // 2. Seed categories
      const categoryMap = new Map<string, string>();
      for (const cat of INITIAL_CATEGORIES) {
        const catRef = await addDoc(collection(db, 'categories'), {
          ...cat,
          createdAt: new Date().toISOString(),
        });
        categoryMap.set(cat.name, catRef.id);
      }

      // 3. Seed products
      for (const prod of INITIAL_PRODUCTS) {
        const catId = categoryMap.get(prod.categoryName) || '';
        await addDoc(collection(db, 'products'), {
          ...prod,
          categoryId: catId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Seed operation error (expected if non-admin or offline):', error);
    return false;
  }
}
