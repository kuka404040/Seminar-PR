import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface HeaderLanguageProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const HeaderLanguage: React.FC<HeaderLanguageProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:block" />
      <button
        type="button"
        onClick={() => onLanguageChange('kk')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
          currentLanguage === 'kk'
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        ҚАЗ
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange('ru')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
          currentLanguage === 'ru'
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        РУС
      </button>
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
          currentLanguage === 'en'
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        ENG
      </button>
    </div>
  );
};
