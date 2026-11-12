import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { BookOpen, Cpu, Sparkles, Target, Compass } from 'lucide-react';

interface AboutSectionProps {
  language: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ language }) => {
  const t = translations[language];

  const tasks = [
    { id: '01', text: t.task1, icon: BookOpen },
    { id: '02', text: t.task2, icon: Cpu },
    { id: '03', text: t.task3, icon: Sparkles },
    { id: '04', text: t.task4, icon: Target },
    { id: '05', text: t.task5, icon: Compass },
  ];

  return (
    <section id="about" className="relative py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-3">
          Ақпараттық шолу
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.aboutTitle}
        </h2>
      </div>

      {/* Main Salutation & Purpose Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl glow-cyan mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-cyan-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
          {t.aboutSalutation}
        </div>
        
        <p className="text-base sm:text-xl text-white font-semibold leading-relaxed mb-6">
          {t.aboutInvite}
        </p>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-6" />

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          {t.aboutGoal}
        </p>
      </div>

      {/* Tasks Grid */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{t.aboutTasksTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task, idx) => {
            const Icon = task.icon;
            const isLast = idx === tasks.length - 1;
            return (
              <div
                key={task.id}
                className={`glass-panel-subtle p-5 rounded-2xl hover:border-cyan-500/30 transition-colors flex gap-4 ${
                  isLast ? 'md:col-span-2' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono-numbers text-cyan-400 font-bold mb-1">
                    {task.id}.
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {task.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
