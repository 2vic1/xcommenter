'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';

export function LanguageToggle() {
  const { t, toggleLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 font-bold"
      onClick={toggleLang}
      aria-label="Switch language"
      title="تغییر زبان / Switch language"
    >
      <Languages className="h-4 w-4" />
      <span className="sr-only">{t('app.language')}</span>
    </Button>
  );
}
