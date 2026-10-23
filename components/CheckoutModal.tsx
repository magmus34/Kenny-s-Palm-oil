'use client';

import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  Building,
  CreditCard,
  User,
  MapPin,
  Phone,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { StoreSettings, Product, OrderItem } from '@/types';
import { formatNaira, generateOrderRef, buildWhatsAppOrderUrl } from '@/lib/format';
import { createGuestOrder } from '@/lib/services';

interface CheckoutModalProps {
  settings: StoreSettings;
  liveProducts: Product[];
  onOrderSuccess: (orderRef: string, whatsappUrl: string) => void;
}

export default function CheckoutModal({
  settings,
  liveProducts,
  onOrderSuccess,
}: CheckoutModalProps) {
  const {
    cart,
    isCheckoutOpen,
    resetCheckout,
    checkoutStep,
    setCheckoutStep,
    customerDetails,
    setCustomerDetails,
    subtotal,
    clearCart,
    validateCartItems,
  } = useCart();

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    location?: string;
    whatsapp?: string;
    general?: string;
  }>({});

  if (!isCheckoutOpen) return null;

  // Step 1 Validation
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!customerDetails.name.trim() || customerDetails.name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 letters).';
    }
    if (!customerDetails.location.trim() || customerDetails.location.trim().length < 3) {
      errors.location = 'Please enter your delivery city or address in Nigeria.';
    }
    const cleanPhone = customerDetails.whatsapp.replace(/\D/g, '');
    if (!customerDetails.whatsapp.trim() || cleanPhone.length < 8) {
      errors.whatsapp = 'Please provide a valid WhatsApp phone number.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setCheckoutStep(2);
  };

  // Copy Account Number
  const handleCopyAccountNumber = () => {
    if (!settings.bankAccountNumber) return;
    navigator.clipboard.writeText(settings.bankAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Step 2 Submission & WhatsApp Trigger
  const handleOrderOnWhatsApp = async () => {
    setSubmitting(true);
    setFormErrors({});

    try {
      // 1. Verify availability and live pricing
      const { validItems, issues } = validateCartItems(liveProducts);
      if (issues.length > 0) {
        setFormErrors({
          general: `Cart verification issue: ${issues[0]} Please review your items.`,
        });
        setSubmitting(false);
        return;
      }

      if (validItems.length === 0) {
        setFormErrors({ general: 'Your cart has no active items. Please add products.' });
        setSubmitting(false);
        return;
      }

      // Re-calculate total from live validated items
      const validatedTotal = validItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // 2. Generate unique order reference
      const orderRef = generateOrderRef();

      // 3. Prepare order items snapshot
      const orderItems: OrderItem[] = validItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        volume: item.product.volume || '1L',
        imageUrl: item.product.imageUrl || '',
      }));

      // 4. Save order to Firestore
      await createGuestOrder({
        orderRef,
        customerName: customerDetails.name.trim(),
        customerLocation: customerDetails.location.trim(),
        customerWhatsapp: customerDetails.whatsapp.trim(),
        items: orderItems,
        subtotal: validatedTotal,
        total: validatedTotal,
        paymentMethod: 'Bank Transfer',
      });

      // 5. Build WhatsApp message and URL
      const whatsappUrl = buildWhatsAppOrderUrl({
        orderRef,
        customerName: customerDetails.name.trim(),
        customerLocation: customerDetails.location.trim(),
        customerWhatsapp: customerDetails.whatsapp.trim(),
        cart: validItems,
        total: validatedTotal,
        settings,
      });

      // 6. Clear cart and transition to success modal
      clearCart();
      resetCheckout();

      // Open WhatsApp in a new tab
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }

      onOrderSuccess(orderRef, whatsappUrl);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      setFormErrors({
        general:
          error?.message?.includes('Missing or insufficient permissions')
            ? 'Order submission failed: permissions error. Please check store settings.'
            : 'Could not record your order right now. Please check your internet connection or contact us directly on WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={resetCheckout}
      />

      <div className="min-h-screen px-4 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100 animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                Step {checkoutStep} of 2
              </span>
              <h3 className="text-xl font-black text-white">
                {checkoutStep === 1 ? 'Guest Checkout Details' : 'Bank Transfer & WhatsApp Order'}
              </h3>
            </div>
            <button
              onClick={resetCheckout}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-2 text-xs font-bold border-b border-stone-200 text-center">
            <div
              className={`py-2.5 border-b-2 flex items-center justify-center gap-1.5 ${
                checkoutStep === 1
                  ? 'border-orange-600 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-stone-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white inline-flex items-center justify-center text-[11px]">
                1
              </span>
              <span>1. Your Information</span>
            </div>
            <div
              className={`py-2.5 border-b-2 flex items-center justify-center gap-1.5 ${
                checkoutStep === 2
                  ? 'border-orange-600 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-stone-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] ${
                  checkoutStep === 2 ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                2
              </span>
              <span>2. Payment &amp; Send</span>
            </div>
          </div>

          {/* General error banner */}
          {formErrors.general && (
            <div className="m-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formErrors.general}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: GUEST CHECKOUT POPUP */}
          {/* ======================================================== */}
          {checkoutStep === 1 && (
            <form onSubmit={handleContinueToPayment} className="p-6 space-y-5">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Fast Guest Checkout</p>
                  <p className="text-amber-800 mt-0.5">
                    No account registration or password required. Please enter accurate details for delivery dispatch.
                  </p>
                </div>
              </div>

              {/* Field 1: Customer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Funke Adeleke"
                    value={customerDetails.name}
                    onChange={(e) => {
                      setCustomerDetails((prev) => ({ ...prev, name: e.target.value }));
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 ${
                      formErrors.name ? 'border-red-500' : 'border-stone-200 focus:border-orange-500'
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-red-600 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Field 2: Customer Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Delivery Location (City / State / Address) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Lekki Phase 1, Lagos or Central Area, Abuja"
                    value={customerDetails.location}
                    onChange={(e) => {
                      setCustomerDetails((prev) => ({ ...prev, location: e.target.value }));
                      if (formErrors.location)
                        setFormErrors((prev) => ({ ...prev, location: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 ${
                      formErrors.location
                        ? 'border-red-500'
                        : 'border-stone-200 focus:border-orange-500'
                    }`}
                  />
                </div>
                {formErrors.location && (
                  <p className="text-xs text-red-600 font-medium">{formErrors.location}</p>
                )}
              </div>

              {/* Field 3: Customer WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  WhatsApp Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0803 123 4567 or +234 803 123 4567"
                    value={customerDetails.whatsapp}
                    onChange={(e) => {
                      setCustomerDetails((prev) => ({ ...prev, whatsapp: e.target.value }));
                      if (formErrors.whatsapp)
                        setFormErrors((prev) => ({ ...prev, whatsapp: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 ${
                      formErrors.whatsapp
                        ? 'border-red-500'
                        : 'border-stone-200 focus:border-orange-500'
                    }`}
                  />
                </div>
                {formErrors.whatsapp && (
                  <p className="text-xs text-red-600 font-medium">{formErrors.whatsapp}</p>
                )}
              </div>

              {/* Cart Quick Summary */}
              <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-xs text-stone-700">
                <span>
                  Items Total ({cart.reduce((a, b) => a + b.quantity, 0)} units):
                </span>
                <span className="font-extrabold text-stone-900 text-sm">
                  {formatNaira(subtotal)}
                </span>
              </div>

              {/* Button: Continue to Payment */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PAYMENT DETAILS POPUP */}
          {/* ======================================================== */}
          {checkoutStep === 2 && (
            <div className="p-6 space-y-5">
              {/* Back to Step 1 button */}
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Customer Details ({customerDetails.name || 'Guest'})</span>
              </button>

              {/* Bank Details Card (Live from Store Settings) */}
              <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-700">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-400" />
                    <span className="text-xs uppercase font-bold tracking-wider text-orange-300">
                      Official Bank Transfer Details
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-300">Direct Bank Deposit / Transfer</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Bank Name:</span>
                    <span className="font-extrabold text-white text-sm">
                      {settings.bankName || 'Guaranty Trust Bank'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Account Name:</span>
                    <span className="font-bold text-white text-sm truncate block">
                      {settings.bankAccountName || "Kenny's Premium Palm Oil"}
                    </span>
                  </div>
                </div>

                {/* Account Number with 1-Click Copy */}
                <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Account Number
                    </span>
                    <p className="font-mono text-lg font-black tracking-widest text-orange-400">
                      {settings.bankAccountNumber || '0123456789'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccountNumber}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/70 space-y-2.5 max-h-48 overflow-y-auto">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider pb-1 border-b border-stone-200 flex justify-between">
                  <span>Ordered Items</span>
                  <span>Price</span>
                </div>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center text-xs text-stone-800"
                  >
                    <div>
                      <span className="font-bold text-stone-900">{item.product.name}</span>
                      <span className="text-stone-500 block text-[11px]">
                        {item.product.volume || '1L'} × {item.quantity} @ {formatNaira(item.product.price)}
                      </span>
                    </div>
                    <span className="font-extrabold text-stone-900">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-base font-extrabold text-stone-900">
                  <span>Total Due:</span>
                  <span className="text-xl text-orange-600 font-black">{formatNaira(subtotal)}</span>
                </div>
              </div>

              {/* Transfer Instruction */}
              <p className="text-xs text-stone-600 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900">Transfer Note:</span> Please make a transfer of{' '}
                <strong className="text-orange-700">{formatNaira(subtotal)}</strong> to the bank details above.
                Then click &quot;Payment Done&quot; below to generate your unique order and send your proof on WhatsApp.
              </p>

              {/* Order on WhatsApp button */}
              <button
                type="button"
                onClick={handleOrderOnWhatsApp}
                disabled={submitting}
                className="w-full py-4 px-6 rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-extrabold text-base shadow-lg shadow-green-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying &amp; Recording Order...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Payment Done</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
