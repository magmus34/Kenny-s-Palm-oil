'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Droplet, ArrowRight, Sparkles } from 'lucide-react';
import { StoreSettings } from '@/types';

interface BannerProps {
  settings: StoreSettings;
  onShopClick?: () => void;
}

export default function Banner({ settings, onShopClick }: BannerProps) {
  const slides = [
    {
      id: 1,
      badge: 'Fresh 2026 Harvest',
      title: "Kenny's Premium Palm Oil",
      subtitle: '100% Pure & Unadulterated • Direct Mill Extraction from Edo & Ondo',
      buttonText: 'Shop All Sizes',
      bgGradient: 'from-amber-950 via-stone-900 to-orange-950',
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 2,
      badge: 'Wholesale & Retail',
      title: 'Bulk & Family Gallons',
      subtitle: 'Available in 1L Bottles, 2L Jugs, 5L Gallons & 25L Industrial Kegs',
      buttonText: 'Order Now',
      bgGradient: 'from-stone-900 via-amber-950 to-stone-900',
      image:
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden bg-stone-900 text-white select-none">
      <div className="relative h-48 sm:h-64 md:h-80 w-full flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transition-all duration-700 opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/85 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-xl leading-tight">
            {slide.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-300 mt-1.5 sm:mt-2 max-w-lg line-clamp-2 leading-relaxed">
            {slide.subtitle}
          </p>

          <button
            onClick={onShopClick}
            className="mt-3 sm:mt-5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>{slide.buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 right-4 sm:right-8 z-10 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-6 bg-emerald-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
