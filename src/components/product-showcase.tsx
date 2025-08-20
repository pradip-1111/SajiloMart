
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/products';
import { useTranslation } from '@/hooks/use-translation';

type ProductShowcaseProps = {
  title: string;
  products: Product[];
  layout?: 'default' | 'featured';
};

export default function ProductShowcase({ title, products, layout = 'default' }: ProductShowcaseProps) {
  if (layout === 'featured' && products.length >= 5) {
    return <FeaturedGridLayout title={title} products={products} />;
  }
  return <DefaultGridLayout title={title} products={products} />;
}

const ShowcaseCard = ({ product, subtitle }: { product: Product, subtitle: string }) => (
    <Link href={`/products/${product.id}`} className="block group h-full">
        <Card className="h-full overflow-hidden flex flex-col">
            <div className="flex-shrink-0 w-full aspect-square relative overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`${product.category} product`}
                />
            </div>
            <div className="p-3 text-center flex-grow flex flex-col justify-center">
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-sm text-primary font-medium">{subtitle}</p>
            </div>
        </Card>
    </Link>
);

const DefaultGridLayout = ({ title, products }: { title: string, products: Product[] }) => {
    const { t } = useTranslation();
    return (
    <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Button variant="outline" size="sm" asChild>
                <Link href="/products">{t('home.showcase.viewAll')} <ChevronRight className="ml-1" /></Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {products.slice(0, 5).map((product) => (
                <ShowcaseCard key={product.id} product={product} subtitle={`From ₹${product.price.toFixed(2)}`} />
            ))}
        </div>
    </section>
)};

const FeaturedGridLayout = ({ title, products }: { title: string, products: Product[] }) => {
    const featuredProduct = products[0];
    const otherProducts = products.slice(1, 5);
    const { t } = useTranslation();

    return (
         <section className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/products">{t('home.showcase.viewAll')} <ChevronRight className="ml-1" /></Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
                <div className="col-span-2 row-span-2 h-full min-h-[250px] md:min-h-0">
                     <Link href={`/products/${featuredProduct.id}`} className="block group h-full">
                        <Card className="h-full overflow-hidden">
                            <div className="w-full h-full relative">
                                 <Image
                                    src={featuredProduct.image}
                                    alt={featuredProduct.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={`${featuredProduct.category} product`}
                                />
                                <div className="p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent absolute bottom-0 w-full text-white">
                                    <h3 className="font-headline text-2xl font-bold">{featuredProduct.name}</h3>
                                    <p className="text-md font-medium text-primary-foreground/90">Top Pick for You</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
                {otherProducts.map(product => (
                     <div key={product.id} className="col-span-1 row-span-1 h-full min-h-[250px]">
                        <ShowcaseCard product={product} subtitle={`From ₹${product.price.toFixed(2)}`}/>
                    </div>
                ))}
            </div>
        </section>
    )
}

