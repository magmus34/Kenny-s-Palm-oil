'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
  Loader2,
  Filter,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { formatNaira } from '@/lib/format';
import { deleteProduct, updateProduct } from '@/lib/services';
import ProductFormModal from './ProductFormModal';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
}

export default function AdminProducts({ products, categories }: AdminProductsProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.volume?.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleToggleAvailable = async (p: Product) => {
    try {
      await updateProduct(p.id, { isAvailable: !p.isAvailable });
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleToggleFeatured = async (p: Product) => {
    try {
      await updateProduct(p.id, { isFeatured: !p.isFeatured });
    } catch (err: any) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setDeleteError(err.message || 'Failed to delete product from database.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Product Catalog</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your palm oil inventory, bottle sizes, bulk drums, and pricing
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-xs shadow-md shadow-orange-600/25 flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, size or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700 focus:bg-white focus:border-orange-500"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <h3 className="font-bold text-stone-700 text-base">No products found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {search || selectedCategory !== 'all'
                ? 'Try adjusting your search query or filter options.'
                : 'Click "Add New Product" to create your first palm oil inventory item.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Product</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Volume</th>
                  <th className="py-3.5 px-4 font-bold">Price (NGN)</th>
                  <th className="py-3.5 px-4 font-bold">Stock</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Featured</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Product Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          <img
                            src={
                              p.imageUrl ||
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-extrabold text-stone-900 truncate text-sm">{p.name}</p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-700 font-medium">
                      {p.categoryName || 'General'}
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-4 font-bold text-stone-800">{p.volume || '1L'}</td>

                    {/* Price */}
                    <td className="py-3 px-4 font-black text-stone-900 text-sm">
                      {formatNaira(p.price)}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.stockQuantity <= 0
                            ? 'bg-red-100 text-red-700'
                            : p.stockQuantity <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </td>

                    {/* Availability toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailable(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          p.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="Click to toggle availability"
                      >
                        {p.isAvailable ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-stone-500" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          p.isFeatured
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                        }`}
                        title="Click to toggle homepage featured status"
                      >
                        <Sparkles
                          className={`w-3.5 h-3.5 ${
                            p.isFeatured ? 'text-orange-600' : 'text-stone-400'
                          }`}
                        />
                        <span>{p.isFeatured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        categories={categories}
        onSuccess={() => {}}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
            onClick={() => !deleting && setProductToDelete(null)}
          />
          <div className="min-h-screen px-4 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 border border-stone-200">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Delete Palm Oil Product?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to permanently delete{' '}
                <strong className="text-stone-900">&quot;{productToDelete.name}&quot;</strong> from
                the Firestore database? This action cannot be undone and will remove it from the
                storefront.
              </p>

              {deleteError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Yes, Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
