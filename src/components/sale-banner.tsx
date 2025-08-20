
'use client';

import { useSale } from '@/hooks/use-sale';
import Image from 'next/image';
import CountdownTimer from './countdown-timer';
import { Button } from './ui/button';
import Link from 'next/link';

export default function SaleBanner() {
  const { saleConfig } = useSale();

  if (!saleConfig.isActive) {
    return null;
  }

  const backgroundImage = saleConfig.backgroundImage || 'https://placehold.co/1920x500.png';

  return (
    <section className="relative w-full h-[500px] bg-gray-800 text-white flex items-center justify-center">
      <Image
        src={backgroundImage}
        alt="Summer sale background"
        layout="fill"
        objectFit="cover"
        className="opacity-40"
        data-ai-hint="fashion models sale"
      />
      <div className="relative z-10 text-center p-4">
        <h2 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
          Hurry Up! Get Up to 50% Off
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-xl mx-auto drop-shadow">
          Step into summer with sun-ready styles at can't-miss prices.
        </p>
        <div className="mt-8">
          <CountdownTimer endDate={saleConfig.endDate} />
        </div>
        <div className="mt-8">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/products">Shop The Summer Sale</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
