'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  TrendingUp,
  LogOut,
  Droplet,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'settings'
  | 'sales';

interface AdminSidebarProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  pendingOrdersCount: number;
}

export default function AdminSidebar({
  currentTab,
  setCurrentTab,
  pendingOrdersCount,
}: AdminSidebarProps) {
  const { user, signOut } = useAuth();

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'sales', label: 'Sales Summary', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 border-r border-stone-800">
      <div>
        {/* Brand & Store */}
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center text-white shadow-md">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-white text-base truncate">Kenny&apos;s Palm Oil</h2>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="px-6 py-4 bg-stone-950/60 border-b border-stone-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-300 font-bold text-xs uppercase">
            {user?.email?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {user?.displayName || 'Administrator'}
            </p>
            <p className="text-[11px] text-stone-400 truncate font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Nav list */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-stone-950 text-white' : 'bg-orange-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-stone-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-orange-400" />
            <span>Customer Website</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        </Link>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
