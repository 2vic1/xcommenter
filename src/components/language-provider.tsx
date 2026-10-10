'use client';

import * as React from 'react';
import { type Language, type TranslationKey, getTranslator } from '@/lib/translations';

interface LanguageContextValue {
  lang: Language;
  t: (key: TranslationKey) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'commentyar-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>('fa');
  const [mounted, setMounted] = React.useState(false);

  // Load saved language on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'fa' || saved === 'en') {
        setLangState(saved);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // Update document direction + lang attribute whenever language changes
  React.useEffect(() => {
    if (!mounted) return;
    const dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, mounted]);

  const setLang = React.useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = React.useCallback(() => {
    setLangState((prev) => {
      const next: Language = prev === 'fa' ? 'en' : 'fa';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = React.useMemo(() => getTranslator(lang), [lang]);
  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  const value: LanguageContextValue = { lang, t, setLang, toggleLang, dir };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
