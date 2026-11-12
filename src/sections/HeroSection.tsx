import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { ChevronDown, Calendar, Clock, MapPin } from 'lucide-react';

interface HeroSectionProps {
  language: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ language }) => {
  const t = translations[language];

  const handleScrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToRegistration = () => {
    document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16 pb-12 overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[580px] h-[320px] sm:h-[580px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Original College Logo */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 via-yellow-400/20 to-blue-500/30 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />
          <img
            src="/assets/aistudio/image_7c0c0c14.png"
            alt="Высший колледж «Қайнар»"
            referrerPolicy="no-referrer"
            className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain drop-shadow-xl"
          />
        </div>

        {/* College Name */}
        <div className="inline-block mb-3 px-3.5 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 text-xs sm:text-sm font-semibold tracking-wider text-cyan-300">
          {t.collegeName}
        </div>

        {/* Regional Seminar Scope Kicker */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-4 font-medium leading-relaxed px-2">
          {t.heroKicker}
        </p>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          <span className="text-gradient-cyan">
            {t.mainTitle}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-8 leading-snug">
          {t.subTitle}
        </p>

        {/* Seminar Meta Strip (Date · Time · Venue) */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-10 text-left">
          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Күні / Дата</div>
              <div className="text-xs sm:text-sm font-bold text-white">{t.dateLabel}</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Уақыты / Время</div>
              <div className="text-xs sm:text-sm font-bold text-white font-mono-numbers">{t.timeLabel}</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Орны / Место</div>
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-none">{t.placeLabel}</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons: СЕМИНАРМЕН ТАНЫСУ + СЕМИНАРҒА ТІРКЕЛУ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-4 sm:px-0">
          <button
            type="button"
            onClick={handleScrollToAbout}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 rounded-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>{t.heroCta}</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleScrollToRegistration}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold text-white border border-cyan-400/60 bg-white/5 backdrop-blur rounded-2xl hover:bg-cyan-400/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>{t.regTitle}</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Year Label */}
        <div className="mt-8 text-xs font-mono-numbers text-slate-500 tracking-widest uppercase">
          Семей · {t.year} жыл
        </div>
      </div>
    </section>
  );
};
