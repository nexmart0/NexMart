import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Store,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { clearAdminToken, api } from '../../services/api.ts';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onBackToStore: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onBackToStore,
  onLogout,
  children,
}) => {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'banners', label: 'Banners & Sections', icon: ImageIcon },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    setPwLoading(true);

    try {
      await api.changeAdminPassword(currentPassword, newPassword);
      setPwSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPwSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPwError(err?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogoutClick = () => {
    clearAdminToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        {/* Brand header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base block tracking-tight">NexMart Admin</span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Store Control</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-400" />
              <span>Preview Storefront</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setPasswordModalOpen(true)}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Change Password</span>
          </button>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div>
            <h1 className="text-base font-extrabold text-gray-900 capitalize">
              {menuItems.find((m) => m.id === currentTab)?.label || 'Admin Control'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              ● Server Connected & Persistent
            </span>
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>View Customer Store</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Content View */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base">Change Admin Password</h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-indigo-500 outline-hidden"
                  placeholder="Enter new strong password"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {pwLoading ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
