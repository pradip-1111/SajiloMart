
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { usePromoBanners } from '@/hooks/use-promo-banners';


export default function PromoBannerCarousel() {
  const { promoBanners } = usePromoBanners();

  if (promoBanners.length === 0) {
    return null; // Don't render anything if there are no banners
  }

  return (
    <Carousel
      className="w-full"
      opts={{ loop: true }}
      autoplay={{ delay: 4000, stopOnInteraction: true }}
    >
      <CarouselContent>
        {promoBanners.map((banner) => (
          <CarouselItem key={banner.id}>
            <Card className="overflow-hidden">
                <div className="relative h-64 w-full">
                    <Image
                        src={banner.background}
                        alt={banner.title}
                        layout="fill"
                        objectFit="cover"
                        className="opacity-80"
                    />
                     <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 flex items-center">
                        <div className="flex items-center gap-8">
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                width={200}
                                height={200}
                                className="rounded-lg shadow-2xl hidden md:block aspect-square object-cover"
                            />
                            <div className="text-white">
                                <p className="text-xl mt-1 text-primary-foreground/90">{banner.subtitle}</p>
                                <p className="mt-2 max-w-sm text-primary-foreground/80">{banner.description}</p>
                                <Button asChild className="mt-4 bg-accent hover:bg-accent/90">
                                    <Link href={banner.link}>Shop Now</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
