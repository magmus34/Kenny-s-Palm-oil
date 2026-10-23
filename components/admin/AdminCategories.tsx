'use client';

import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Category } from '@/types';
import { addCategory, updateCategory, deleteCategory } from '@/lib/services';

interface AdminCategoriesProps {
  categories: Category[];
}

export default function AdminCategories({ categories }: AdminCategoriesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleStartAdd = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsAdding(true);
    setErrorMsg(null);
  };

  const handleStartEdit = (cat: Category) => {
    setIsAdding(false);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setErrorMsg(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setErrorMsg(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isAdding) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    const cleanSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-');

    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim(),
        });
      } else {
        await addCategory({
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim(),
        });
      }
      handleCancelForm();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setErrorMsg(err.message || 'Failed to save category to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete category:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Product Categories</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Organize palm oil sizes into logical groupings for customers
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="px-5 py-3 rounded-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-xs shadow-md shadow-orange-600/25 flex items-center gap-2 transition-all cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Inline Add / Edit Card */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-3xl border-2 border-orange-200 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-extrabold text-base text-stone-900">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Catering Kegs"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. catering-kegs"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Description
              </label>
              <input
                type="text"
                placeholder="Brief description for category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-orange-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories List Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <FolderTree className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="font-bold text-stone-700">No categories created yet</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Category Name</th>
                <th className="py-3.5 px-4 font-bold">Slug</th>
                <th className="py-3.5 px-4 font-bold">Description</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900 text-sm">
                    {cat.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-500">{cat.slug}</td>
                  <td className="py-3.5 px-4 text-stone-600 max-w-sm truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
            onClick={() => !deleting && setCategoryToDelete(null)}
          />
          <div className="min-h-screen px-4 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Delete Category?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to delete category{' '}
                <strong className="text-stone-900">&quot;{categoryToDelete.name}&quot;</strong>?
                Existing products in this category will keep their records.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setCategoryToDelete(null)}
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
