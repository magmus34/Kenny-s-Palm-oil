'use client';

import React from 'react';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
} from 'lucide-react';
import { Order, Product } from '@/types';
import { formatNaira } from '@/lib/format';

interface AdminSalesSummaryProps {
  orders: Order[];
  products: Product[];
}

export default function AdminSalesSummary({ orders, products }: AdminSalesSummaryProps) {
  // Real calculations based ONLY on saved orders in Firestore
  const totalOrdersCount = orders.length;

  const confirmedPaidOrders = orders.filter(
    (o) => o.paymentStatus === 'Confirmed' && o.orderStatus !== 'Cancelled'
  );
  const pendingPaymentOrders = orders.filter(
    (o) => o.paymentStatus === 'Pending' && o.orderStatus !== 'Cancelled'
  );
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled');

  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');

  // Confirmed Revenue (strictly where paymentStatus === 'Confirmed')
  const confirmedSalesRevenue = confirmedPaidOrders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  // Pending Pipeline Value (orders placed but bank payment not yet confirmed)
  const pendingSalesValue = pendingPaymentOrders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  // Average Order Value for confirmed orders
  const averageOrderValue =
    confirmedPaidOrders.length > 0
      ? confirmedSalesRevenue / confirmedPaidOrders.length
      : 0;

  // Breakdown of volume sold across items
  const itemSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  orders.forEach((o) => {
    if (o.orderStatus === 'Cancelled') return;
    o.items?.forEach((it) => {
      const existing = itemSalesMap.get(it.productId) || {
        name: it.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += it.quantity;
      existing.revenue += it.price * it.quantity;
      itemSalesMap.set(it.productId, existing);
    });
  });

  const itemSalesList = Array.from(itemSalesMap.values()).sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Sales &amp; Revenue Analytics</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Calculated strictly from real saved Firestore order records
        </p>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Confirmed Sales */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Confirmed Paid Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-emerald-700 tracking-tight">
              {formatNaira(confirmedSalesRevenue)}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              From <strong className="text-stone-900">{confirmedPaidOrders.length}</strong> confirmed
              transfers
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Excludes all pending or cancelled orders</span>
          </div>
        </div>

        {/* Pending Orders Pipeline */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Pending Payment Pipeline
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-amber-700 tracking-tight">
              {formatNaira(pendingSalesValue)}
            </p>
            <p className="text-xs text-stone-600 mt-1">
              From <strong className="text-stone-900">{pendingPaymentOrders.length}</strong> orders
              awaiting bank receipt
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Requires admin confirmation in Orders tab</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-stone-900 tracking-tight">
              {formatNaira(averageOrderValue)}
            </p>
            <p className="text-xs text-stone-600 mt-1">Average basket size for confirmed orders</p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            <span>Based on verified transactions</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-stone-900 border-b border-stone-100 pb-3">
          Order Status Fulfillment Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-xs font-bold text-amber-800 uppercase">Pending</span>
            <p className="text-2xl font-black text-amber-950 mt-1">
              {orders.filter((o) => o.orderStatus === 'Pending').length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
            <span className="text-xs font-bold text-blue-800 uppercase">Confirmed</span>
            <p className="text-2xl font-black text-blue-950 mt-1">
              {orders.filter((o) => o.orderStatus === 'Confirmed').length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase">Delivered</span>
            <p className="text-2xl font-black text-emerald-950 mt-1">{deliveredOrders.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-center">
            <span className="text-xs font-bold text-stone-700 uppercase">Cancelled</span>
            <p className="text-2xl font-black text-stone-900 mt-1">{cancelledOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Product Volume Breakdown */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900">Palm Oil Sizes Demand</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Cumulative units ordered across retail bottles, gallons, and catering drums
            </p>
          </div>
          <Package className="w-5 h-5 text-stone-400" />
        </div>

        {itemSalesList.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            No item sales data yet. Once customers place orders, product breakdown will display here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Product Size / Package</th>
                  <th className="py-3 px-4 font-bold text-center">Units Sold</th>
                  <th className="py-3 px-4 font-bold text-right">Gross Order Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {itemSalesList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-center font-black text-orange-600">
                      {item.quantity} units
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-stone-900">
                      {formatNaira(item.revenue)}
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
