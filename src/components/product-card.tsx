
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    addToCart(product);
  };

  return (
    <div className="flex flex-col overflow-hidden transition-all duration-300 group border rounded-lg hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block overflow-hidden">
          <div className="w-full aspect-square relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
              data-ai-hint={`${product.category} product`}
            />
          </div>
      </Link>
      <div className="p-2 border-t flex-grow flex flex-col justify-between">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-semibold leading-tight hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <p className="text-md font-bold text-primary">₹{product.price.toFixed(2)}</p>
          <Button
            size="icon"
            variant="outline"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="h-8 w-8"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
