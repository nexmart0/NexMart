import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, MapPin, Phone, Calendar, Loader2 } from 'lucide-react';
import { CustomerSummary } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await api.getAdminCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          Customer Directory & Order History
        </h2>
        <p className="text-xs text-gray-500">
          Aggregated buyer profiles compiled from authenticated order submissions.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer by name, mobile, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No customer accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Customer Name</th>
                  <th className="py-3 px-4 font-bold">Mobile Phone</th>
                  <th className="py-3 px-4 font-bold">City (MP)</th>
                  <th className="py-3 px-4 font-bold text-center">Orders Placed</th>
                  <th className="py-3 px-4 font-bold text-right">Total Spent (INR)</th>
                  <th className="py-3 px-4 font-bold text-right">Latest Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                      +91 {c.mobile}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-600">{c.city}</td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                        {c.ordersCount} orders
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-gray-900">
                      {formatPrice(c.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-gray-500">
                      {new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
