import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { DashboardStats, Order, Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onViewOrder: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onViewOrder,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        api.getDashboardStats().catch((e) => {
          console.warn('Stats fetch warning:', e);
          return null;
        }),
        api.getAdminOrders().catch((e) => {
          console.warn('Orders fetch warning:', e);
          return [];
        }),
        api.getAdminProducts().catch((e) => {
          console.warn('Products fetch warning:', e);
          return [];
        }),
      ]);
      if (statsData) setStats(statsData);
      setRecentOrders((ordersData || []).slice(0, 5));
      setLowStockProducts((productsData || []).filter((p) => p.stock <= 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Store Performance Overview
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time transaction and inventory figures directly computed from the active database.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Sales (INR)
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {formatPrice(stats?.totalSales || 0)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              Calculated from confirmed & fulfilled orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats?.totalOrders || 0}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
              {stats?.pendingOrders || 0} pending processing
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Customers
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats?.totalCustomers || 0}
            </span>
            <span className="text-[10px] text-gray-400 font-medium mt-1 block">
              Unique verified buyers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products & Low Stock */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Catalog Items
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats?.totalProducts || 0}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              {stats?.lowStockCount || 0} items low on stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4">
          Order Pipeline Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
            <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <span className="text-xl font-black text-amber-900 block">{stats?.pendingOrders || 0}</span>
            <span className="text-[11px] font-bold text-amber-700">Pending</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-center">
            <CheckCircle className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <span className="text-xl font-black text-blue-900 block">{stats?.confirmedOrders || 0}</span>
            <span className="text-[11px] font-bold text-blue-700">Confirmed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center">
            <Package className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <span className="text-xl font-black text-indigo-900 block">{stats?.processingOrders || 0}</span>
            <span className="text-[11px] font-bold text-indigo-700">Processing</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-center">
            <Truck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <span className="text-xl font-black text-purple-900 block">{stats?.shippedOrders || 0}</span>
            <span className="text-[11px] font-bold text-purple-700">Shipped</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
            <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-xl font-black text-emerald-900 block">{stats?.deliveredOrders || 0}</span>
            <span className="text-[11px] font-bold text-emerald-700">Delivered</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-center">
            <AlertTriangle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
            <span className="text-xl font-black text-rose-900 block">{stats?.cancelledOrders || 0}</span>
            <span className="text-[11px] font-bold text-rose-700">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">
              Recent Customer Orders
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">Order ID</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">City</th>
                    <th className="pb-3 font-bold text-right">Amount</th>
                    <th className="pb-3 font-bold text-center">Status</th>
                    <th className="pb-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-indigo-600">{ord.id}</td>
                      <td className="py-3 font-medium text-gray-900">{ord.customer.fullName}</td>
                      <td className="py-3 text-gray-600">{ord.customer.city}</td>
                      <td className="py-3 text-right font-bold text-gray-900">
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onViewOrder(ord)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Low Stock Warnings</span>
              </h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Inventory
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold text-emerald-800 block">Inventory Healthy</span>
                All products have sufficient units in stock.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs"
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="font-bold text-gray-900 block truncate">{p.name}</span>
                      <span className="text-[10px] text-gray-500">{p.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <button
              onClick={() => onNavigateTab('products')}
              className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Manage Store Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
