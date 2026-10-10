import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Zap,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';

interface ProductDetailsModalProps {
  product: Product | null;
  relatedProducts: Product[];
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onBuyNow,
  onSelectRelated,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            {product.isFeatured && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Featured
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors focus:outline-hidden"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Gallery */}
            <div className="space-y-4">
              {/* Main Image Frame */}
              <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden border border-gray-200/80 relative">
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-200'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-gray-800">Fast MP Delivery</span>
                  <span className="text-[10px] text-gray-500">24-48 Hours</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-gray-800">100% Genuine</span>
                  <span className="text-[10px] text-gray-500">Verified Quality</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <RotateCcw className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-gray-800">7-Day Return</span>
                  <span className="text-[10px] text-gray-500">Doorstep policy</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Pricing Block */}
                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Save {product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mt-4 flex items-center gap-2">
                  {isOutOfStock ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>Currently Out of Stock</span>
                    </div>
                  ) : isLowStock ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>Hurry! Only {product.stock} units remaining</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>In Stock — Available for immediate dispatch</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Specifications */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Key Specifications
                    </h3>
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                      {product.specifications.map((spec, i) => (
                        <div key={i} className="flex px-3 py-2 bg-white even:bg-gray-50/60">
                          <span className="w-1/3 font-semibold text-gray-600">{spec.key}</span>
                          <span className="w-2/3 text-gray-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-bold text-gray-800 min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Max: {product.stock} units
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className="py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectRelated(rel);
                      setSelectedImageIndex(0);
                      setQuantity(1);
                    }}
                    className="p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all bg-white"
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                    <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{rel.name}</h4>
                    <span className="text-xs font-bold text-indigo-600">{formatPrice(rel.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
