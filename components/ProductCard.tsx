'use client';

import React, { useState } from 'react';
import { Lock, Check, Plus, Minus, X, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/cart-context';
import { formatNaira } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart, setIsCartOpen } = useCart();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = !product.isAvailable || product.stockQuantity <= 0;

  const existingInCart = cart.find((item) => item.product.id === product.id);
  const currentInCartQty = existingInCart ? existingInCart.quantity : 0;
  const availableStock = Math.max(0, product.stockQuantity - currentInCartQty);

  const handleSelectOptionsClick = () => {
    if (isOutOfStock) return;
    setShowOptionsModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (isOutOfStock || availableStock <= 0) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setShowOptionsModal(false);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <>
      <div className="flex flex-col justify-between bg-white rounded-xl overflow-hidden group">
        {/* Product Image */}
        <div
          onClick={handleSelectOptionsClick}
          className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 cursor-pointer"
        >
          <img
            src={
              product.imageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />

          {/* Volume tag if available */}
          {product.volume && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {product.volume}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pt-2.5 pb-3 space-y-1">
          <h3
            onClick={handleSelectOptionsClick}
            className="font-medium text-sm text-stone-900 line-clamp-1 cursor-pointer hover:text-emerald-700 transition-colors"
          >
            {product.name}
          </h3>

          <p className="font-extrabold text-stone-900 text-sm tracking-tight">
            {formatNaira(product.price)}
          </p>
        </div>

        {/* Action Button: Matches reference image styling */}
        <div className="w-full">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 px-3 rounded-lg border border-emerald-600/40 bg-white text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Out of Stock</span>
            </button>
          ) : (
            <button
              onClick={handleSelectOptionsClick}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
            >
              Select options
            </button>
          )}
        </div>
      </div>

      {/* Quick "Select Options" Modal Dialog */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowOptionsModal(false)}
          />

          <div className="min-h-screen px-4 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 border border-stone-100">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-emerald-700 font-extrabold text-sm">
                      {formatNaira(product.price)}
                    </p>
                    <p className="text-[11px] text-stone-500">{product.volume || '1L'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quantity Picker */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Select Quantity:
                </span>
                <div className="flex items-center justify-between bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-medium">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                      disabled={quantity >= availableStock}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 text-right">
                  Subtotal: <strong className="text-stone-900">{formatNaira(product.price * quantity)}</strong>
                </p>
              </div>

              {/* Confirm Add Button */}
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                disabled={justAdded || availableStock <= 0}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • {formatNaira(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
