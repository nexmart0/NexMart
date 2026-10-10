import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { WebsiteSettings } from '../../types/index.ts';

interface CartDrawerProps {
  settings: WebsiteSettings | null;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  settings,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, totalItems } =
    useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings?.payment?.freeDeliveryThreshold || 499;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300">
        {/* Cart Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-gray-900 text-lg">Your Cart</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1.5">
            <Truck className="w-4 h-4 text-indigo-600" />
            {isFreeShipping ? (
              <span className="text-emerald-700 font-bold">🎉 Congratulations! You have unlocked FREE Delivery!</span>
            ) : (
              <span>
                Add <span className="font-bold text-indigo-700">{formatPrice(amountToFreeShipping)}</span> more for FREE Delivery!
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Looks like you haven't added any products to your cart yet. Explore our verified collection!
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white transition-all shadow-2xs"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{item.product.name}</h4>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xs font-extrabold text-gray-900">
                      {formatPrice(item.product.price)}
                    </span>
                    {item.product.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatPrice(item.product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-gray-800 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-gray-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-gray-900">
                  {isFreeShipping ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(settings?.payment?.deliveryCharge || 40)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-indigo-600 text-base">
                  {formatPrice(subtotal + (isFreeShipping ? 0 : (settings?.payment?.deliveryCharge || 40)))}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onContinueShopping();
              }}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 text-center"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
