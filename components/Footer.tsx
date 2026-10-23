'use client';

import React from 'react';
import Link from 'next/link';
import { Droplet, Phone, MapPin, Mail, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { StoreSettings } from '@/types';
import { cleanPhoneNumber } from '@/lib/format';

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  const phone = cleanPhoneNumber(settings.whatsappNumber || '2348039284712');

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <Droplet className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  {settings.businessName || "Kenny's Palm Oil"}
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                  Premium Nigerian Red Palm Oil
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {settings.storeDescription ||
                "Pure, natural Nigerian palm oil extracted from sun-ripened oil palm fruit bunches. 100% unadulterated, unbleached, with zero chemical additives."}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Certified NIFOR Grade Quality</span>
            </div>
          </div>

          {/* Contact & Orders */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-2">
              WhatsApp &amp; Orders
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Direct Order Hotline:</span>
                  <a
                    href={`https://wa.me/${phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white hover:text-orange-400 transition-colors"
                  >
                    {settings.whatsappNumber || '+234 803 928 4712'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Support Email:</span>
                  <span className="text-stone-300">
                    {settings.supportEmail || 'orders@kennyspalmoil.ng'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Market Depot / Pickup:</span>
                  <span className="text-stone-300">
                    {settings.pickupAddress || 'Shop 14, Mile 12 Market Complex, Lagos, Nigeria'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Payment Reference */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-2">
              Official Bank Details
            </h4>
            <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700/80 space-y-2 text-xs">
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">
                  Bank Name
                </span>
                <p className="font-bold text-white text-sm">
                  {settings.bankName || 'Guaranty Trust Bank'}
                </p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">
                  Account Name
                </span>
                <p className="font-semibold text-stone-200">
                  {settings.bankAccountName || "Kenny's Premium Agro"}
                </p>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">
                  Account Number
                </span>
                <p className="font-mono text-base font-black text-orange-400 tracking-wider">
                  {settings.bankAccountNumber || '0281947382'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Navigation & Admin Access */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-stone-800 pb-2">
              Customer Shopping
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalog" className="hover:text-orange-400 transition-colors">
                  Available Sizes &amp; Kegs
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-orange-400 transition-colors">
                  Quality &amp; Extraction Process
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${phone}?text=${encodeURIComponent(
                    "Hello, I need bulk wholesale pricing for 50+ kegs."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1 text-orange-400"
                >
                  <span>Wholesale &amp; Catering Bulk Inquiry</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-4 border-t border-stone-800">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs font-semibold"
                >
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Admin Dashboard Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} {settings.businessName || "Kenny's Premium Palm Oil"}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span>Powered by Firebase &amp; Next.js</span>
            <span>•</span>
            <span>Proudly Nigerian Agro Business 🇳🇬</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
