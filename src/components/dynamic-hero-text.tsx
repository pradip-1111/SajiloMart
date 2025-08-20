
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const rotatingItems = [
  { text: "Everyday Savings", color: "text-accent" },
  { text: "Top Brands", color: "text-chart-1" },
  { text: "Fresh Groceries", color: "text-chart-2" },
  { text: "Latest Gadgets", color: "text-chart-3" },
  { text: "Trendy Fashion", color: "text-chart-4" }
];


export default function DynamicHeroText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingItems.length);
        setIsFading(false);
      }, 500); // This should match the transition duration
    }, 3000); // Time each word is displayed

    return () => clearInterval(interval);
  }, []);

  return (
    <span
        className={cn(
            'transition-opacity duration-500',
            isFading ? 'opacity-0' : 'opacity-100',
            rotatingItems[currentIndex].color
        )}
    >
        {rotatingItems[currentIndex].text}
    </span>
  );
}
