
'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Home } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslation } from '@/hooks/use-translation';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const { t } = useTranslation();

    if (!orderId) {
        // Redirect to home if orderId is missing
        if (typeof window !== 'undefined') {
            router.replace('/');
        }
        return null;
    }

    return (
        <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle className="text-3xl font-bold mt-4">{t('orderConfirmation.title')}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        {t('orderConfirmation.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        {t('orderConfirmation.orderNumber')} <span className="font-semibold text-primary">{orderId}</span>. 
                        {t('orderConfirmation.emailMessage')}
                    </p>
                    <div className="flex justify-center gap-4">
                         <Button asChild>
                            <Link href="/">
                                <Home className="mr-2" /> {t('orderConfirmation.continueShopping')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/account/orders/${orderId}`}>
                                {t('orderConfirmation.viewOrderDetails')}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    )
}

