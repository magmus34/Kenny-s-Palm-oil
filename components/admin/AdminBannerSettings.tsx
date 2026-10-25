'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { BannerSettings } from '@/types';
import { updateBannerSettings, uploadImageToStorage, DEFAULT_BANNER_SETTINGS } from '@/lib/services';

interface AdminBannerSettingsProps {
  bannerSettings: BannerSettings;
}

export default function AdminBannerSettings({
  bannerSettings: initialSettings,
}: AdminBannerSettingsProps) {
  const [formData, setFormData] = useState<BannerSettings>(
    initialSettings || DEFAULT_BANNER_SETTINGS
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if Firestore emits fresh settings
  const [prevSettings, setPrevSettings] = useState(initialSettings);
  if (initialSettings !== prevSettings) {
    setPrevSettings(initialSettings);
    setFormData(initialSettings);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview in the live banner preview panel
    const localPreviewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      imageUrl: localPreviewUrl,
    }));

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const permanentUrl = await uploadImageToStorage(file, 'banners');
      setFormData((prev) => ({
        ...prev,
        imageUrl: permanentUrl,
      }));
    } catch (err: any) {
      console.error('Banner image upload error:', err);
      setErrorMessage(err.message || 'Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await updateBannerSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save banner settings:', err);
      setErrorMessage(err.message || 'Could not save banner settings to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Reset banner settings to original defaults?')) {
      setFormData(DEFAULT_BANNER_SETTINGS);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-orange-600" />
            <span>Homepage Banner Settings</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage the headline, description, background image, and call-to-action button displayed on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Homepage banner settings successfully saved to Firestore and live on the storefront!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editable Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section: Visibility Controls */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              Banner Display Options
            </h2>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  {formData.showBanner ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-stone-400" />
                  )}
                  <span>Show Banner on Homepage</span>
                </span>
                <p className="text-[11px] text-stone-500">
                  Toggle whether the promotional hero banner is visible to visitors.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showBanner}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, showBanner: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-900">Show Action Button</span>
                <p className="text-[11px] text-stone-500">
                  Display the call-to-action button inside the banner.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showButton}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, showButton: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>

          {/* Section: Content Details */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              Banner Content & Copy
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Badge / Tagline (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh 2026 Harvest, 100% Pure Nigerian Oil"
                value={formData.badge || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, badge: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Banner Heading / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kenny's Premium Palm Oil"
                value={formData.heading}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, heading: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Banner Subtitle / Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the freshness, extraction origin, and purity..."
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section: Banner Image */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center justify-between">
              <span>Banner Background Image</span>
              <span className="text-[11px] text-stone-400 font-normal">Cloud Stored & Optimized</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Upload Image from Device
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-file-upload"
                  />
                  <label
                    htmlFor="banner-file-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-red-50/50 hover:border-red-400 text-stone-700 font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        <span>Optimizing & Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-red-600" />
                        <span>Select Banner Image...</span>
                      </>
                    )}
                  </label>
                  <span className="text-[11px] text-stone-400">JPG, PNG, or WebP (max 5MB)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Or Image Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
                />
              </div>

              {formData.imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 h-28 relative bg-stone-900">
                  <img
                    src={formData.imageUrl}
                    alt="Banner Preview Thumbnail"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/60 to-transparent flex items-center px-4">
                    <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                      Active Background Image
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Button Settings */}
          {formData.showButton && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 animate-in fade-in">
              <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
                Call-to-Action Button Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Button Label Text
                  </label>
                  <input
                    type="text"
                    required={formData.showButton}
                    placeholder="e.g. Shop All Sizes, Order Now"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, buttonText: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Button Destination / Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #catalog, /#products, or URL"
                    value={formData.buttonLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Banner Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Banner Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Storefront Preview */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-500">
                Live Storefront Preview
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  formData.showBanner
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {formData.showBanner ? 'Visible to Visitors' : 'Hidden from Visitors'}
              </span>
            </div>

            {formData.showBanner ? (
              <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 text-white min-h-[200px] flex flex-col justify-center p-5 shadow-inner">
                {/* Background Image */}
                <img
                  src={
                    formData.imageUrl ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={formData.heading}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-2">
                  {formData.badge && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>{formData.badge}</span>
                    </div>
                  )}

                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {formData.heading || "Kenny's Premium Palm Oil"}
                  </h3>

                  <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                    {formData.subtitle || 'Pure, natural Nigerian palm oil...'}
                  </p>

                  {formData.showButton && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-sm">
                        <span>{formData.buttonText || 'Shop Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-stone-100 border border-dashed border-stone-300 text-center space-y-2">
                <EyeOff className="w-8 h-8 mx-auto text-stone-400" />
                <p className="text-xs font-bold text-stone-700">Banner is Currently Hidden</p>
                <p className="text-[11px] text-stone-500">
                  Visitors on the homepage will see the category filter and product catalog directly beneath the header.
                </p>
              </div>
            )}

            <p className="text-[11px] text-stone-400 text-center italic">
              Changes saved will immediately sync across customer devices without rebuilding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
