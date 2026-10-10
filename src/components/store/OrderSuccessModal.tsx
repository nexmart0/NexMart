import React from 'react';
import { CheckCircle, Truck, Package, ArrowRight, Copy, Check } from 'lucide-react';
import { Order } from '../../types/index.ts';

interface OrderSuccessModalProps {
  order: Order;
  onContinueShopping: () => void;
  onTrackOrder: (orderId: string, mobile: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onContinueShopping,
  onTrackOrder,
}) => {
  const [copied, setCopied] = React.useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-10 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Order Placed Successfully!
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto">
          Thank you, <span className="font-bold text-gray-900">{order.customer.fullName}</span>! Your order has been securely saved in the NexMart database.
        </p>

        {/* Unique Order ID Badge */}
        <div className="my-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-mono text-sm sm:text-base font-bold shadow-2xs">
          <span>Order ID: {order.id}</span>
          <button
            onClick={copyOrderId}
            className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-700 transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Delivery Details Card */}
        <div className="text-left bg-gray-50 rounded-2xl p-5 border border-gray-200/80 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-gray-900 block text-sm">Delivery Address</span>
              <p className="text-gray-600 mt-0.5">
                {order.customer.houseNo}, {order.customer.roadName}
              </p>
              <p className="font-semibold text-gray-800">
                {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </p>
              <p className="text-gray-500 mt-1">Mobile: +91 {order.customer.mobileNumber}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-start gap-3">
            <Package className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-gray-900 block text-sm mb-1">
                Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-700">
                    <span className="truncate max-w-[240px] sm:max-w-xs">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-sm">
                <span>Total Amount {order.paymentMethod === 'cod' ? '(COD + ₹50 fee)' : ''}:</span>
                <span className="text-indigo-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onTrackOrder(order.id, order.customer.mobileNumber)}
            className="flex-1 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Track This Order</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="flex-1 py-3.5 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
