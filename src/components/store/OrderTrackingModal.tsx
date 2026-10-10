import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface OrderTrackingModalProps {
  initialOrderId?: string;
  initialMobile?: string;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  initialOrderId = '',
  initialMobile = '',
  onClose,
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // Auto trigger if initial props provided
  React.useEffect(() => {
    if (initialOrderId && initialMobile) {
      handleLookup(initialOrderId, initialMobile);
    }
  }, [initialOrderId, initialMobile]);

  const handleLookup = async (idToUse?: string, mobToUse?: string) => {
    const id = (idToUse || orderId).trim();
    const mob = (mobToUse || mobileNumber).replace(/\D/g, '');

    if (!id || !mob) {
      setError('Please provide both your Order ID and registered 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.trackOrder(id, mob);
      setOrder(data);
    } catch (err: any) {
      setError(err?.message || 'No matching order found. Please verify your details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const steps: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = order ? steps.indexOf(order.orderStatus) : -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-gray-900">Track Customer Order</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Inputs */}
        <div className="py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Order ID
              </label>
              <input
                type="text"
                placeholder="e.g. NEX-20261008-8012"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-medium focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Registered Mobile
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Check Real-Time Status</span>
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Body */}
        {order && (
          <div className="overflow-y-auto space-y-5 pt-3 border-t border-gray-100 flex-1">
            {/* Status Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Order ID</span>
                <p className="font-mono font-bold text-sm text-gray-900">{order.id}</p>
                <span className="text-[11px] text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">
                  Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Tracking Number if available */}
            {order.trackingNumber && (
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs flex items-center justify-between">
                <span className="text-indigo-900 font-medium">Logistics Tracking Number:</span>
                <span className="font-mono font-bold text-indigo-700">{order.trackingNumber}</span>
              </div>
            )}

            {/* Stepper (if not cancelled) */}
            {order.orderStatus !== 'Cancelled' && (
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  {steps.map((st, i) => {
                    const isPassed = currentStepIndex >= i;
                    const isCurrent = currentStepIndex === i;
                    return (
                      <div key={st} className="flex flex-col items-center flex-1 relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 text-center font-medium ${
                            isCurrent ? 'text-indigo-600 font-bold' : isPassed ? 'text-gray-800' : 'text-gray-400'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Activity Timeline
              </h4>
              <div className="space-y-2 border-l-2 border-indigo-100 ml-2 pl-4">
                {order.statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-gray-900">{hist.status}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(hist.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {hist.note && <p className="text-gray-600 text-[11px] mt-0.5">{hist.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address & items summary */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800">
                    {order.customer.fullName} ({order.customer.city})
                  </span>
                  <p className="text-gray-500 text-[11px]">
                    {order.customer.houseNo}, {order.customer.roadName}, {order.customer.city} - {order.customer.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
