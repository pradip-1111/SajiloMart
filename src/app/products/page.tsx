
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { type Product, categories } from '@/lib/products';
import { getProducts } from '@/lib/product-actions';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PromoBannerCarousel from '@/components/promo-banner-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import ContentCarouselWrapper from '@/components/content-carousel';
import { useTranslation } from '@/hooks/use-translation';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('q') || '';
  const { t } = useTranslation();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState(initialSearchQuery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const products = await getProducts();
      setAllProducts(products);
      setFilteredProducts(products);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    setLocalSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    let newFilteredProducts = allProducts;

    if (selectedCategory !== 'all') {
      newFilteredProducts = newFilteredProducts.filter((p) => p.category === selectedCategory);
    }

    const query = localSearchQuery.toLowerCase();
    if (query) {
      newFilteredProducts = newFilteredProducts.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredProducts(newFilteredProducts);
  }, [selectedCategory, localSearchQuery, allProducts]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="font-headline text-4xl font-bold">{t('products.allProducts')}</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder={t('products.searchPlaceholder')}
            className="w-full md:w-64"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2" />
                {t('products.category')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{t('products.productCategory')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <DropdownMenuRadioItem value="all">{t('products.all')}</DropdownMenuRadioItem>
                {categories.map((category) => (
                  <DropdownMenuRadioItem key={category} value={category}>
                    {category}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
         <Card className="col-span-full">
            <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('products.noProducts')}</p>
            </CardContent>
         </Card>
      )}
    </>
  );
}

const LoadingSkeleton = () => (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <Skeleton className="h-10 w-1/3" />
            <div className="flex gap-2 w-full md:w-auto">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    </div>
);

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <PromoBannerCarousel />
      </div>
      <div className="mb-8">
        <ContentCarouselWrapper />
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}

