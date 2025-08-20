
'use client';

import type { ReactNode } from 'react';
import { createContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { translations, type Locale, type Translations } from '@/lib/i18n';

// A function to get a specific translation string
// It supports nested keys like 'header.nav.home'
const getTranslation = (locale: Locale, key: string, translations: Translations): string => {
  const keys = key.split('.');
  let result: any = translations[locale];
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) {
      // Fallback to English if translation is missing
      let fallbackResult: any = translations['en'];
       for (const fk of keys) {
         fallbackResult = fallbackResult?.[fk];
         if(fallbackResult === undefined) {
            return key; // Return key if not found in English either
         }
       }
       return fallbackResult;
    }
  }
  return result;
};


export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'en');

  const t = (key: string) => {
    return getTranslation(locale, key, translations);
  };

  const value: LanguageContextType = {
    locale,
    setLocale: (newLocale: Locale) => {
        if (translations[newLocale]) {
            setLocale(newLocale);
        }
    },
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
        {children}
    </LanguageContext.Provider>
  );
}
