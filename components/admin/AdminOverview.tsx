'use client';

import React from 'react';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Product, Order, StoreSettings } from '@/types';
import { formatNaira, formatDate } from '@/lib/format';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewProps {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  setCurrentTab: (tab: AdminTab) => void;
  onOpenAddProduct: () => void;
}

export default function AdminOverview({
  products,
  orders,
  settings,
  setCurrentTab,
  onOpenAddProduct,
}: AdminOverviewProps) {
  // Real-time calculations based strictly on saved orders
  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.isAvailable && p.stockQuantity > 0).length;
  const totalOrders = orders.length;

  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'Confirmed').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;

  // Real sales figures (Confirmed & Delivered orders with Confirmed payment)
  const confirmedRevenue = orders
    .filter((o) => o.paymentStatus === 'Confirmed' && o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const pendingRevenue = orders
    .filter((o) => o.paymentStatus === 'Pending' && o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl border border-stone-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-orange-400">
            Real-Time Store Operations
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {settings.businessName || "Kenny's Premium Palm Oil"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Live database sync with customer storefront. Manage inventory, process bank transfers, and dispatch palm oil orders.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddProduct}
            className="px-5 py-3 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Confirmed Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Confirmed Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-stone-900 tracking-tight">
              {formatNaira(confirmedRevenue)}
            </p>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              From verified payment transfers
            </p>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Pending Orders Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-700 tracking-tight">
              {formatNaira(pendingRevenue)}
            </p>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Awaiting bank receipt verification
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-stone-900 tracking-tight">{totalOrders}</p>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
              <span className="text-amber-600 font-bold">{pendingOrders} pending</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{confirmedOrders} confirmed</span>
            </div>
          </div>
        </div>

        {/* Products in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Active Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-stone-900 tracking-tight">{totalProducts}</p>
            <p className="text-xs text-stone-500 mt-1">
              <span className="text-stone-800 font-bold">{availableProducts}</span> in-stock &amp; available
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Order Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-amber-950">{pendingOrders}</p>
            <p className="text-xs font-semibold text-amber-800">Pending Orders</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-blue-950">{confirmedOrders}</p>
            <p className="text-xs font-semibold text-blue-800">Confirmed Orders</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-emerald-950">{deliveredOrders}</p>
            <p className="text-xs font-semibold text-emerald-800">Delivered Orders</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-stone-500 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">{cancelledOrders}</p>
            <p className="text-xs font-semibold text-stone-600">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Latest orders placed via guest checkout and WhatsApp
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('orders')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="text-sm font-semibold text-stone-700">No orders recorded yet</p>
            <p className="text-xs text-stone-500 mt-1">
              When customers checkout on the website, their orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Reference</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Customer</th>
                  <th className="py-3 px-4 font-bold">Location</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold">Payment</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                      {order.orderRef}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">{formatDate(order.createdAt)}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{order.customerName}</td>
                    <td className="py-3.5 px-4 text-stone-600 truncate max-w-[150px]">
                      {order.customerLocation}
                    </td>
                    <td className="py-3.5 px-4 font-black text-stone-900">
                      {formatNaira(order.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
