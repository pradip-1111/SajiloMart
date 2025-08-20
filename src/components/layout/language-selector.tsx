
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import { Globe } from 'lucide-react';
import { translations, type Locale } from '@/lib/i18n';

const languageNames: Record<Locale, string> = {
    en: 'English',
    ne: 'नेपाली (Nepali)',
    hi: 'हिन्दी (Hindi)',
    es: 'Español (Spanish)',
    de: 'Deutsch (German)',
    bn: 'বাংলা (Bengali)',
    fr: 'Français (French)',
    ja: '日本語 (Japanese)',
};

export default function LanguageSelector() {
  const { setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(translations) as Locale[]).map((lang) => (
          <DropdownMenuItem key={lang} onClick={() => setLocale(lang as Locale)}>
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
