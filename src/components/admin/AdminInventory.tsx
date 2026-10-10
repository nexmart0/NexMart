import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpdateStock = async (p: Product, newStock: number) => {
    const finalStock = Math.max(0, newStock);
    setUpdatingId(p.id);
    try {
      const updated = await api.updateStock(p.id, finalStock);
      setProducts((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
    } catch (err: any) {
      alert(err?.message || 'Failed updating stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Inventory & Warehouse Stock
          </h2>
          <p className="text-xs text-gray-500">
            Monitor real-time product quantities. Inventory automatically decrements when customers place orders.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Units Available
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{totalUnits}</span>
            <span className="text-[10px] text-gray-400 font-medium">Across all catalog items</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Low Stock Warnings
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{lowStockCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">Less than 5 units left</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Out of Stock
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{outOfStockCount}</span>
            <span className="text-[10px] text-rose-600 font-medium">Ordering blocked for users</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No products match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Product Item</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Current Stock</th>
                  <th className="py-3 px-4 font-bold text-right">Quick Restock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                          />
                          <div className="max-w-[240px]">
                            <span className="font-bold text-gray-900 block truncate">{p.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-gray-600">{p.category}</td>

                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Low Stock (≤5)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Adequate Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-sm text-gray-900">{p.stock} units</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 border border-gray-200 rounded-xl p-1 bg-gray-50">
                          <button
                            disabled={isUpdating || p.stock <= 0}
                            onClick={() => handleUpdateStock(p, p.stock - 1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 flex items-center justify-center text-gray-700 shadow-2xs transition-colors disabled:opacity-30"
                            title="Decrement stock (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStock(p, p.stock + 5)}
                            className="px-2 h-7 rounded-lg bg-white hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-[11px] shadow-2xs transition-colors"
                            title="Restock +5 units"
                          >
                            +5
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStock(p, p.stock + 10)}
                            className="px-2 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[11px] shadow-2xs transition-colors"
                            title="Restock +10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
