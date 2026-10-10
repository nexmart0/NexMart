import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus, WebsiteSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { OrderInvoiceModal } from './OrderInvoiceModal.tsx';

interface AdminOrdersProps {
  settings: WebsiteSettings | null;
  selectedOrderFromDashboard?: Order | null;
  onClearSelectedOrder?: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  settings,
  selectedOrderFromDashboard,
  onClearSelectedOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer / Modals
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Status Update state
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search : undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Handle selected order from dashboard
  useEffect(() => {
    if (selectedOrderFromDashboard) {
      openOrderDetail(selectedOrderFromDashboard);
      if (onClearSelectedOrder) onClearSelectedOrder();
    }
  }, [selectedOrderFromDashboard]);

  const openOrderDetail = (ord: Order) => {
    setActiveOrder(ord);
    setNewStatus(ord.orderStatus);
    setTrackingNumber(ord.trackingNumber || '');
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setUpdatingStatus(true);
    try {
      const updated = await api.updateOrderStatus(
        activeOrder.id,
        newStatus,
        trackingNumber.trim() ? trackingNumber : undefined,
        statusNote.trim() ? statusNote : `Status changed to ${newStatus}`
      );
      setActiveOrder(updated);
      await loadOrders();
    } catch (err: any) {
      alert(err?.message || 'Failed updating order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('nexmart_admin_token') || sessionStorage.getItem('nexmart_admin_token') || '';
    window.location.href = `/api/admin/orders/export/csv?auth=${token}`;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  return (
    <div className="space-y-6">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Order Management</h2>
          <p className="text-xs text-gray-500">
            Track and process real customer orders, generate invoices, and assign logistics tracking.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 text-xs font-bold shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export Orders (CSV)</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Order ID (NEX-...), Customer Name, or Mobile Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0"
          >
            Search
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Orders
          </button>
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No customer orders matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Customer Info</th>
                  <th className="py-3 px-4 font-bold">Destination City</th>
                  <th className="py-3 px-4 font-bold text-center">Items</th>
                  <th className="py-3 px-4 font-bold text-right">Total Amount</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-600 block">{ord.id}</span>
                      <span className="text-[10px] text-gray-400 uppercase">
                        {ord.paymentMethod.toUpperCase()} (COD)
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-gray-500">
                      <span className="font-medium text-gray-800 block">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">{ord.customer.fullName}</span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        +91 {ord.customer.mobileNumber}
                      </span>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">{ord.customer.city}</td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                        {ord.items.reduce((s, i) => s + i.quantity, 0)} pcs
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-gray-900 block">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      {ord.deliveryFee > 0 && (
                        <span className="text-[10px] text-gray-400 block">+₹{ord.deliveryFee} del</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : ord.orderStatus === 'Shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.orderStatus === 'Processing'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.orderStatus === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openOrderDetail(ord)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View / Edit
                        </button>
                        <button
                          onClick={() => setInvoiceOrder(ord)}
                          className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Order Details & Status Drawer/Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Manage Order: <span className="font-mono text-indigo-600">{activeOrder.id}</span>
                </h3>
                <span className="text-[11px] text-gray-400">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceOrder(activeOrder)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
              {/* Customer & Address */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-extrabold text-gray-400 uppercase text-[10px] block mb-1">
                    Customer Info
                  </span>
                  <p className="font-bold text-gray-900 text-sm">{activeOrder.customer.fullName}</p>
                  <p className="text-gray-600 mt-0.5">Mobile: +91 {activeOrder.customer.mobileNumber}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                    Cash on Delivery
                  </span>
                </div>

                <div>
                  <span className="font-extrabold text-gray-400 uppercase text-[10px] block mb-1">
                    Delivery Address
                  </span>
                  <p className="text-gray-800 font-medium">
                    {activeOrder.customer.houseNo}, {activeOrder.customer.roadName}
                  </p>
                  <p className="font-bold text-gray-900">
                    {activeOrder.customer.city}, {activeOrder.customer.state} - {activeOrder.customer.pincode}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                  Ordered Products ({activeOrder.items.length})
                </h4>
                <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden text-xs">
                  {activeOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={i.productImage}
                          alt={i.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">{i.productName}</span>
                          <span className="text-[11px] text-gray-500">
                            {formatPrice(i.price)} × {i.quantity} unit(s)
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900">{formatPrice(i.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-right text-xs space-y-1">
                  <div className="text-gray-600">
                    Subtotal: <span className="font-semibold">{formatPrice(activeOrder.subtotal)}</span>
                  </div>
                  <div className="text-gray-600">
                    Delivery: <span className="font-semibold">{activeOrder.deliveryFee === 0 ? 'FREE' : formatPrice(activeOrder.deliveryFee)}</span>
                  </div>
                  {(activeOrder.codFee > 0 || activeOrder.paymentMethod === 'cod') && (
                    <div className="text-amber-800 font-medium">
                      COD Charge: <span className="font-bold">{formatPrice(activeOrder.codFee ?? 50)}</span>
                    </div>
                  )}
                  <div className="text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
                    Grand Total: <span className="text-indigo-600">{formatPrice(activeOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Update Order Status & Dispatch
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:border-indigo-500 outline-hidden"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Tracking / Courier Docket #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MP-EXP-91204"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-mono focus:border-indigo-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Internal Note / Milestone Log
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via Dewas hub local rider."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {updatingStatus ? 'Updating...' : 'Save Status Update'}
                  </button>
                </div>
              </form>

              {/* Status History Timeline */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                  Status History Log
                </h4>
                <div className="space-y-2 border-l-2 border-indigo-200 ml-2 pl-4 text-xs">
                  {activeOrder.statusHistory.map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-gray-900">{h.status}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(h.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {h.note && <p className="text-gray-600 text-[11px] mt-0.5">{h.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <OrderInvoiceModal
          order={invoiceOrder}
          settings={settings}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
