import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  Banner,
  HomepageSection,
  WebsiteSettings,
  Order,
} from './types/index.ts';
import { api, getAdminToken, clearAdminToken } from './services/api.ts';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/store/Header.tsx';
import { HeroBanner } from './components/store/HeroBanner.tsx';
import { ProductCard } from './components/store/ProductCard.tsx';
import { ProductDetailsModal } from './components/store/ProductDetailsModal.tsx';
import { CartDrawer } from './components/store/CartDrawer.tsx';
import { CheckoutPage } from './components/store/CheckoutPage.tsx';
import { OrderSuccessModal } from './components/store/OrderSuccessModal.tsx';
import { OrderTrackingModal } from './components/store/OrderTrackingModal.tsx';
import { Footer } from './components/store/Footer.tsx';

// Admin imports
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminProducts } from './components/admin/AdminProducts.tsx';
import { AdminOrders } from './components/admin/AdminOrders.tsx';
import { AdminInventory } from './components/admin/AdminInventory.tsx';
import { AdminBannersAndSections } from './components/admin/AdminBannersAndSections.tsx';
import { AdminCustomers } from './components/admin/AdminCustomers.tsx';
import { AdminSettings } from './components/admin/AdminSettings.tsx';

import {
  Sparkles,
  Package,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

function StorefrontApp() {
  const { items: cartItems, clearCart, updateQuantity, removeFromCart, toastMessage } = useCart();

  // App View State
  const [view, setView] = useState<'store' | 'checkout' | 'admin'>('store');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => !!getAdminToken());

  // Storefront Data
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  // Interactive Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [trackOrderModalOpen, setTrackOrderModalOpen] = useState(false);
  const [trackInitialData, setTrackInitialData] = useState<{ id: string; mobile: string }>({ id: '', mobile: '' });
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Checkout specific items (either single product from Buy Now or multiple from Cart)
  const [checkoutItems, setCheckoutItems] = useState<{ product: Product; quantity: number }[]>([]);

  // Navigation from admin dashboard to order detail
  const [dashboardSelectedOrder, setDashboardSelectedOrder] = useState<Order | null>(null);

  // Load initial store data
  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [sets, cats, bans, secs, prods] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getBanners(),
        api.getHomepageSections(),
        api.getProducts(),
      ]);
      setSettings(sets);
      setCategories(cats);
      setBanners(bans);
      setSections(secs);
      setProducts(prods);
    } catch (err) {
      console.error('Error fetching storefront data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Listen for 401 unauthorized from admin requests and reset authentication state
  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAdminAuthenticated(false);
      clearAdminToken();
    };
    window.addEventListener('admin_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin_unauthorized', handleUnauthorized);
  }, []);

  // Verify admin session when visiting admin view
  useEffect(() => {
    if (view === 'admin' && isAdminAuthenticated) {
      api.getAdminMe().catch(() => {
        clearAdminToken();
        setIsAdminAuthenticated(false);
      });
    }
  }, [view, isAdminAuthenticated]);

  // Filter products for active search or category view
  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== 'all';

  let displayedProducts = products;
  if (selectedCategory !== 'all') {
    const activeCat = categories.find((c) => c.slug === selectedCategory);
    const catName = activeCat ? activeCat.name : selectedCategory;
    displayedProducts = displayedProducts.filter(
      (p) => p.category.toLowerCase() === catName.toLowerCase()
    );
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayedProducts = displayedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortOption === 'price-low') {
    displayedProducts = [...displayedProducts].sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    displayedProducts = [...displayedProducts].sort((a, b) => b.price - a.price);
  } else if (sortOption === 'newest') {
    displayedProducts = [...displayedProducts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Handlers
  const handleOpenProductDetails = async (product: Product) => {
    setSelectedProduct(product);
    try {
      const data = await api.getProductById(product.id);
      setRelatedProducts(data.related || []);
    } catch {
      setRelatedProducts(products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4));
    }
  };

  const handleBuyNowFromCard = (product: Product, quantity = 1) => {
    setSelectedProduct(null);
    setCheckoutItems([{ product, quantity }]);
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckoutFromCart = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems(cartItems.map((i) => ({ product: i.product, quantity: i.quantity })));
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setSuccessOrder(order);
    clearCart();
    setView('store');
    // Refresh product stock after purchase
    loadStoreData();
  };

  const handleTrackFromSuccess = (id: string, mobile: string) => {
    setSuccessOrder(null);
    setTrackInitialData({ id, mobile });
    setTrackOrderModalOpen(true);
  };

  const handleCheckoutUpdateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleCheckoutRemoveItem(productId);
      return;
    }
    setCheckoutItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(newQty, item.product.stock) };
        }
        return item;
      })
    );
  };

  const handleCheckoutRemoveItem = (productId: string) => {
    const updated = checkoutItems.filter((i) => i.product.id !== productId);
    setCheckoutItems(updated);
    if (updated.length === 0) {
      setView('store');
    }
  };

  // Deduplicated products list for New Arrivals - displaying all products from all categories
  const allProductsList = Array.from(new Map(products.map((p) => [p.id, p])).values());

  // Render Section by Section Key - Only New Arrivals product section
  const renderHomepageSection = (sec: HomepageSection) => {
    if (!sec.isVisible) return null;

    switch (sec.key) {
      case 'newarrivals':
        return (
          <section key={sec.id} id="newarrivals" className="py-12 border-b border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
                <div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                    <Package className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Fresh Inventory</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {sec.title || 'Best Seller'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {sec.subtitle || 'Explore all verified products available for instant dispatch'}
                  </p>
                </div>
              </div>
              {allProductsList.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-sm">No products available in the store catalog yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {allProductsList.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={handleOpenProductDetails}
                      onBuyNow={(p) => handleBuyNowFromCard(p, 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Toast Component
  const toastView = toastMessage ? (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md border border-gray-700 animate-slide-up">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  ) : null;

  // View: ADMIN PANEL
  if (view === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onBackToStore={() => setView('store')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(t) => setAdminTab(t)}
        onBackToStore={() => {
          setView('store');
          loadStoreData();
        }}
        onLogout={() => {
          clearAdminToken();
          setIsAdminAuthenticated(false);
          setView('store');
        }}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => setAdminTab(tab)}
            onViewOrder={(ord) => {
              setDashboardSelectedOrder(ord);
              setAdminTab('orders');
            }}
          />
        )}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'orders' && (
          <AdminOrders
            settings={settings}
            selectedOrderFromDashboard={dashboardSelectedOrder}
            onClearSelectedOrder={() => setDashboardSelectedOrder(null)}
          />
        )}
        {adminTab === 'inventory' && <AdminInventory />}
        {adminTab === 'banners' && <AdminBannersAndSections />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'settings' && (
          <AdminSettings onSettingsSaved={(newSets) => setSettings(newSets)} />
        )}
      </AdminLayout>
    );
  }

  // View: CHECKOUT PAGE
  if (view === 'checkout') {
    return (
      <>
        {toastView}
        <CheckoutPage
          items={checkoutItems}
          settings={settings}
          onBack={() => setView('store')}
          onOrderSuccess={handleOrderSuccess}
          onUpdateQuantity={handleCheckoutUpdateQty}
          onRemoveItem={handleCheckoutRemoveItem}
        />
      </>
    );
  }

  // View: STOREFRONT
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {toastView}

      {/* Header */}
      <Header
        settings={settings}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
        selectedCategory={selectedCategory}
        onOpenTrackOrder={() => setTrackOrderModalOpen(true)}
        onOpenAdmin={() => setView('admin')}
        onNavigateHome={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* If Searching or Category Filter Active -> Display Products Grid View */}
      {isFiltering ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {/* Breadcrumb & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="hover:text-indigo-600"
                >
                  Home
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="font-semibold text-gray-900 capitalize">
                  {selectedCategory !== 'all' ? selectedCategory.replace('-', ' ') : 'Search'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : categories.find((c) => c.slug === selectedCategory)?.name || 'Filtered Products'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing {displayedProducts.length} verified products available for instant dispatch
              </p>
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortOption}
                  onChange={(e: any) => setSortOption(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-hidden"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {displayedProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">No matching products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find any items matching your search or category selection. Try a broader search keyword.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={handleOpenProductDetails}
                  onBuyNow={(p) => handleBuyNowFromCard(p, 1)}
                />
              ))}
            </div>
          )}
        </main>
      ) : (
        /* Standard Dynamic Homepage */
        <main className="flex-1">
          {/* Promotional Hero Banners */}
          <HeroBanner
            banners={banners}
            onCtaClick={(link) => {
              if (link.startsWith('#category-')) {
                const slug = link.replace('#category-', '');
                setSelectedCategory(slug);
              } else if (link.startsWith('#')) {
                const el = document.querySelector(link);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* Value Prop strip */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/60 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-medium">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Express Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Quality</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-900 font-medium">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>7-Day Return Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-900 font-medium">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Section: New Arrivals (Single Main Product Section) */}
          {(() => {
            const validSecs = sections.filter((s) => s.key === 'newarrivals');
            const hasNewArrivals = validSecs.some((s) => s.key === 'newarrivals');
            const listToRender = hasNewArrivals
              ? validSecs
              : [
                  {
                    id: 'sec-newarrivals',
                    key: 'newarrivals' as const,
                    title: 'Best Seller',
                    subtitle: 'Fresh drops just added to the NexMart catalog this week',
                    isVisible: true,
                    order: 1,
                  },
                ];
            return listToRender.map((sec) => renderHomepageSection(sec));
          })()}
        </main>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        settings={settings}
        onProceedToCheckout={handleProceedToCheckoutFromCart}
        onContinueShopping={() => {}}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        relatedProducts={relatedProducts}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={handleBuyNowFromCard}
        onSelectRelated={handleOpenProductDetails}
      />

      {/* Order Success Confirmation Modal */}
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          onContinueShopping={() => setSuccessOrder(null)}
          onTrackOrder={handleTrackFromSuccess}
        />
      )}

      {/* Track Order Modal */}
      {trackOrderModalOpen && (
        <OrderTrackingModal
          initialOrderId={trackInitialData.id}
          initialMobile={trackInitialData.mobile}
          onClose={() => {
            setTrackOrderModalOpen(false);
            setTrackInitialData({ id: '', mobile: '' });
          }}
        />
      )}

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenTrackOrder={() => setTrackOrderModalOpen(true)}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <StorefrontApp />
    </CartProvider>
  );
}
