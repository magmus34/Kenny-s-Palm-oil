import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdminAuthenticated } from '@/lib/server-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Order, PaymentStatus, OrderStatus } from '@/types';

/**
 * GET /api/admin/orders
 * Protected: Retrieves all customer orders
 */
export async function GET(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders: Order[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      orders.push({
        id: docSnap.id,
        orderRef: data.orderRef || '',
        customerName: data.customerName || '',
        customerLocation: data.customerLocation || '',
        customerWhatsapp: data.customerWhatsapp || '',
        items: Array.isArray(data.items) ? data.items : [],
        subtotal: Number(data.subtotal) || 0,
        total: Number(data.total) || 0,
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        paymentStatus: data.paymentStatus || 'Pending',
        orderStatus: data.orderStatus || 'Pending',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      });
    });

    orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('API /api/admin/orders GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Protected: Updates paymentStatus or orderStatus
 */
export async function PATCH(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { orderId, paymentStatus, orderStatus } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (paymentStatus && ['Pending', 'Confirmed'].includes(paymentStatus)) {
      updates.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (
      orderStatus &&
      ['Pending', 'Confirmed', 'Delivered', 'Cancelled'].includes(orderStatus)
    ) {
      updates.orderStatus = orderStatus as OrderStatus;
    }

    await updateDoc(doc(db, 'orders', orderId), updates);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    console.error('API /api/admin/orders PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders
 * Protected: Deletes an order
 */
export async function DELETE(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, 'orders', orderId));

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error: any) {
    console.error('API /api/admin/orders DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
