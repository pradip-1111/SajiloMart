
'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import HeroSlideshow from '@/components/hero-slideshow';
import DynamicHeroText from '@/components/dynamic-hero-text';
import { useEffect, useState, Suspense } from 'react';
import { getProducts } from '@/lib/product-actions';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import CategoryShowcase from '@/components/category-showcase';
import PromoBannerCarousel from '@/components/promo-banner-carousel';
import { useTranslation } from '@/hooks/use-translation';

const ProductShowcase = dynamic(() => import('@/components/product-showcase'), {
  loading: () => <ShowcaseSkeleton />,
  ssr: false,
});
const SaleBanner = dynamic(() => import('@/components/sale-banner'), { ssr: false });

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();
      setAllProducts(products);

      // Create different product arrays for each showcase section
      setTopRatedProducts([...products].sort((a, b) => b.rating - a.rating).slice(0, 5));
      setDiscountProducts(products.filter(p => p.offers.length > 0).slice(0, 5));
    }
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative bg-background py-20 md:py-32 overflow-hidden">
         <HeroSlideshow />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="p-6 rounded-lg bg-gray-900/70 backdrop-blur-sm">
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-md">
              Welcome to SajiloMart: {t('home.hero.title')} <DynamicHeroText />
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
             {t('home.hero.subtitle')}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="#deals">
                  <Sparkles className="mr-2" /> {t('home.hero.shopNow')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/80 backdrop-blur-sm">
                  <Link href="/learning-zone">
                      {t('home.hero.learningZone')}
                  </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="py-12 space-y-16">
        <CategoryShowcase />
      </div>

      <div className="py-12 space-y-16">
        <PromoBannerCarousel />
      </div>
      
      <div id="deals" className="py-12 space-y-16 bg-secondary/20">
        <Suspense>
          <SaleBanner />
        </Suspense>
        <Suspense fallback={<ShowcaseSkeleton />}>
          <ProductShowcase title={t('home.showcase.topRated')} products={topRatedProducts} layout="featured"/>
        </Suspense>
        <Suspense fallback={<ShowcaseSkeleton />}>
          <ProductShowcase title={t('home.showcase.discounts')} products={discountProducts} />
        </Suspense>
      </div>

    </div>
  );
}


const ShowcaseSkeleton = () => (
  <div className="container mx-auto px-4">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-24" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      ))}
    </div>
  </div>
);
