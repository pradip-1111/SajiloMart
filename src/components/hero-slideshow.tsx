
'use client';

import { useEffect, useState } from 'react';
import { useHeroImages } from '@/hooks/use-hero-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function HeroSlideshow() {
  const { heroImages } = useHeroImages();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  if (heroImages.length === 0) {
    return (
        <div 
            className="absolute inset-0 bg-gray-400"
            data-ai-hint="abstract 3d background"
        ></div>
    );
  }

  return (
    <>
      {heroImages.map((imageUrl, index) => (
        <Image
          key={imageUrl}
          src={imageUrl}
          alt={`Hero background ${index + 1}`}
          layout="fill"
          objectFit="cover"
          className={cn(
            'transition-opacity duration-1000 ease-in-out',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
          priority={index === 0}
        />
      ))}
    </>
  );
}
