import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Banner, HomepageSection } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminBannersAndSections: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBanners, setSavingBanners] = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [sectionSaveMessage, setSectionSaveMessage] = useState<string | null>(null);

  // Edit Banner modal
  const [editBannerModal, setEditBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Omit<Banner, 'id'>>({
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'Shop Now',
    link: '#newarrivals',
    badge: '',
    isActive: true,
    order: 1,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bList, sList] = await Promise.all([
        api.getAdminBanners(),
        api.getAdminHomepageSections(),
      ]);
      setBanners(bList);
      const validKeys = ['newarrivals'];
      setSections(sList.filter((s) => validKeys.includes(s.key)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- BANNERS HANDLERS ---
  const openNewBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: 'Mega Season Savings',
      subtitle: 'Experience authentic electronics with same-day dispatch in Dewas & Indore.',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=85',
      buttonText: 'Explore Now',
      link: '#category-electronics-audio',
      badge: 'Limited Offer',
      isActive: true,
      order: banners.length + 1,
    });
    setEditBannerModal(true);
  };

  const openEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      buttonText: b.buttonText,
      link: b.link,
      badge: b.badge || '',
      isActive: b.isActive,
      order: b.order,
    });
    setEditBannerModal(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanners(true);
    try {
      let updatedList: Banner[];
      if (editingBanner) {
        updatedList = banners.map((b) =>
          b.id === editingBanner.id ? { ...b, ...bannerForm } : b
        );
      } else {
        const newB: Banner = {
          ...bannerForm,
          id: `ban-${Date.now()}`,
        };
        updatedList = [...banners, newB];
      }

      await api.saveAdminBanners(updatedList);
      setBanners(updatedList);
      setEditBannerModal(false);
    } catch (err: any) {
      console.error('Failed saving banner:', err);
    } finally {
      setSavingBanners(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    const filtered = banners.filter((b) => b.id !== id);
    try {
      await api.saveAdminBanners(filtered);
      setBanners(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBannerActive = async (b: Banner) => {
    const updated = banners.map((item) =>
      item.id === b.id ? { ...item, isActive: !item.isActive } : item
    );
    try {
      await api.saveAdminBanners(updated);
      setBanners(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // --- SECTIONS HANDLERS ---
  const handleToggleSectionVisibility = async (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    setSections(updated);
    try {
      await api.saveAdminHomepageSections(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // reassign order integers
    const reordered = copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(reordered);

    try {
      await api.saveAdminHomepageSections(reordered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSectionTitle = (id: string, title: string, subtitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title, subtitle } : s))
    );
  };

  const handleSaveSections = async () => {
    setSavingSections(true);
    setSectionSaveMessage(null);
    try {
      await api.saveAdminHomepageSections(sections);
      setSectionSaveMessage('Homepage sections saved successfully!');
      setTimeout(() => setSectionSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSections(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 1. Promotional Banners Customization */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Promotional Banners
            </h2>
            <p className="text-xs text-gray-500">
              Customize hero slides, banner photos, text, badges, and CTA destination links.
            </p>
          </div>
          <button
            onClick={openNewBanner}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all bg-white ${
                b.isActive ? 'border-gray-200/80 shadow-xs' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Image with overlay badge */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {b.badge && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {b.badge}
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-bold text-sm truncate">{b.title}</h4>
                  <p className="text-[11px] text-gray-200 line-clamp-1">{b.subtitle}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3.5 bg-gray-50 flex items-center justify-between text-xs border-t border-gray-100">
                <button
                  onClick={() => handleToggleBannerActive(b)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    b.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {b.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{b.isActive ? 'Active Slide' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditBanner(b)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-white"
                    title="Edit Banner"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-white"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Homepage Sections Visibility & Ordering */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Homepage Sections Layout
            </h2>
            <p className="text-xs text-gray-500">
              Control the visibility and display sequence of sections on the storefront homepage.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {sectionSaveMessage && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                {sectionSaveMessage}
              </span>
            )}
            <button
              onClick={handleSaveSections}
              disabled={savingSections}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {savingSections ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Section Order</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                sec.isVisible ? 'bg-white' : 'bg-gray-50/70 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-100 font-bold text-xs text-gray-600 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value, sec.subtitle)}
                    className="font-bold text-sm text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-hidden px-1"
                  />
                  <input
                    type="text"
                    value={sec.subtitle}
                    onChange={(e) => handleUpdateSectionTitle(sec.id, sec.title, e.target.value)}
                    className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-hidden px-1 block w-full max-w-md"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Reorder Buttons */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visibility Toggle */}
                <button
                  onClick={() => handleToggleSectionVisibility(sec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    sec.isVisible
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {sec.isVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Shown</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Banner Modal */}
      {editBannerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-base">
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h3>
              <button
                onClick={() => setEditBannerModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Banner Heading *
                </label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  placeholder="e.g. Next-Gen Audio Experience"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Subtitle / Promo Text
                </label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  placeholder="Brief discount offer or feature description"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                    placeholder="e.g. 50% OFF"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBannerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanners}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {savingBanners ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
