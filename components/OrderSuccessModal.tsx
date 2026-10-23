'use client';

import React from 'react';
import { CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { StoreSettings } from '@/types';

interface OrderSuccessModalProps {
  orderRef: string | null;
  whatsappUrl: string | null;
  settings: StoreSettings;
  onClose: () => void;
}

export default function OrderSuccessModal({
  orderRef,
  whatsappUrl,
  settings,
  onClose,
}: OrderSuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!orderRef) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-screen px-4 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100 p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          {/* Animated Success Icon */}
          <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">Order Placed Successfully!</h3>
            <p className="text-sm text-stone-600 mt-1">
              Your order has been recorded into our database. Please complete your order on WhatsApp to confirm delivery.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-700">
                Order Reference Code
              </span>
              <p className="font-mono text-xl font-black text-stone-900 tracking-wider">
                {orderRef}
              </p>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-2 rounded-xl bg-white border border-orange-200 text-stone-700 hover:text-orange-600 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Copy Reference"
            >
              {copied ? <Check className="w-4 h-4 text-red-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Next Steps Card */}
          <div className="bg-stone-50 rounded-2xl p-4 text-left space-y-2 border border-stone-200 text-xs text-stone-700">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Next Steps to Dispatch:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-600">
              <li>Open WhatsApp with our prepared message.</li>
              <li>Send your bank transfer payment proof/receipt.</li>
              <li>Our team confirms payment and dispatches your palm oil!</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Open WhatsApp Now</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
