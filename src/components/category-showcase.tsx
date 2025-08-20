
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useShowcaseCategories } from '@/hooks/use-showcase-categories';
import { Skeleton } from './ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { getProductById } from '@/lib/product-actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';

export default function CategoryShowcase() {
  const { showcaseCategories, loading } = useShowcaseCategories();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleShowcaseItemClick = async (productId: string | undefined) => {
    if (!productId) {
      toast({
        title: 'Product not available',
        description: 'This showcase item is not linked to a specific product.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const product = await getProductById(productId);

    if (product) {
      addToCart(product);
    } else {
      toast({
        title: 'Error',
        description: 'Could not find the product to add to cart.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <CategoryShowcaseSkeleton />;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {showcaseCategories.map((category) => (
          <div key={category.id} className="bg-background border rounded-lg p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">{category.mainTitle}</h2>
            <div className="grid grid-cols-2 gap-4 flex-grow">
              {category.items.map((item) => (
                <div key={item.title} className="group cursor-pointer" onClick={() => handleShowcaseItemClick(item.productId)}>
                  <div className="w-full aspect-square relative mb-2 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={item.aiHint}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="secondary" className="h-10 w-10">
                            <ShoppingCart className="h-5 w-5"/>
                        </Button>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium">{item.title}</h3>
                </div>
              ))}
            </div>
            <Link href={category.mainHref} className="text-sm text-primary hover:underline mt-4">
              Explore all
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}


const CategoryShowcaseSkeleton = () => (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background border rounded-lg p-4 flex flex-col">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="grid grid-cols-2 gap-4 flex-grow">
              {[...Array(4)].map((_, j) => (
                <div key={j}>
                    <Skeleton className="w-full aspect-square rounded-md mb-2" />
                    <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
             <Skeleton className="h-4 w-1/4 mt-4" />
          </div>
        ))}
      </div>
    </section>
)
