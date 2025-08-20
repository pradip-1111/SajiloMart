
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCoupons } from '@/hooks/use-coupons';
import type { Coupon } from '@/lib/coupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, CreditCard, Wallet, Truck, Loader2, Ticket, XCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { generateOrderConfirmationEmailAction } from './actions';
import withAuth from '@/components/with-auth';
import { isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { createOrder } from '@/lib/order-actions';
import type { Order } from '@/lib/orders';
import { useTranslation } from '@/hooks/use-translation';

function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { coupons, updateCouponUsage } = useCoupons();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const { t } = useTranslation();

  const finalTotal = useMemo(() => {
    return Math.max(0, cartTotal - discountAmount);
  }, [cartTotal, discountAmount]);


  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon) {
      toast({ title: 'Invalid Coupon', description: 'The coupon code you entered is not valid.', variant: 'destructive' });
      setCouponCode('');
      return;
    }

    if (!coupon.isActive || isPast(parseISO(coupon.expiryDate))) {
      toast({ title: 'Expired Coupon', description: 'This coupon is no longer active.', variant: 'destructive' });
      return;
    }

    if (coupon.timesUsed >= coupon.usageLimit) {
      toast({ title: 'Coupon Limit Reached', description: 'This coupon has been used the maximum number of times.', variant: 'destructive' });
      return;
    }

    // Check if coupon applies to items in cart
    const applicableItems = cartItems.filter(item => {
        if (coupon.applicableScope === 'all') return true;
        if (coupon.applicableScope === 'category') return coupon.applicableIds.includes(item.category);
        if (coupon.applicableScope === 'product') return coupon.applicableIds.includes(item.id);
        return false;
    });

    if (applicableItems.length === 0) {
        toast({ title: 'Coupon Not Applicable', description: 'This coupon does not apply to any items in your cart.', variant: 'destructive' });
        return;
    }

    const applicableTotal = applicableItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = applicableTotal * (coupon.value / 100);
    } else { // fixed
      discount = Math.min(applicableTotal, coupon.value); // Ensure fixed discount isn't more than the total of applicable items
    }
    
    setDiscountAmount(discount);
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    toast({ title: 'Coupon Applied!', description: `You've received a discount of ₹${discount.toFixed(2)}.` });
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCoupon(couponCode.trim());
  };
  
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast({ title: 'Coupon Removed', description: 'The discount has been removed from your order.' });
  }

  // Effect to check for and apply a claimed coupon from local storage
  useEffect(() => {
    // This check ensures localStorage is only accessed on the client-side.
    if (typeof window !== 'undefined') {
        const claimedCouponCode = localStorage.getItem('claimedCouponCode');
        if (claimedCouponCode) {
            applyCoupon(claimedCouponCode);
            localStorage.removeItem('claimedCouponCode'); // Clear it after attempting to apply
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupons]); // Re-run if coupons list changes

  useEffect(() => {
    if (user?.displayName) {
      const [first, ...last] = user.displayName.split(' ');
      setFirstName(first || '');
      setLastName(last.join(' ') || '');
    }
  }, [user]);


  const handlePlaceOrder = async () => {
    if (!user || !user.uid || !user.email) {
        toast({ title: 'Authentication Error', description: 'Could not verify user. Please try logging in again.', variant: 'destructive' });
        router.push('/login');
        return;
    }
    if (!firstName.trim() || !lastName.trim()) {
        toast({
            title: 'Validation Error',
            description: 'Please enter your first and last name.',
            variant: 'destructive',
        });
        return;
    }
    
    setLoading(true);

    const orderData: Omit<Order, 'id' | 'date' | 'status'> = {
        userId: user.uid,
        customerName: `${firstName} ${lastName}`,
        customerEmail: user.email,
        items: cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            productImage: item.image,
        })),
        total: finalTotal,
        shippingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            zip: '12345',
        },
    };

    const newOrder = await createOrder(orderData);

    if (!newOrder) {
        toast({ title: 'Order Failed', description: 'There was an error placing your order. Please try again.', variant: 'destructive' });
        setLoading(false);
        return;
    }

    // Update coupon usage count
    if (appliedCoupon) {
      updateCouponUsage(appliedCoupon.code);
    }

    toast({
        title: 'Order Placed!',
        description: 'Thank you for your purchase. We are sending a confirmation email.',
    });

    // Generate and send email
    const emailResult = await generateOrderConfirmationEmailAction({
        customerName: newOrder.customerName,
        order: newOrder
    });

    if (emailResult.success) {
        toast({
            title: 'Confirmation Email Sent',
            description: 'A confirmation has been sent to your email address.',
        });
    } else {
         toast({
            title: 'Email Failed to Send',
            description: `Your order was placed, but we couldn't send the email. Error: ${emailResult.error} You can view your order details in your account.`,
            variant: 'destructive',
            duration: 9000,
        });
    }

    clearCart();
    setLoading(false);
    router.push(`/order-confirmation?orderId=${newOrder.id}`);
  };


  if (cartCount === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
         <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground/30" />
         <h1 className="font-headline text-3xl font-bold mt-4">{t('account.noOrders')}</h1>
         <p className="text-muted-foreground mt-2">{t('account.noOrdersDescription')}</p>
         <Button asChild className="mt-6">
            <Link href="/">{t('account.continueShopping')}</Link>
         </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-headline text-4xl font-bold text-center mb-8">{t('checkout.title')}</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.shippingInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('checkout.firstName')}</Label>
                <Input id="firstName" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('checkout.lastName')}</Label>
                <Input id="lastName" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">{t('checkout.address')}</Label>
                <Input id="address" placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('checkout.city')}</Label>
                <Input id="city" placeholder="Anytown" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">{t('checkout.zip')}</Label>
                <Input id="zip" placeholder="12345" />
              </div>
            </CardContent>
          </Card>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('checkout.paymentMethod')}</CardTitle>
              <CardDescription>{t('checkout.secureTransactions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="card">
                    <CreditCard className="mr-2" /> {t('checkout.card')}
                  </TabsTrigger>
                  <TabsTrigger value="upi">
                    <Wallet className="mr-2" /> {t('checkout.upi')}
                  </TabsTrigger>
                  <TabsTrigger value="cod">
                    <Truck className="mr-2" /> {t('checkout.cod')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="pt-4">
                   <div className="space-y-4">
                      <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input id="cardNumber" placeholder={t('checkout.cardNumber')} className="pl-10"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <Input id="expiryDate" placeholder={t('checkout.expiryDate')} />
                          <Input id="cvc" placeholder={t('checkout.cvc')} />
                      </div>
                  </div>
                </TabsContent>
                <TabsContent value="upi" className="pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">{t('checkout.upiId')}</Label>
                      <Input id="upiId" placeholder="yourname@bank" />
                    </div>
                    <Button className="w-full">{t('checkout.verifyAndPay')}</Button>
                  </div>
                </TabsContent>
                <TabsContent value="cod" className="pt-4">
                    <div className="text-center text-muted-foreground p-4 border rounded-md bg-secondary/30">
                        <Truck className="mx-auto h-10 w-10 mb-2"/>
                        <p>{t('checkout.codMessage')}</p>
                        <p className="text-xs mt-2">{t('checkout.codFee')}</p>
                    </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                        <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" className="rounded-md"/>
                    </div>
                    <div>
                        <p className="font-medium truncate max-w-[120px]">{item.name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
               <div className="space-y-2">
                    <Label htmlFor="coupon">{t('checkout.couponCode')}</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                          id="coupon" 
                          placeholder={t('checkout.enterCode')} 
                          value={couponCode} 
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={!!appliedCoupon}
                        />
                        <Button 
                          type="button" 
                          onClick={handleApplyCoupon} 
                          variant="secondary"
                          disabled={!couponCode || !!appliedCoupon}
                        >
                          {t('checkout.apply')}
                        </Button>
                    </div>
                     {appliedCoupon && (
                        <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded-md border border-green-200">
                           <div className='flex items-center gap-2'>
                             <CheckCircle className="h-4 w-4 text-green-600"/>
                             <p className="text-green-700 font-medium">
                                Coupon <span className="font-mono">{appliedCoupon.code}</span> applied!
                             </p>
                           </div>
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveCoupon}>
                                <XCircle className="h-4 w-4 text-green-600 hover:text-red-500" />
                           </Button>
                        </div>
                    )}
                </div>

              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t('checkout.subtotal')}</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className={cn("flex justify-between text-sm", appliedCoupon ? "text-green-600" : "text-muted-foreground")}>
                <span>{t('checkout.discount')}</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('checkout.shipping')}</span>
                <span>{t('checkout.free')}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('checkout.taxes')}</span>
                <span>{t('checkout.calculatedAtNextStep')}</span>
              </div>
               <Separator />
               <div className="flex justify-between font-bold text-lg">
                <span>{t('checkout.total')}</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={handlePlaceOrder} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('checkout.placingOrder') : t('checkout.placeOrder')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CheckoutPage);
