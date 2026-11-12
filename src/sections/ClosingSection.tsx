import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { Heart, Sparkles } from 'lucide-react';

interface ClosingSectionProps {
  language: Language;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer className="relative pt-16 pb-20 px-4 sm:px-6 max-w-4xl mx-auto text-center border-t border-slate-800/80">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* College Logo */}
      <div className="relative mb-6 inline-block">
        <img
          src="/assets/aistudio/image_7c0c0c14.png"
          alt="Высший колледж «Қайнар»"
          referrerPolicy="no-referrer"
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <span>{t.closingTitle}</span>
        <Sparkles className="w-5 h-5 text-cyan-400" />
      </h2>

      {/* Closing message */}
      <p className="text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
        {t.closingText}
      </p>

      {/* Organizer signature */}
      <div className="text-xs sm:text-sm text-cyan-400 font-semibold tracking-wider uppercase mb-12">
        {t.organizerSign}
      </div>

      {/* Quiet copyright */}
      <div className="text-xs text-slate-500 font-mono-numbers">
        {t.copyright}
      </div>
    </footer>
  );
};
