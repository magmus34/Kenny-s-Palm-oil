'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  MessageSquare,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Order, PaymentStatus, OrderStatus } from '@/types';
import { formatNaira, formatDate, cleanPhoneNumber } from '@/lib/format';
import { updateOrderStatus, deleteOrder } from '@/lib/services';

interface AdminOrdersProps {
  orders: Order[];
}

export default function AdminOrders({ orders }: AdminOrdersProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Status updating state tracker
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete modal state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const term = search.toLowerCase();
    const matchesSearch =
      o.orderRef.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerLocation.toLowerCase().includes(term) ||
      o.customerWhatsapp.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: PaymentStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, { paymentStatus: newStatus });
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
    } catch (err: any) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete order:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Customer Orders</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Real-time orders received from guest checkout. Update bank verification and fulfillment.
          </p>
        </div>
        <div className="text-xs font-bold text-stone-700 bg-stone-100 px-4 py-2 rounded-full border border-stone-200">
          Total: <span className="text-orange-600 font-extrabold">{orders.length}</span> order
          {orders.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, name, location, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Order Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Order:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800"
            >
              <option value="all">All Payments</option>
              <option value="Pending">Pending Payment</option>
              <option value="Confirmed">Confirmed Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center text-stone-400">
          <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h3 className="font-bold text-stone-700 text-base">No matching orders found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'Try adjusting your search query or status filters.'
              : 'New customer orders placed on the website will be synchronized here live.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isRowUpdating = updatingId === order.id;
            const customerPhone = cleanPhoneNumber(order.customerWhatsapp);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-orange-200 transition-all overflow-hidden"
              >
                {/* Main Order Header Summary */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Ref & Date & Customer */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-orange-600 text-sm bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                        {order.orderRef}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-extrabold text-stone-900 text-base">
                        {order.customerName}
                      </span>
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {order.customerLocation}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Total & Items count */}
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-stone-900">
                        {formatNaira(order.total)}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {order.items?.length || 0} product line{order.items?.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Quick WhatsApp Link to Customer */}
                    <a
                      href={`https://wa.me/${customerPhone}?text=${encodeURIComponent(
                        `Hello ${order.customerName}, regarding your Kenny's Premium Palm Oil Order ${order.orderRef}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Chat with Customer on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>

                  {/* Right: Status Dropdowns & Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Payment Status Dropdown */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                        Payment:
                      </span>
                      <select
                        value={order.paymentStatus}
                        disabled={isRowUpdating}
                        onChange={(e) =>
                          handleUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)
                        }
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border transition-colors cursor-pointer ${
                          order.paymentStatus === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Payment: Pending</option>
                        <option value="Confirmed">Payment: Confirmed (Paid)</option>
                      </select>
                    </div>

                    {/* Order Status Dropdown */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                        Fulfillment:
                      </span>
                      <select
                        value={order.orderStatus}
                        disabled={isRowUpdating}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border transition-colors cursor-pointer ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.orderStatus === 'Confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-stone-100 text-stone-700 border-stone-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Order: Pending</option>
                        <option value="Confirmed">Order: Confirmed</option>
                        <option value="Delivered">Order: Delivered</option>
                        <option value="Cancelled">Order: Cancelled</option>
                      </select>
                    </div>

                    {/* Expand/Collapse details */}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title={isExpanded ? 'Hide details' : 'Show details'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {/* Delete order */}
                    <button
                      onClick={() => setOrderToDelete(order)}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-stone-100 bg-stone-50/70 space-y-4 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Customer Phone &amp; WhatsApp:
                        </span>
                        <p className="font-mono font-bold text-stone-900 text-sm">
                          {order.customerWhatsapp}
                        </p>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Delivery Address &amp; Location:
                        </span>
                        <p className="font-semibold text-stone-800">{order.customerLocation}</p>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                      <div className="bg-stone-100/70 px-4 py-2 font-bold text-stone-600 text-[11px] uppercase tracking-wider flex justify-between">
                        <span>Product Item</span>
                        <span>Quantity &amp; Subtotal</span>
                      </div>
                      <div className="divide-y divide-stone-100">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-3 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-bold text-stone-900">{item.name}</p>
                                <p className="text-[11px] text-stone-500">
                                  Size: {item.volume} • Unit price: {formatNaira(item.price)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-stone-900">
                                {formatNaira(item.price * item.quantity)}
                              </p>
                              <p className="text-[11px] text-stone-500 font-semibold">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-stone-50 px-4 py-2.5 flex justify-between items-center font-extrabold text-stone-900 text-sm border-t border-stone-200">
                        <span>Total Paid / Due:</span>
                        <span className="text-orange-600 text-base">{formatNaira(order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
            onClick={() => !deleting && setOrderToDelete(null)}
          />
          <div className="min-h-screen px-4 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Delete Order Record?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to permanently delete order{' '}
                <strong className="text-stone-900 font-mono font-bold">
                  {orderToDelete.orderRef}
                </strong>{' '}
                from customer {orderToDelete.customerName}?
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Yes, Delete</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
