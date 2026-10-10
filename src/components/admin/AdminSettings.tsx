import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Store,
  Phone,
  FileText,
  CreditCard,
  Share2,
  Sparkles,
} from 'lucide-react';
import { WebsiteSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminSettingsProps {
  onSettingsSaved?: (newSettings: WebsiteSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'policies' | 'payment' | 'social'>('general');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getAdminSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg(null);
    try {
      const updated = await api.saveAdminSettings(settings);
      setSettings(updated);
      setSuccessMsg('Website configuration saved successfully to database!');
      if (onSettingsSaved) onSettingsSaved(updated);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Storefront & Website Customization
          </h2>
          <p className="text-xs text-gray-500">
            Control branding, announcement bar, contact info, customer policies, and checkout rules.
          </p>
        </div>

        {successMsg && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Branding & Announcement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'payment' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment & Delivery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Contact & Operating Hours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'policies' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Legal & Policy Pages</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'social' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Social Media Links</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Tab 1: General Branding */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Brand Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Logo Text
                </label>
                <input
                  type="text"
                  required
                  value={settings.logoText}
                  onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Logo Badge / Subtitle
                </label>
                <input
                  type="text"
                  value={settings.logoBadge}
                  onChange={(e) => setSettings({ ...settings, logoBadge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Announcement bar */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Header Announcement Bar
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={settings.announcementBar.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcementBar: {
                          ...settings.announcementBar,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded-sm text-indigo-600"
                  />
                  <span>Show Announcement</span>
                </label>
              </div>

              <input
                type="text"
                value={settings.announcementBar.text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBar: {
                      ...settings.announcementBar,
                      text: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                placeholder="Announcement message displayed at the top of the website"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Payment & Delivery */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Payment & Fulfillment Rules</h3>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-gray-900 block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-gray-500">Allow customers to pay upon delivery at their door</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.payment.codEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, codEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded-sm"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.payment.freeDeliveryThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        freeDeliveryThreshold: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Orders equal or above this amount receive free shipping.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Standard Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.payment.deliveryCharge}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: {
                        ...settings.payment,
                        deliveryCharge: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Charged if order subtotal is below the free delivery threshold.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contact Info */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Store Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Customer Support Phone
                </label>
                <input
                  type="text"
                  value={settings.contact.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: { ...settings.contact, phone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.contact.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: { ...settings.contact, email: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Store Operating Hours
              </label>
              <input
                type="text"
                value={settings.contact.workingHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, workingHours: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Store Hub Address
              </label>
              <textarea
                rows={2}
                value={settings.contact.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, address: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Policies */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Customer Legal & Store Policies</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                About Us Content
              </label>
              <textarea
                rows={3}
                value={settings.policies.aboutUs}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, aboutUs: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Return & Refund Policy
              </label>
              <textarea
                rows={3}
                value={settings.policies.returnPolicy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, returnPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Shipping Policy
              </label>
              <textarea
                rows={3}
                value={settings.policies.shippingPolicy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, shippingPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Privacy Policy
              </label>
              <textarea
                rows={3}
                value={settings.policies.privacyPolicy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, privacyPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Terms and Conditions
              </label>
              <textarea
                rows={3}
                value={settings.policies.termsAndConditions}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    policies: { ...settings.policies, termsAndConditions: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Social Media */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Official Social Media Profiles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  WhatsApp Contact Link
                </label>
                <input
                  type="text"
                  value={settings.socialLinks.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, whatsapp: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  placeholder="https://wa.me/91..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks.facebook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Twitter / X URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks.twitter}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
