import React from 'react';
import { ShoppingBag, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onBuyNow,
}) => {
  const { addToCart } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open details if user didn't click one of the action buttons directly
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    onOpenDetails(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* Badges on top of Image */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent && product.discountPercent > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[11px] shadow-xs">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-semibold text-[10px] shadow-xs">
            Best Seller
          </span>
        )}
        {product.isNewArrival && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold text-[10px] shadow-xs">
            New Arrival
          </span>
        )}
      </div>

      {/* Stock status indicator */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200 animate-pulse">
            Only {product.stock} left
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/80 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider block mb-1">
            {product.category}
          </span>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Savings */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs active:scale-95'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
