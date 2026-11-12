import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { HeaderLanguage } from './components/HeaderLanguage';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { RegistrationSection } from './sections/RegistrationSection';
import { ProgramSection } from './sections/ProgramSection';
import { PdfSection } from './sections/PdfSection';
import { RobotSection } from './sections/RobotSection';
import { ClosingSection } from './sections/ClosingSection';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { api } from './services/api';

export default function App() {
  const [language, setLanguage] = useState<Language>('kk');

  // Браузер қойындысының атауы мен html lang — таңдалған тілге сәйкес
  useEffect(() => {
    const titles: Record<string, string> = {
      kk: '«Оқитын колледжден – зияткер ұлтқа» — «Қайнар» жоғары колледжі',
      ru: '«От читающего колледжа – к интеллектуальной нации» — Высший колледж «Кайнар»',
      en: '“From a Reading College to an Intellectual Nation” — Higher College “Qaynar”',
    };
    document.title = titles[language] || titles.kk;
    document.documentElement.lang = language;
  }, [language]);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Check route on mount and popstate
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const isAdmin = path.startsWith('/admin') || hash === '#admin' || params.has('admin');
      setIsAdminRoute(isAdmin);

      if (isAdmin) {
        const storedToken = localStorage.getItem('qaynar_admin_token');
        if (storedToken) {
          api.checkAdminAuth(storedToken).then((valid) => {
            if (valid) {
              setAdminToken(storedToken);
            } else {
              localStorage.removeItem('qaynar_admin_token');
              setAdminToken(null);
            }
            setIsCheckingAdmin(false);
          }).catch(() => {
            setIsCheckingAdmin(false);
          });
        } else {
          setIsCheckingAdmin(false);
        }
      } else {
        setIsCheckingAdmin(false);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const handleAdminLogout = () => {
    api.adminLogout();
    localStorage.removeItem('qaynar_admin_token');
    setAdminToken(null);
  };

  // ADMIN ROUTE VIEW
  if (isAdminRoute) {
    if (isCheckingAdmin) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="text-sm font-medium animate-pulse">Жүйеге кіру тексерілуде...</div>
        </div>
      );
    }

    if (!adminToken) {
      return (
        <AdminLogin
          language={language}
          onSuccess={(token) => setAdminToken(token)}
        />
      );
    }

    return (
      <AdminDashboard
        language={language}
        token={adminToken}
        onLogout={handleAdminLogout}
      />
    );
  }

  // PUBLIC ONE-PAGE VIEW (ABSOLUTELY NO MENUS)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Functional Language Switcher only (NO Menu, NO Navbar) */}
      <HeaderLanguage
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* 1. Главный экран */}
      <HeroSection language={language} />

      {/* 2. Информация о семинаре */}
      <AboutSection language={language} />

      {/* 3. Регистрация участников */}
      <RegistrationSection language={language} />

      {/* 4. Официальная программа семинара */}
      <ProgramSection language={language} />

      {/* 5. Просмотр и скачивание PDF */}
      <PdfSection language={language} />

      {/* 6. Интерактивный анимированный робот */}
      <RobotSection language={language} />

      {/* 7. Заключительный блок */}
      <ClosingSection language={language} />
    </div>
  );
}
