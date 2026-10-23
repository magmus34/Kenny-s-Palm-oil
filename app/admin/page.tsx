'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminSalesSummary from '@/components/admin/AdminSalesSummary';
import ProductFormModal from '@/components/admin/ProductFormModal';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeOrders,
  subscribeStoreSettings,
  seedInitialDataIfEmpty,
  DEFAULT_STORE_SETTINGS,
} from '@/lib/services';
import { Product, Category, Order, StoreSettings } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Firestore real-time listeners (attached only when admin is authenticated)
  useEffect(() => {
    if (!isAdmin) return;

    // Check if initial seeding is needed
    (async () => {
      try {
        const didSeed = await seedInitialDataIfEmpty();
        if (didSeed) {
          console.log('Initial Kenny\'s Palm Oil data seeded into Firestore.');
        }
      } catch (err) {
        console.warn('Seed note:', err);
      }
    })();

    const unsubSettings = subscribeStoreSettings(
      (data) => setSettings(data),
      (err) => console.error('Settings subscribe error:', err)
    );

    const unsubProducts = subscribeProducts(
      (data) => {
        setProducts(data);
        setDataLoaded(true);
      },
      (err) => console.error('Products subscribe error:', err)
    );

    const unsubCategories = subscribeCategories(
      (data) => setCategories(data),
      (err) => console.error('Categories subscribe error:', err)
    );

    const unsubOrders = subscribeOrders(
      (data) => setOrders(data),
      (err) => console.error('Orders subscribe error:', err)
    );

    return () => {
      unsubSettings();
      unsubProducts();
      unsubCategories();
      unsubOrders();
    };
  }, [isAdmin]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">
          Verifying Admin Authorization...
        </p>
      </div>
    );
  }

  // Not authenticated or not an authorized admin
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending').length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {currentTab === 'overview' && (
            <AdminOverview
              products={products}
              orders={orders}
              settings={settings}
              setCurrentTab={setCurrentTab}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
            />
          )}

          {currentTab === 'products' && (
            <AdminProducts products={products} categories={categories} />
          )}

          {currentTab === 'categories' && <AdminCategories categories={categories} />}

          {currentTab === 'orders' && <AdminOrders orders={orders} />}

          {currentTab === 'settings' && <AdminSettings settings={settings} />}

          {currentTab === 'sales' && (
            <AdminSalesSummary orders={orders} products={products} />
          )}
        </div>
      </main>

      {/* Quick Add Product Modal */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        onSuccess={() => {}}
      />
    </div>
  );
}
