import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations/translations';

interface AdminLoginProps {
  language: Language;
  onSuccess: (token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ language, onSuccess }) => {
  const t = translations[language];
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError(t.adminPassPlaceholder);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.adminLogin(password);
      if (res.success && res.token) {
        localStorage.setItem('qaynar_admin_token', res.token);
        onSuccess(res.token);
      } else {
        setError(res.message || 'Құпиясөз қате');
      }
    } catch {
      setError('Сервермен байланыс қатесі');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl glow-cyan">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {t.adminLogin}
          </h2>
          <p className="text-xs text-slate-400">
            Высший колледж «Қайнар» · Басқару жүйесі
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Құпиясөз / Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.adminPassPlaceholder}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 text-sm outline-none transition"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Тексерілуде...' : t.adminEnterBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-cyan-400 transition"
          >
            ← Басты бетке қайту
          </a>
        </div>
      </div>
    </div>
  );
};
