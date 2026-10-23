'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { StoreSettings, BannerSettings } from '@/types';
import { DEFAULT_BANNER_SETTINGS } from '@/lib/services';

interface BannerProps {
  settings?: StoreSettings;
  bannerSettings?: BannerSettings;
  onShopClick?: () => void;
}

export default function Banner({ bannerSettings, onShopClick }: BannerProps) {
  const current = bannerSettings || DEFAULT_BANNER_SETTINGS;

  // If administrator configured banner to be hidden, render nothing
  if (current.showBanner === false) {
    return null;
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    const link = current.buttonLink?.trim();
    if (!link || link === '#catalog' || link === '#products' || link === '#') {
      e.preventDefault();
      onShopClick?.();
    }
  };

  const isExternalLink = current.buttonLink?.startsWith('http');
  const targetLink = current.buttonLink?.trim() || '#catalog';

  return (
    <div className="relative w-full overflow-hidden bg-stone-900 text-white select-none">
      <div className="relative min-h-[190px] sm:min-h-[250px] md:min-h-[290px] w-full flex items-center py-8">
        {/* Background Image with Dark Vignette Overlay for Readability */}
        <div className="absolute inset-0">
          <img
            src={
              current.imageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'
            }
            alt={current.heading || "Kenny's Premium Palm Oil"}
            className="w-full h-full object-cover transition-all duration-700 opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-900/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center items-start">
          {current.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{current.badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-2xl leading-tight">
            {current.heading || "Kenny's Premium Palm Oil"}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-200 mt-2 sm:mt-3 max-w-xl line-clamp-3 leading-relaxed font-normal">
            {current.subtitle ||
              '100% Pure & Unadulterated • Direct Mill Extraction from Edo & Ondo states.'}
          </p>

          {current.showButton !== false && (
            <div className="mt-4 sm:mt-6">
              {isExternalLink ? (
                <a
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <span>{current.buttonText || 'Shop All Sizes'}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <span>{current.buttonText || 'Shop All Sizes'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
