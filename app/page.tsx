'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeStoreSettings,
  subscribeBannerSettings,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_BANNER_SETTINGS,
  seedInitialDataIfEmpty,
} from '@/lib/services';
import { Product, Category, StoreSettings, BannerSettings } from '@/types';
import { PackageOpen, Sparkles, Phone, Lock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>(DEFAULT_BANNER_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Checkout Success modal state
  const [successOrderRef, setSuccessOrderRef] = useState<string | null>(null);
  const [successWhatsappUrl, setSuccessWhatsappUrl] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore synchronization
  useEffect(() => {
    seedInitialDataIfEmpty().catch(() => {});

    const unsubSettings = subscribeStoreSettings((data) => {
      setSettings(data);
    });

    const unsubBanner = subscribeBannerSettings((data) => {
      setBannerSettings(data);
    });

    const unsubCategories = subscribeCategories((data) => {
      setCategories(data);
    });

    const unsubProducts = subscribeProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubBanner();
      unsubCategories();
      unsubProducts();
    };
  }, []);

  const handleScrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter products by availability and search/category
  const filteredProducts = products.filter((product) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.volume?.toLowerCase().includes(term) ||
      product.categoryName?.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <Navbar
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Promotional Top Banner */}
      <Banner
        settings={settings}
        bannerSettings={bannerSettings}
        onShopClick={handleScrollToCatalog}
      />

      {/* Main Shopping Area */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 w-full py-4 sm:py-6 space-y-4">
        {/* Category Pills Bar (Horizontal scrollable on mobile) */}
        <div ref={catalogRef} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Products
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search status if searching */}
        {searchQuery && (
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-600">
            <span>
              Search for: <strong>&quot;{searchQuery}&quot;</strong> ({filteredProducts.length} items)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-700 font-bold hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Simple 2-column mobile grid (responsive 2-4 cols on desktop) matching screenshot */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 space-y-2 animate-pulse">
                <div className="aspect-square bg-stone-200 rounded-lg" />
                <div className="h-3 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
                <div className="h-8 bg-stone-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <PackageOpen className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="font-bold text-stone-800 text-sm">No products found</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {searchQuery
                ? `No products match "${searchQuery}".`
                : 'Products are being updated in the database.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFloatingButton whatsappNumber={settings.whatsappNumber} />

      {/* Simple Clean Bottom Bar */}
      <footer className="mt-12 py-6 border-t border-stone-200/80 bg-white text-center text-xs text-stone-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-medium">
          <span>{settings.businessName || "Kenny's Premium Palm Oil"}</span>
          <span>•</span>
          <span>Hotline: {settings.whatsappNumber || '+234 803 928 4712'}</span>
          <span>•</span>
          <Link href="/admin" className="text-stone-400 hover:text-emerald-700 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Admin
          </Link>
        </div>
        <div className="flex justify-center">
          <div className="inline-block px-4 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-mono border border-stone-200">
            kennyspalmoil.ng
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Two-step Guest Checkout Modal */}
      <CheckoutModal
        settings={settings}
        liveProducts={products}
        onOrderSuccess={(refCode, url) => {
          setSuccessOrderRef(refCode);
          setSuccessWhatsappUrl(url);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        orderRef={successOrderRef}
        whatsappUrl={successWhatsappUrl}
        settings={settings}
        onClose={() => {
          setSuccessOrderRef(null);
          setSuccessWhatsappUrl(null);
        }}
      />
    </div>
  );
}
