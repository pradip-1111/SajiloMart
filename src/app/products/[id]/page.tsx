
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { type Product } from '@/lib/products';
import { getProducts } from '@/lib/product-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { Star, CheckCircle, Shield, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductData() {
        setLoading(true);
        const allProducts = await getProducts();
        const foundProduct = allProducts.find((p) => p.id === params.id);
        
        if (foundProduct) {
            setProduct(foundProduct);
            const foundRelated = allProducts.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0, 4);
            setRelatedProducts(foundRelated);
        } else {
            notFound();
        }
        setLoading(false);
    }

    if (params.id) {
        fetchProductData();
    }
  }, [params.id]);


  if (loading) {
    return <ProductPageSkeleton />
  }

  if (!product) {
    return notFound();
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-5 h-5',
            i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
          )}
        />
      ));
  };
  
  const handleAddToCart = () => {
    if (!user) {
        window.location.href = '/login';
        return;
    }
    addToCart(product, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col gap-4">
            <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg">
                 <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={`${product.category} product`} />
            </div>
             <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square relative overflow-hidden rounded-md border-2 border-transparent hover:border-primary transition cursor-pointer">
                        <Image src={product.image} alt={`${product.name} thumbnail ${i+1}`} layout="fill" objectFit="cover" data-ai-hint={`${product.category} product`} />
                    </div>
                ))}
            </div>
        </div>

        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
            <span className="text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewsCount} reviews)</span>
          </div>
          <p className="text-4xl font-bold text-primary mt-4">₹{product.price.toFixed(2)}</p>
          
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <p className="text-muted-foreground mt-4">{product.description}</p>

          <Separator className="my-6" />

          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="font-semibold">{t('products.quantity')}</label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
              className="w-20"
            />
          </div>
          <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart}>{t('products.addToCart')}</Button>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-medium">Free & Fast Shipping</span>
            </div>
             <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-medium">2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span className="font-medium">In Stock & Ready to Ship</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('products.productDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {product.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div>
           <Card>
                <CardHeader>
                    <CardTitle>{t('products.customerReviews')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Mock reviews */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">{renderStars(5)}</div>
                        <p className="font-semibold">"Absolutely fantastic!"</p>
                        <p className="text-sm text-muted-foreground">- Alex R. on {new Date().toLocaleDateString()}</p>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-1">{renderStars(4)}</div>
                        <p className="font-semibold">"Great value for the price."</p>
                        <p className="text-sm text-muted-foreground">- Sarah J. on {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

       <div className="mt-16">
          <h2 className="font-headline text-3xl font-bold mb-6">{t('products.relatedProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
       </div>
    </div>
  );
}


function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="grid grid-cols-4 gap-2">
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Skeleton className="aspect-square w-full rounded-md" />
                        <Skeleton className="aspect-square w-full rounded-md" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-48" />
                </div>
            </div>
            <div className="mt-16">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-56 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

