import React from 'react';
import { Language } from '../types';
import { translations } from '../translations/translations';
import { HologramRobot } from '../robot/HologramRobot';
import { Bot } from 'lucide-react';

interface RobotSectionProps {
  language: Language;
}

export const RobotSection: React.FC<RobotSectionProps> = ({ language }) => {
  const t = translations[language];

  return (
    <section id="robot-assistant" className="relative py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-3">
          <span className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            <span>{t.robotBadge}</span>
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.robotTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
          {t.robotSubtitle}
        </p>
      </div>

      {/* Interactive 3D Robot Component */}
      <HologramRobot language={language} />
    </section>
  );
};
