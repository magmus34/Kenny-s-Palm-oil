'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, ChevronDown, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { StoreSettings } from '@/types';

interface NavbarProps {
  settings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ settings, searchQuery, setSearchQuery }: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Avatar & Name */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-700 p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              <img
                src={
                  settings.logoUrl ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'
                }
                alt={settings.businessName || "Kenny's Palm Oil"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="hidden xs:block">
              <span className="font-extrabold text-stone-900 text-sm tracking-tight block leading-tight">
                {settings.businessName || "Kenny's Palm Oil"}
              </span>
              <span className="text-[10px] text-red-700 font-bold block uppercase tracking-wider">
                100% Pure • Nigerian
              </span>
            </div>
          </Link>

          {/* Center or Mobile Search Bar (if active) */}
          {showSearch ? (
            <div className="flex-1 max-w-md mx-2 relative animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search sizes (1L, 5L, 25L Keg)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-full bg-stone-100 text-xs text-stone-900 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-red-600"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 max-w-xs mx-4 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sizes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-stone-100 text-xs text-stone-900 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-red-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Right: Currency (NGN with Nigerian Flag) + Search icon + User/Admin icon + Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Currency Pill: 🇳🇬 NGN */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold text-stone-800 bg-stone-50 border border-stone-200 select-none">
              <span className="text-sm">🇳🇬</span>
              <span className="text-xs text-red-800 font-extrabold">NGN</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </div>

            {/* Search Icon Toggle (on mobile / small screen) */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 text-stone-700 hover:text-red-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              title="Search Products"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Cart Icon with Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 text-stone-800 hover:text-red-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
