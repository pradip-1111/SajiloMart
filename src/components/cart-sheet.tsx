
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartSheet({ children }: { children: React.ReactNode }) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>My Cart ({cartCount})</SheetTitle>
          <SheetDescription>Your current shopping cart items</SheetDescription>
        </SheetHeader>
        <Separator />
        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
              ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 bg-secondary/50">
                <div className="w-full space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                     <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
             <SheetTrigger asChild>
                <Button asChild>
                    <Link href="/#products">Continue Shopping</Link>
                </Button>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItemRow({ item, updateQuantity, removeFromCart }: { item: CartItem, updateQuantity: Function, removeFromCart: Function }) {
    return (
        <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-md">
                <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={`${item.category} product`} />
            </div>
            <div className="flex-1">
                <Link href={`/products/${item.id}`} className="font-semibold hover:text-primary">{item.name}</Link>
                <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                            className="h-8 w-16"
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name} from cart`}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
