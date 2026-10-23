'use client';

import React from 'react';
import { Droplet, ShieldCheck, Truck, Sparkles, MessageSquare, Award, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '@/types';
import { cleanPhoneNumber } from '@/lib/format';

interface HeroProps {
  settings: StoreSettings;
  onShopNow: () => void;
}

export default function Hero({ settings, onShopNow }: HeroProps) {
  const phone = cleanPhoneNumber(settings.whatsappNumber || '2348039284712');

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-orange-50/30 to-white pt-8 pb-16 md:pt-14 md:pb-24 border-b border-orange-100/60">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-900 text-xs sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Direct Mill Extraction • 100% Pure Nigerian Red Palm Oil</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12]">
              Fresh, Pure &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-amber-800">
                Unadulterated
              </span>{' '}
              Palm Oil
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {settings.storeDescription ||
                "Carefully pressed from sun-ripened Nigerian oil palm fruits. Rich in natural carotene, thick consistency, aromatic flavour, and zero chemical additives or artificial coloring."}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-base shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
              >
                Shop Available Sizes
              </button>

              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(
                  "Hello Kenny's Premium Palm Oil, I'd like to place an order or ask a question."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-bold text-base border-2 border-stone-200 hover:border-orange-300 shadow-xs flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Trust Points */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Zero Sudan Red Dye</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Food-Grade Packaging</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Nationwide Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Product Showcase Card */}
              <div className="relative rounded-3xl overflow-hidden bg-white border border-orange-100 shadow-2xl p-4 sm:p-5">
                <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-stone-100 group">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                    alt="Pure Nigerian Red Palm Oil"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 bg-amber-950/90 backdrop-blur-md text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-orange-400" />
                    <span>Grade 1 Palm Oil</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs uppercase font-extrabold tracking-wider text-orange-300">
                      Signature Quality
                    </p>
                    <h3 className="text-xl font-bold">Kenny&apos;s Premium Collection</h3>
                    <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                      Deep, ruby-red palm oil with thick viscosity and authentic traditional aroma for wholesome Nigerian delicacies.
                    </p>
                  </div>
                </div>

                {/* Sub-features beneath image */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center divide-x divide-stone-100">
                  <div className="px-1">
                    <p className="text-lg font-black text-orange-600">100%</p>
                    <p className="text-[11px] font-semibold text-stone-600">Pure &amp; Natural</p>
                  </div>
                  <div className="px-1">
                    <p className="text-lg font-black text-amber-800">5+ Sizes</p>
                    <p className="text-[11px] font-semibold text-stone-600">1L to 25L Kegs</p>
                  </div>
                  <div className="px-1">
                    <p className="text-lg font-black text-stone-900">24/48h</p>
                    <p className="text-[11px] font-semibold text-stone-600">Door Dispatch</p>
                  </div>
                </div>
              </div>

              {/* Floating Benefit Sticker */}
              <div className="hidden sm:flex items-center gap-3 absolute -bottom-5 -left-5 bg-stone-900 text-white p-3.5 rounded-2xl shadow-xl border border-stone-800">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold">Tested &amp; Guaranteed</p>
                  <p className="text-[11px] text-stone-300">No water dilution • No coloring</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Key Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-orange-100">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-orange-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <Droplet className="w-6 h-6 fill-orange-600/20" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Natural &amp; Unbleached</h4>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">
              Extracted from high-yielding oil palms. Rich in beta-carotene, Vitamin E, and antioxidants for nutritious traditional cooking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-orange-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Food-Grade Secure Packaging</h4>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">
              Bottled and kegged in brand new, tamper-evident food-grade containers so your oil arrives leak-free, clean, and ready to use.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-orange-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Flexible Delivery &amp; Pickup</h4>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">
              Doorstep rider delivery in Lagos, verified bus park dispatch to all 36 states, or local pickup at our market depot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
