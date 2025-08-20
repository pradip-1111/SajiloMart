
'use client';

import { useContext } from 'react';
import { LanguageContext, type LanguageContextType } from '@/components/language-provider';

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
