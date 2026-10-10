import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Lock,
  Loader2,
  Banknote,
} from 'lucide-react';
import {
  OrderItem,
  Product,
  AllowedCity,
  ALLOWED_CITIES,
  FIXED_STATE,
  WebsiteSettings,
  Order,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CheckoutPageProps {
  items: { product: Product; quantity: number }[];
  settings: WebsiteSettings | null;
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  settings,
  onBack,
  onOrderSuccess,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [formData, setFormData] = useState<{
    fullName: string;
    mobileNumber: string;
    pincode: string;
    city: AllowedCity;
    state: 'Madhya Pradesh';
    houseNo: string;
    roadName: string;
  }>({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    city: 'Dewas',
    state: 'Madhya Pradesh',
    houseNo: '',
    roadName: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeThreshold = settings?.payment?.freeDeliveryThreshold || 499;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : (settings?.payment?.deliveryCharge || 40);
  const codFee = paymentMethod === 'cod' ? 50 : 0;
  const totalAmount = subtotal + deliveryCharge + codFee;

  // Validate form fields
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }

    const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobileNumber = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin) {
      errs.pincode = 'PIN Code is required.';
    } else if (!/^\d{6}$/.test(cleanPin)) {
      errs.pincode = 'PIN Code must be exactly 6 digits.';
    }

    if (!ALLOWED_CITIES.includes(formData.city)) {
      errs.city = 'Please choose a valid service city.';
    }

    if (!formData.houseNo.trim()) {
      errs.houseNo = 'House No. / Building Name is required.';
    }

    if (!formData.roadName.trim()) {
      errs.roadName = 'Road Name / Area / Colony is required.';
    }

    if (items.length === 0) {
      errs.general = 'Your checkout items list is empty.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    if (isSubmitting) return; // Prevent duplicate submission

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName: formData.fullName.trim(),
          mobileNumber: formData.mobileNumber.replace(/\D/g, ''),
          pincode: formData.pincode.replace(/\D/g, ''),
          city: formData.city,
          state: FIXED_STATE,
          houseNo: formData.houseNo.trim(),
          roadName: formData.roadName.trim(),
        },
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        paymentMethod,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        onOrderSuccess(res.order);
      } else {
        setApiError(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setApiError(err?.message || 'A network error occurred while processing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Safe & Secure Instant Guest Checkout</span>
          </div>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Order Failed: </span>
              {apiError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer Delivery Address Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80">
              <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                Delivery Information
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Fast doorstep dispatch. No account required.
              </p>

              <div className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    1. Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-hidden ${
                      errors.fullName
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    2. Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number (e.g. 9826012345)"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all outline-hidden ${
                        errors.mobileNumber
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                  {errors.mobileNumber ? (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.mobileNumber}</p>
                  ) : (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Order dispatch confirmation will be sent to this number.
                    </p>
                  )}
                </div>

                {/* 3. PIN Code & 4. City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      3. PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="6 digits (e.g. 455001)"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-hidden ${
                        errors.pincode
                          ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-red-600 text-xs mt-1 font-medium">{errors.pincode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      4. City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value as AllowedCity })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium transition-all outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      {ALLOWED_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">
                      Service restricted strictly to verified MP zones
                    </p>
                  </div>
                </div>

                {/* 5. State (Fixed to Madhya Pradesh) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    5. State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={FIXED_STATE}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 text-sm font-semibold cursor-not-allowed"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Fixed to MP
                    </span>
                  </div>
                </div>

                {/* 6. House No. / Building Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    6. House No. / Building Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Sai Vihar Apartment / House #14"
                    value={formData.houseNo}
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-hidden ${
                      errors.houseNo
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.houseNo && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.houseNo}</p>
                  )}
                </div>

                {/* 7. Road Name / Area / Colony */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    7. Road Name / Area / Colony <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Vijay Nagar Square / Main Market Road"
                    value={formData.roadName}
                    onChange={(e) => setFormData({ ...formData, roadName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-hidden ${
                      errors.roadName
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.roadName && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.roadName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                Payment Method
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        +₹50 COD Fee
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pay in cash upon doorstep delivery. A fixed ₹50 COD charge applies.
                    </p>
                  </div>
                </label>

                {settings?.payment?.onlineEnabled && (
                  <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-gray-900">Online UPI / Card Payment</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Secure instant online verification.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-4 pb-4 border-b border-gray-100">
                Order Summary
              </h2>

              {/* Items List with Quantity Controls */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-6">
                {items.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No products in checkout.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/80 border border-gray-100"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-semibold text-gray-600 mt-0.5">
                          {formatPrice(item.product.price)} each
                        </div>

                        {/* Adjust quantity right in checkout */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-0.5 hover:bg-gray-100 text-gray-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold min-w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-0.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-semibold">
                    {isFreeDelivery ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200">
                    <span className="font-medium">Cash on Delivery (COD) Charge</span>
                    <span className="font-bold">{formatPrice(codFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm sm:text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                  <span>Final Total</span>
                  <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 p-3.5 bg-gray-50 rounded-2xl space-y-2 text-[11px] text-gray-600 border border-gray-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time inventory deduction & order validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Doorstep dispatch across Dewas, Indore, Hatpipliya & Bagli</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="mt-6 w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Order to Database...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Place Order ({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-gray-400 mt-3">
                By placing an order, you agree to NexMart's Delivery & Return terms.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
