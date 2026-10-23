'use client';

import React, { useState } from 'react';
import {
  Building,
  Check,
  AlertCircle,
  Loader2,
  MapPin,
  FileText,
} from 'lucide-react';
import { StoreSettings } from '@/types';
import { updateStoreSettings } from '@/lib/services';

interface AdminSettingsProps {
  settings: StoreSettings;
}

export default function AdminSettings({ settings }: AdminSettingsProps) {
  return <SettingsForm key={settings.updatedAt || 'default-settings'} settings={settings} />;
}

function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [storeDescription, setStoreDescription] = useState(settings.storeDescription || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [bankName, setBankName] = useState(settings.bankName || '');
  const [bankAccountName, setBankAccountName] = useState(settings.bankAccountName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankAccountNumber || '');
  const [pickupAddress, setPickupAddress] = useState(settings.pickupAddress || '');
  const [deliveryInfo, setDeliveryInfo] = useState(settings.deliveryInfo || '');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || '');
  const [logoUrl] = useState(settings.logoUrl || '');
  const [bannerUrl] = useState(settings.bannerUrl || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      await updateStoreSettings({
        businessName: businessName.trim(),
        storeDescription: storeDescription.trim(),
        whatsappNumber: whatsappNumber.trim(),
        bankName: bankName.trim(),
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        pickupAddress: pickupAddress.trim(),
        deliveryInfo: deliveryInfo.trim(),
        supportEmail: supportEmail.trim(),
        logoUrl,
        bannerUrl,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Settings update error:', err);
      setErrorMsg(err.message || 'Failed to update store settings in Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Store Settings</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Configure business details, WhatsApp ordering phone number, and official bank transfer accounts
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Store settings saved to Firestore! Live customer site and checkout updated instantly.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Store Profile &amp; Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Store / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Store Description (Appears on Homepage &amp; Footer)
              </label>
              <textarea
                rows={3}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Business WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+2348039284712"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:border-orange-500"
              />
              <p className="text-[11px] text-stone-500">
                Customer checkout sends formatted orders directly to this WhatsApp number.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Bank Transfer Details (Crucial for checkout sync) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-orange-600" />
            <span>Official Bank Account (Displayed in Checkout Step 2)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Guaranty Trust Bank (GTBank)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kenny's Premium Agro"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Account Number (10 digits) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="0281947382"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-mono font-black text-orange-700 tracking-wider focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Physical Location & Logistics */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Depot Location &amp; Logistics Coverage</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Physical Depot / Pickup Address
              </label>
              <textarea
                rows={2}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Delivery Instructions &amp; Coverage Note
              </label>
              <textarea
                rows={2}
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Store Settings...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
