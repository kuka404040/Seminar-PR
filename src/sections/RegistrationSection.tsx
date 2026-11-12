import React, { useState } from 'react';
import { Language, Participant } from '../types';
import { translations } from '../translations/translations';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { CheckCircle2, User, Building, X, Database } from 'lucide-react';

interface RegistrationSectionProps {
  language: Language;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({ language }) => {
  const t = translations[language];

  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successParticipant, setSuccessParticipant] = useState<Participant | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage(t.errFullNameRequired);
      return;
    }
    if (!organization.trim()) {
      setErrorMessage(t.errOrgRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.register(fullName.trim(), organization.trim());
      if (res.success && res.participant) {
        setSuccessParticipant(res.participant);
        setShowSuccessModal(true);
        setFullName('');
        setOrganization('');

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#38bdf8', '#818cf8', '#facc15']
          });
        } catch {}
      } else {
        setErrorMessage(t.errServer);
      }
    } catch (err: any) {
      setErrorMessage(t.errServer);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="registration" className="relative py-16 sm:py-24 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-3">
          {t.regBadge}
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.regTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto">
          {t.regSubtitle}
        </p>
      </div>

      {/* Form Card (Strictly 2 Fields) */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl glow-cyan">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field #1: Аты-жөні */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{t.fullNameLabel}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 text-sm sm:text-base transition duration-200 outline-none"
              />
            </div>
          </div>

          {/* Field #2: Ұйым атауы */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>{t.orgLabel}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={t.orgPlaceholder}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 text-sm sm:text-base transition duration-200 outline-none"
              />
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 active:scale-[0.99] text-slate-950 font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? t.registeringBtn : t.registerBtn}</span>
          </button>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && successParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl glow-cyan border border-cyan-500/40 text-center">
            {/* Close button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              {t.successTitle}
            </h3>

            <div className="mt-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-left space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">{t.regNumLabel}:</span>
                <span className="font-mono-numbers font-bold text-cyan-400 text-sm sm:text-base">
                  {successParticipant.reg_number}
                </span>
              </div>

              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">{t.fullNameLabel}:</span>
                <span className="font-semibold text-white text-right">
                  {successParticipant.full_name}
                </span>
              </div>

              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">{t.orgLabel}:</span>
                <span className="font-semibold text-white text-right max-w-[65%]">
                  {successParticipant.organization}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t.regDateLabel}:</span>
                <span className="font-mono-numbers text-slate-300">
                  {new Date(successParticipant.created_at).toLocaleString('kk-KZ', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-cyan-400/80">
              <Database className="w-3.5 h-3.5" />
              <span>{t.savedInDb}</span>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
