import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdminAuthenticated } from '@/lib/server-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Product } from '@/types';

/**
 * POST /api/admin/products
 * Protected: Creates a new product
 */
export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const product: Omit<Product, 'id'> = await req.json();

    if (!product.name || typeof product.name !== 'string' || product.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Valid product name is required' },
        { status: 400 }
      );
    }

    if (product.price === undefined || Number(product.price) < 0) {
      return NextResponse.json(
        { error: 'Valid product price is required' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, 'products'), {
      name: product.name.trim(),
      description: product.description || '',
      price: Number(product.price),
      categoryId: product.categoryId || '',
      categoryName: product.categoryName || '',
      volume: product.volume || '1L',
      imageUrl: product.imageUrl || '',
      stockQuantity: Number(product.stockQuantity || 0),
      isAvailable: product.isAvailable !== undefined ? Boolean(product.isAvailable) : true,
      isFeatured: product.isFeatured !== undefined ? Boolean(product.isFeatured) : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Product created successfully',
    });
  } catch (error: any) {
    console.error('API /api/admin/products POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products
 * Protected: Updates an existing product
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
    const { id, ...updates } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const cleanUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.price !== undefined) cleanUpdates.price = Number(updates.price);
    if (updates.categoryId !== undefined) cleanUpdates.categoryId = updates.categoryId;
    if (updates.categoryName !== undefined) cleanUpdates.categoryName = updates.categoryName;
    if (updates.volume !== undefined) cleanUpdates.volume = updates.volume;
    if (updates.imageUrl !== undefined) cleanUpdates.imageUrl = updates.imageUrl;
    if (updates.stockQuantity !== undefined) cleanUpdates.stockQuantity = Number(updates.stockQuantity);
    if (updates.isAvailable !== undefined) cleanUpdates.isAvailable = Boolean(updates.isAvailable);
    if (updates.isFeatured !== undefined) cleanUpdates.isFeatured = Boolean(updates.isFeatured);

    await updateDoc(doc(db, 'products', id), cleanUpdates);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    console.error('API /api/admin/products PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * Protected: Deletes a product
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
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, 'products', productId));

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('API /api/admin/products DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
