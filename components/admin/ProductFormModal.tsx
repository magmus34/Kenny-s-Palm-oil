'use client';

import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle, Check, Sparkles } from 'lucide-react';
import { Product, Category } from '@/types';
import { addProduct, updateProduct, uploadImageToStorage } from '@/lib/services';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

// Preset authentic Nigerian palm oil images for instant convenience
const PALM_OIL_PRESETS = [
  {
    label: '1L Retail Bottle',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '2L Handled Gallon',
    url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '5L Yellow Gallon',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '10L Chef Keg',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '25L Heavy Duty Drum',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
];

export default function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <ProductFormInner
      key={productToEdit?.id || 'new-product-form'}
      onClose={onClose}
      productToEdit={productToEdit}
      categories={categories}
      onSuccess={onSuccess}
    />
  );
}

function ProductFormInner({
  onClose,
  productToEdit,
  categories,
  onSuccess,
}: {
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}) {
  const isEditing = Boolean(productToEdit);

  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit ? String(productToEdit.price) : '');
  const [categoryId, setCategoryId] = useState(
    productToEdit?.categoryId || categories[0]?.id || ''
  );
  const [volume, setVolume] = useState(productToEdit?.volume || '1 Litre Bottle');
  const [stockQuantity, setStockQuantity] = useState(
    productToEdit ? String(productToEdit.stockQuantity) : '25'
  );
  const [imageUrl, setImageUrl] = useState(
    productToEdit?.imageUrl || PALM_OIL_PRESETS[0].url
  );
  const [isAvailable, setIsAvailable] = useState(productToEdit?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured ?? false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle device file upload with instant local preview and fast server storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant local preview so the user sees the photo immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setImageUrl(localPreviewUrl);
    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const permanentUrl = await uploadImageToStorage(file, 'products');
      setImageUrl(permanentUrl);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMsg(err.message || 'Failed to process image. You can still use preset images or try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stockQuantity, 10);

    // Validation
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid price in Naira greater than 0.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('Stock quantity cannot be negative.');
      return;
    }
    if (!imageUrl) {
      setErrorMsg('Please upload an image or choose one from the presets.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : 'General Palm Oil';

    setSaving(true);

    try {
      if (isEditing && productToEdit) {
        await updateProduct(productToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          categoryId,
          categoryName,
          volume,
          stockQuantity: stockNum,
          imageUrl,
          isAvailable,
          isFeatured,
        });
      } else {
        await addProduct({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          categoryId,
          categoryName,
          volume,
          stockQuantity: stockNum,
          imageUrl,
          isAvailable,
          isFeatured,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Product save error:', err);
      setErrorMsg(err.message || 'Failed to save product to Firestore database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-screen px-4 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                Product Inventory
              </span>
              <h3 className="text-xl font-black text-white">
                {isEditing ? 'Edit Palm Oil Product' : 'Add New Palm Oil Product'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Palm Oil - 5 Litres Big Gallon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Price in NGN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Price in Naira (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  required
                  placeholder="e.g. 14500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Volume / Packaging */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Volume / Container Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1L, 2.5L, 5 Litres Gallon, 25L Keg"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-white focus:border-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Available Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 35"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Product Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe extraction, quality, taste, culinary uses, packaging..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:border-orange-500"
              />
            </div>

            {/* Image Upload Area */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Product Photography
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Image Preview Box */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border-2 border-stone-200 shrink-0 relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-1">
                      <Loader2 className="w-5 h-5 animate-spin text-red-400 mb-1" />
                      <span className="text-[9px] font-bold text-center leading-tight">Optimizing...</span>
                    </div>
                  )}
                </div>

                {/* Upload from Device File Input */}
                <div className="flex-1 w-full space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-300 hover:border-red-500 rounded-2xl cursor-pointer text-xs font-bold text-stone-700 hover:text-red-600 bg-stone-50/50 hover:bg-red-50/30 transition-all">
                    <Upload className="w-4 h-4 text-red-600" />
                    <span>
                      {uploadingImage ? 'Uploading & Processing...' : 'Upload Image from Device (JPG/PNG/WebP)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Fast auto-compression & permanent cloud storage. Ready instantly.
                  </p>
                </div>
              </div>

              {/* Or Select from Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Or select authentic palm oil photo asset:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PALM_OIL_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-orange-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkboxes: Available & Featured */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-6 text-xs font-bold text-stone-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded-md border-stone-300 focus:ring-orange-500"
                />
                <span>Available for Customer Purchase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded-md border-stone-300 focus:ring-orange-500"
                />
                <span className="flex items-center gap-1 text-orange-800">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Feature on Homepage</span>
                </span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || uploadingImage}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-xs shadow-md shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
