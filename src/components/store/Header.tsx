import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  ShieldCheck,
  X,
  Menu,
  ChevronRight,
  ExternalLink,
  Store,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { Category, WebsiteSettings } from '../../types/index.ts';

interface HeaderProps {
  settings: WebsiteSettings | null;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (slug: string) => void;
  selectedCategory: string;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  selectedCategory,
  onOpenTrackOrder,
  onOpenAdmin,
  onNavigateHome,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storeName = settings?.storeName || 'NexMart';
  const logoText = settings?.logoText || 'NexMart';
  const logoBadge = settings?.logoBadge || 'MP Verified Store';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-xs backdrop-blur-md bg-white/95">
      {/* Announcement Bar */}
      {settings?.announcementBar?.enabled && (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white text-xs font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
          <span>{settings.announcementBar.text}</span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {logoText}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 -mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 inline" />
                  {logoBadge}
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, audio, smartwatch, flask..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-sm rounded-full border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all text-gray-800 placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Track Order */}
            <button
              onClick={onOpenTrackOrder}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-indigo-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Truck className="w-4 h-4 text-indigo-500" />
              <span>Track Order</span>
            </button>

            {/* Admin Access Button */}
            <button
              onClick={onOpenAdmin}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 py-2 px-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 border border-gray-200/60"
              title="Store Admin Panel"
            >
              <span>Admin</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all active:scale-95"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              <span className="min-w-5 h-5 px-1 bg-white text-indigo-700 rounded-full text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search input (visible only on small phones) */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-gray-100 text-sm rounded-lg border border-transparent focus:border-indigo-500 outline-hidden text-gray-800 placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center gap-2 py-2.5 border-t border-gray-100 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Departments
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.productCount === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.slug ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">
              Browse Categories
            </span>
            <button
              onClick={() => {
                onOpenTrackOrder();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-indigo-600 flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5" />
              Track Order
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-left text-xs font-medium ${
                selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'bg-gray-50 text-gray-700'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between ${
                  selectedCategory === cat.slug
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'bg-gray-50 text-gray-700'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Delivering across Dewas, Indore, Hatpipliya & Bagli</span>
          </div>
        </div>
      )}
    </header>
  );
};
