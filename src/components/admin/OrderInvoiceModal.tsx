import React from 'react';
import { X, Printer, Store, CheckCircle } from 'lucide-react';
import { Order, WebsiteSettings } from '../../types/index.ts';

interface OrderInvoiceModalProps {
  order: Order;
  settings: WebsiteSettings | null;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-10 flex flex-col max-h-[92vh]">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">Order Tax Invoice Preview</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {order.id}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="py-6 overflow-y-auto print:p-0 print:overflow-visible">
          {/* Invoice Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-gray-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {settings?.storeName || 'NexMart'}
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                {settings?.contact?.address || 'Dewas, Madhya Pradesh'}
              </p>
              <p className="text-xs text-gray-500">
                Phone: {settings?.contact?.phone} | Email: {settings?.contact?.email}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                Retail Tax Invoice
              </span>
              <p className="text-base font-black font-mono text-gray-900 mt-0.5">{order.id}</p>
              <p className="text-xs text-gray-600 mt-1">
                Date:{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div className="py-6 grid grid-cols-2 gap-8 border-b border-gray-100 text-xs">
            <div>
              <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                Customer Details
              </span>
              <p className="font-bold text-gray-900 text-sm">{order.customer.fullName}</p>
              <p className="text-gray-600 mt-0.5">Mobile: +91 {order.customer.mobileNumber}</p>
              <p className="text-gray-500 text-[11px] mt-1">Guest Customer Account</p>
            </div>

            <div>
              <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                Delivery Address
              </span>
              <p className="text-gray-800 font-medium">
                {order.customer.houseNo}, {order.customer.roadName}
              </p>
              <p className="text-gray-800 font-bold">
                {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </p>
              {order.trackingNumber && (
                <p className="text-indigo-600 font-mono mt-1">
                  Logistics Docket: {order.trackingNumber}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 font-bold">#</th>
                  <th className="py-2.5 font-bold">Item Description</th>
                  <th className="py-2.5 font-bold text-right">Unit Price</th>
                  <th className="py-2.5 font-bold text-center">Qty</th>
                  <th className="py-2.5 font-bold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-gray-400">{idx + 1}</td>
                    <td className="py-3 font-semibold text-gray-900">
                      {item.productName}
                    </td>
                    <td className="py-3 text-right text-gray-700">{formatPrice(item.price)}</td>
                    <td className="py-3 text-center font-bold text-gray-900">{item.quantity}</td>
                    <td className="py-3 text-right font-bold text-gray-900">
                      {formatPrice(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation summary */}
          <div className="pt-4 border-t-2 border-gray-200 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping & Delivery:</span>
                <span className="font-semibold text-gray-900">
                  {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
                </span>
              </div>
              {(order.codFee > 0 || order.paymentMethod === 'cod') && (
                <div className="flex justify-between text-gray-600">
                  <span>Cash on Delivery (COD) Fee:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(order.codFee ?? 50)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-300">
                <span>Grand Total:</span>
                <span className="text-indigo-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 items-end text-[11px] text-gray-500">
            <div>
              <p className="font-bold text-gray-700">Thank you for ordering with NexMart!</p>
              <p className="mt-0.5">Doorstep delivery verified in Madhya Pradesh.</p>
              <p>For support, call {settings?.contact?.phone || '+91 98260 12345'}.</p>
            </div>
            <div className="text-right">
              <div className="inline-block border-b border-gray-400 pb-1 w-36 text-center font-serif italic text-gray-700">
                NexMart Authorised
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
