import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { FileText, ExternalLink, Download, ShieldCheck } from 'lucide-react';

interface PdfSectionProps {
  language: Language;
}

export const PdfSection: React.FC<PdfSectionProps> = ({ language }) => {
  const t = translations[language];
  const pdfUrl = '/assets/aistudio/__________58c2dc9d.pdf';

  return (
    <section id="pdf-document" className="relative py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-3">
          Ресми құжат
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.pdfTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
          {t.pdfSubtitle}
        </p>
      </div>

      {/* PDF Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl glow-cyan text-center flex flex-col items-center">
        {/* Document Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-lg shadow-cyan-500/10">
          <FileText className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 max-w-xl">
          «Оқитын колледжден – зияткер ұлтқа: оқу мәдениеті мен жасанды интеллект үндестігі»
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mb-8">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Бекітілген құжат</span>
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700">
            {t.pdfPages}
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono-numbers">
            PDF · 14.7 MB
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>{t.pdfOpenTab}</span>
          </a>

          <a
            href={pdfUrl}
            download="Qaynar_Seminar_2026_Bagdarlama.pdf"
            className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t.pdfDownload}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
