import React, { useState } from 'react';
import { Store, AlertCircle, Loader2 } from 'lucide-react';
import { api, setAdminToken } from '../../services/api.ts';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(password);
      if (res.token) {
        setAdminToken(res.token);
        onLoginSuccess();
      } else {
        setError('Incorrect password');
      }
    } catch (err: any) {
      setError(err?.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-gray-100">
      <div className="w-full max-w-sm">
        {/* NexMart Logo */}
        <div
          onClick={onBackToStore}
          className="flex flex-col items-center mb-8 cursor-pointer group"
          title="NexMart"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Store className="w-8 h-8" />
          </div>
          <span className="mt-3 text-2xl font-black tracking-tight text-white">
            NexMart
          </span>
        </div>

        {/* Login Box */}
        <div className="bg-gray-800/90 backdrop-blur-md p-8 shadow-2xl rounded-3xl border border-gray-700/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all text-center tracking-wider placeholder:text-gray-500 placeholder:tracking-normal"
                placeholder="Password"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
