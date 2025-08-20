
'use client';

import * as React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ContentCarouselItemData = {
  id: number;
  title: string;
  price: string;
  brands: string;
  productImage: string;
  backgroundImage: string;
  productAiHint: string;
  backgroundAiHint: string;
};

const carouselItems: ContentCarouselItemData[] = [
    {
        id: 1,
        title: 'Beds',
        price: 'From ₹8,999',
        brands: 'Wooden Street, Sleepyhead & more',
        productImage: 'https://placehold.co/400x300.png',
        backgroundImage: 'https://placehold.co/1200x400/3b82f6/ffffff.png',
        productAiHint: 'modern wooden bed',
        backgroundAiHint: 'blue celebration background'
    },
    {
        id: 2,
        title: 'Sofas',
        price: 'From ₹12,999',
        brands: 'Home Centre, Urban Ladder & more',
        productImage: 'https://placehold.co/400x300.png',
        backgroundImage: 'https://placehold.co/1200x400/8b5cf6/ffffff.png',
        productAiHint: 'modern sofa living room',
        backgroundAiHint: 'purple celebration background'
    },
    {
        id: 3,
        title: 'Chairs',
        price: 'From ₹4,999',
        brands: 'Featherlite, Green Soul & more',
        productImage: 'https://placehold.co/400x300.png',
        backgroundImage: 'https://placehold.co/1200x400/ec4899/ffffff.png',
        productAiHint: 'stylish accent chair',
        backgroundAiHint: 'pink celebration background'
    },
];

type PropType = {
  options?: any;
  slides: ContentCarouselItemData[];
};

export const ContentCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((item) => (
            <div className="relative flex-[0_0_100%] h-64 md:h-80" key={item.id}>
              <Image
                src={item.backgroundImage}
                alt={`${item.title} background`}
                fill
                className="object-cover"
                data-ai-hint={item.backgroundAiHint}
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="container mx-auto px-4 h-full">
                <div className="relative h-full flex items-center gap-8">
                  <div className="hidden md:block w-1/3 max-w-xs p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
                    <Image
                      src={item.productImage}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="object-cover rounded-md aspect-[4/3]"
                      data-ai-hint={item.productAiHint}
                    />
                  </div>
                  <div className="text-white drop-shadow-lg">
                    <h3 className="text-3xl md:text-5xl font-bold">{item.title}</h3>
                    <p className="text-xl md:text-2xl font-semibold mt-1">{item.price}</p>
                    <p className="text-md md:text-lg text-white/90 mt-2">{item.brands}</p>
                     <Button asChild className="mt-4 bg-white text-primary hover:bg-gray-200">
                        <Link href="/products">Shop Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        <div className="embla__dots">
            {scrollSnaps.map((_, index) => (
            <button
                key={index}
                onClick={() => scrollTo(index)}
                className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
                )}
            />
            ))}
        </div>
        
    </div>
  );
};

export default function ContentCarouselWrapper() {
    return <ContentCarousel slides={carouselItems} options={{ loop: true }} />;
}
