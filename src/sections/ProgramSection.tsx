import React, { useEffect, useState } from 'react';
import { Language, ProgramEvent } from '../types';
import { programI18n } from '../translations/programI18n';
import { translations } from '../translations/translations';
import { api } from '../services/api';
import { Clock, MapPin, UserCheck, CalendarDays } from 'lucide-react';

interface ProgramSectionProps {
  language: Language;
}

export const ProgramSection: React.FC<ProgramSectionProps> = ({ language }) => {
  const t = translations[language];
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProgram() {
      try {
        const data = await api.getProgram();
        if (data && data.length > 0) {
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to load program:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgram();
  }, []);

  return (
    <section id="program" className="relative py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-3">
          {t.programBadge}
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.programTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto">
          {t.programSubtitle}
        </p>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute top-4 bottom-4 left-4 sm:left-8 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/40 to-cyan-500/20 pointer-events-none" />

        <div className="space-y-6 sm:space-y-8">
          {events.map((event, idx) => {
            const tr = programI18n[language]?.[event.id];
            const evTitle = tr?.title ?? event.title;
            const evLocation = tr?.location ?? event.location;
            const evSpeakers = tr?.speakers ?? event.speakers;
            return (
              <div key={event.id || idx} className="relative flex items-start gap-4 sm:gap-8 group">
                {/* Timeline node */}
                <div className="relative z-10 w-8 sm:w-16 flex items-center justify-center shrink-0 pt-1.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                    <span className="text-[11px] font-mono-numbers font-bold text-cyan-400">
                      {idx + 1}
                    </span>
                  </div>
                </div>

                {/* Event Card */}
                <div className="flex-1 glass-panel p-5 sm:p-6 rounded-2xl hover:border-cyan-500/40 transition-all duration-300">
                  {/* Time & Location Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-300 font-mono-numbers">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.time_slot}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{evLocation}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 leading-snug group-hover:text-cyan-200 transition-colors">
                    {evTitle}
                  </h3>

                  {/* Speaker & Affiliation */}
                  {evSpeakers && (
                    <div className="pt-3 border-t border-slate-800/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <UserCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="whitespace-pre-line leading-relaxed font-medium">
                        {evSpeakers}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
