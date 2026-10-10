import React, { useState } from 'react';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  X,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { WebsiteSettings } from '../../types/index.ts';

interface FooterProps {
  settings: WebsiteSettings | null;
  onOpenTrackOrder: () => void;
  onSelectCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenTrackOrder,
  onSelectCategory,
}) => {
  const [activePolicyModal, setActivePolicyModal] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const contact = settings?.contact || {
    phone: '+91 98260 12345',
    email: 'support@nexmart.in',
    address: 'NexMart Commercial Hub, A.B. Road, Dewas - 455001, Madhya Pradesh',
    workingHours: 'Mon - Sun: 9:00 AM to 9:00 PM IST',
  };

  const policies = settings?.policies || {
    aboutUs: 'NexMart is dedicated to delivering genuine quality products across Madhya Pradesh.',
    privacyPolicy: 'Your customer data is strictly used for order fulfillment.',
    termsAndConditions: 'Terms of using NexMart store services.',
    returnPolicy: '7-day doorstep replacement and refund guarantee.',
    shippingPolicy: 'Direct doorstep dispatch in Dewas, Indore, Hatpipliya and Bagli.',
  };

  const openPolicy = (title: string, content: string) => {
    setActivePolicyModal({ title, content });
  };

  return (
    <>
      <footer className="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-900 mt-20">
        {/* Value Proposition Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-gray-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast MP Delivery</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Dewas, Indore, Hatpipliya, Bagli</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Genuine</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Quality inspected products</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Easy Returns</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Hassle-free doorstep service</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cash on Delivery</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Pay comfortably at your door</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand & Tagline */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  {settings?.logoText || 'NexMart'}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                {settings?.tagline || 'Your trusted online shopping destination across Madhya Pradesh.'} Delivering high-grade electronics, smart gadgets, fashion, and home lifestyle products.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Active Service Zones: Dewas • Indore • Hatpipliya • Bagli</span>
              </div>
            </div>

            {/* Column 2: Customer Care */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <button
                    onClick={onOpenTrackOrder}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPolicy('Shipping Policy', policies.shippingPolicy)}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPolicy('Return & Refund Policy', policies.returnPolicy)}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Return Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPolicy('Terms and Conditions', policies.termsAndConditions)}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Terms and Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPolicy('Privacy Policy', policies.privacyPolicy)}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: About Us */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">About NexMart</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>
                  <button
                    onClick={() => openPolicy('About Us', policies.aboutUs)}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('electronics-audio')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Electronics & Audio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('smart-gadgets')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Smart Wearables
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectCategory('home-kitchen')}
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Home & Kitchen
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Us</h4>
              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <a href={`tel:${contact.phone}`} className="hover:text-indigo-300">
                    {contact.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <a href={`mailto:${contact.email}`} className="hover:text-indigo-300">
                    {contact.email}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{contact.workingHours}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{contact.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {settings?.storeName || 'NexMart'} Inc. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Verified Local Delivery in Madhya Pradesh</span>
          </p>
        </div>
      </footer>

      {/* Policy Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">{activePolicyModal.title}</h3>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-line flex-1">
              {activePolicyModal.content}
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
