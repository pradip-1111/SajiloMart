
'use client';

import { translations, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const languages = Object.keys(translations) as Locale[];

export default function DynamicLogo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % languages.length);
            setKey(prev => prev + 1); // Force re-render for animation
            setIsFading(false);
        }, 500); // Half a second for fade-out
    }, 2500); // Change language every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentLogoText = translations[languages[currentIndex]].logo;

  return (
    <div className="relative h-7 flex items-center" style={{ width: '110px' }}>
       <span
          key={key}
          className={cn(
            'font-headline text-xl font-bold transition-opacity duration-500 absolute w-full text-left',
            isFading ? 'opacity-0' : 'opacity-100'
          )}
        >
          {currentLogoText}
        </span>
    </div>
  );
}
