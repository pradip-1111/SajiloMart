
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { type Order } from '@/lib/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, onSnapshot, getDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/users';
import { useTranslation } from '@/hooks/use-translation';

const statusColors: Record<Order['status'], string> = {
    'Pending': 'bg-yellow-500',
    'Shipped': 'bg-blue-500',
    'Delivered': 'bg-green-500',
    'Cancelled': 'bg-red-500',
    'Order Placed': 'bg-gray-500',
    'Packed': 'bg-indigo-500',
    'Rider Assigned': 'bg-purple-500',
    'Picked Up': 'bg-pink-500',
    'Out for Delivery': 'bg-cyan-500',
};

export default function MyOrdersPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            const userDocRef = doc(db, 'users', user.uid);

            const unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as DocumentData;
                    const orderIds = userData.orderIds || [];
                    
                    if (orderIds.length > 0) {
                        const orderPromises = orderIds.map((id: string) => getDoc(doc(db, 'orders', id)));
                        const orderDocs = await Promise.all(orderPromises);
                        
                        const validOrders = orderDocs
                            .filter(docSnap => docSnap.exists())
                            .map(docSnap => {
                                const data = docSnap.data() as DocumentData;
                                // Crucial fix: Convert Firestore Timestamp to ISO string
                                const date = data.date instanceof Timestamp 
                                    ? data.date.toDate().toISOString() 
                                    : data.date;
                                
                                return {
                                    id: docSnap.id,
                                    ...data,
                                    date,
                                } as Order;
                            });
                        
                        validOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        
                        setOrders(validOrders);
                    } else {
                        setOrders([]);
                    }
                } else {
                    console.log("User document not found!");
                    setOrders([]);
                }
                setLoading(false);
            }, (error) => {
                console.error("Error listening to user document:", error);
                setLoading(false);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [user]);


    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (orders.length === 0) {
        return (
            <Card className="text-center p-12">
                <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground/30" />
                <CardHeader>
                    <CardTitle>{t('account.noOrders')}</CardTitle>
                    <CardDescription>{t('account.noOrdersDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/">{t('account.continueShopping')}</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('account.ordersTitle')}</CardTitle>
          <CardDescription>{t('account.ordersDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('account.orderId')}</TableHead>
                        <TableHead>{t('account.date')}</TableHead>
                        <TableHead>{t('account.status')}</TableHead>
                        <TableHead className="text-right">{t('account.total')}</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge className={cn('text-white', statusColors[order.status as OrderStatus])}>{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/account/orders/${order.id}`}>{t('account.viewDetails')}</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
