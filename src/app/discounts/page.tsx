
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateDiscountSpinnerAction } from './actions';
import { Sparkles, Gift, Loader2, CheckCircle, Tag } from 'lucide-react';
import { DiscountSpinner } from '@/components/discount-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { DiscountSpinnerOutput } from '@/ai/flows/interactive-discount-spinner';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCoupons } from '@/lib/coupons';

export default function DiscountSpinnerPage() {
  const [interests, setInterests] = useState('');
  const [spinnerData, setSpinnerData] = useState<DiscountSpinnerOutput | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addCoupon } = useCoupons();


  const handleGenerateSpinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interests) return;

    setSpinnerData(null);
    setHasSpun(false);
    setIsClaimed(false);

    startTransition(async () => {
      try {
        const { spinnerData: result, newCoupon } = await generateDiscountSpinnerAction({
          userInterests: interests,
        });
        if (result && result.discounts) {
          addCoupon(newCoupon);
          setSpinnerData(result);
        } else {
          toast({
            title: 'Error',
            description:
              'Could not generate discounts. Please try a different query.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'An error occurred',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleSpinClick = () => {
    if (isSpinning || hasSpun || !spinnerData) return;
    setIsSpinning(true);
    // Let the spin animation run for a few seconds before showing the result
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
    }, 4000); // This duration should match the CSS animation
  };

  const handleClaimCoupon = () => {
    if (!spinnerData) return;
    localStorage.setItem('claimedCouponCode', spinnerData.result.code);
    setIsClaimed(true);
    toast({
      title: 'Coupon Claimed!',
      description: 'Your coupon will be automatically applied at checkout.',
    });
    // Optional: redirect to cart/checkout after a short delay
    setTimeout(() => {
        router.push('/checkout');
    }, 1500);
  };

  const winningIndex = spinnerData
    ? spinnerData.discounts.findIndex(
        (d) => d.name === spinnerData.result.name
      )
    : -1;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <Gift className="mx-auto h-16 w-16 text-primary" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-4">
          Interactive Discount Spinner
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell us what you like and spin the wheel for a personalized discount,
          just for you!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mt-10 items-center">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <DiscountSpinner
            discounts={spinnerData?.discounts}
            winningIndex={hasSpun ? winningIndex : null}
            isSpinning={isSpinning}
          />
          <Button
            size="lg"
            onClick={handleSpinClick}
            disabled={isSpinning || hasSpun || !spinnerData}
            className="mt-4"
          >
            {isSpinning ? 'Spinning...' : hasSpun ? 'Thanks for playing!' : 'Spin the Wheel!'}
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>1. Generate Your Spinner</CardTitle>
            <CardDescription>
              Enter some interests (e.g., "sci-fi books, coffee, hiking") to
              generate your personalized spinner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateSpinner} className="space-y-4">
              <Input
                placeholder="e.g., sci-fi books, coffee, hiking"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                disabled={isPending}
              />
              <Button
                type="submit"
                disabled={!interests || isPending}
                className="w-full"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isPending ? 'Generating...' : 'Generate My Prizes'}
              </Button>
            </form>

            {hasSpun && spinnerData && (
              <Alert className="mt-6 bg-accent/20 border-accent text-accent-foreground">
                <Sparkles className="h-4 w-4 !text-accent" />
                <AlertTitle className="font-bold text-accent">
                  Congratulations!
                </AlertTitle>
                <AlertDescription className="space-y-4">
                   <p>
                     {spinnerData.result.message} Your code is{' '}
                     <span className="font-bold font-mono">{spinnerData.result.code}</span>.
                   </p>
                   <Button 
                    className="w-full"
                    onClick={handleClaimCoupon}
                    disabled={isClaimed}
                   >
                    {isClaimed ? <CheckCircle /> : <Tag />}
                    {isClaimed ? 'Claimed! Redirecting...' : 'Claim Coupon & Checkout'}
                   </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
