
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from "next/navigation";
import { type Order, OrderStatus } from "@/lib/orders";
import withAuth from "@/components/with-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, DollarSign, ArrowLeft, PackageCheck, PackageSearch, Truck, Ban, PackageX, ClipboardList, Bike } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { getOrderById, updateOrderStatus } from '@/lib/order-actions';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { onSnapshot, collection, query, where, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OrderTrackingEvent } from '@/lib/tracking';

const statusColors: Record<OrderStatus, string> = {
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

const timelineSteps: { status: OrderStatus, icon: React.ElementType, text: string }[] = [
    { status: 'Order Placed', icon: PackageSearch, text: 'Order Placed' },
    { status: 'Packed', icon: ClipboardList, text: 'Packed' },
    { status: 'Rider Assigned', icon: Bike, text: 'Rider Assigned' },
    { status: 'Picked Up', icon: Truck, text: 'Picked Up' },
    { status: 'Out for Delivery', icon: Truck, text: 'Out for Delivery' },
    { status: 'Delivered', icon: PackageCheck, text: 'Delivered' },
];

function OrderDetailsPage() {
    const params = useParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [order, setOrder] = useState<Order | null>(null);
    const [trackingEvents, setTrackingEvents] = useState<OrderTrackingEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id || !user) return;

        let orderUnsubscribe: () => void = () => {};
        let trackingUnsubscribe: () => void = () => {};

        const fetchAndListen = async () => {
            setLoading(true);
            try {
                const initialOrder = await getOrderById(params.id);

                if (initialOrder && initialOrder.userId === user?.uid) {
                    setOrder(initialOrder);

                    // Set up a real-time listener for the order itself
                    orderUnsubscribe = onSnapshot(doc(db, 'orders', params.id), (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const updatedOrderData = docSnapshot.data();
                            const date = updatedOrderData.date instanceof Timestamp 
                                    ? updatedOrderData.date.toDate().toISOString() 
                                    : updatedOrderData.date;
                            setOrder(prevOrder => ({
                                ...prevOrder,
                                id: docSnapshot.id,
                                ...updatedOrderData,
                                date,
                            } as Order));
                        }
                    });

                    // Set up a real-time listener for tracking events
                    const q = query(
                        collection(db, 'order_tracking_log'),
                        where('orderId', '==', params.id)
                    );

                    trackingUnsubscribe = onSnapshot(q, (snapshot) => {
                        const events = snapshot.docs.map(doc => {
                           const data = doc.data();
                           const timestamp = data.timestamp instanceof Timestamp
                             ? data.timestamp.toDate().toISOString()
                             : data.timestamp;
                           return {
                            ...data,
                            id: doc.id,
                            timestamp,
                           }
                        }) as OrderTrackingEvent[];
                        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        setTrackingEvents(events);
                    });

                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch order details:", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchAndListen();
        
        // Cleanup function
        return () => {
            orderUnsubscribe();
            trackingUnsubscribe();
        };

    }, [params.id, user]);

    const handleCancelOrder = async () => {
        if (order && order.status === 'Pending') {
            const success = await updateOrderStatus(order.id, 'Cancelled', user?.uid);
            if (success) {
                toast({
                    title: "Order Cancelled",
                    description: `Order #${order.id} has been successfully cancelled.`,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to cancel the order. Please try again.",
                    variant: "destructive"
                });
            }
        }
    }

    if (loading) {
        return (
             <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-9 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
                <Skeleton className="h-40 w-full rounded-lg" />
                 <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-8">
                         <Skeleton className="h-64 w-full rounded-lg" />
                         <Skeleton className="h-48 w-full rounded-lg" />
                    </div>
                     <div className="space-y-8">
                         <Skeleton className="h-32 w-full rounded-lg" />
                         <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }
    
    if (!order) {
        return notFound();
    }
    
    const currentStatusIndex = timelineSteps.findIndex(step => step.status === order.status);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/account/orders">
                           <ArrowLeft />
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl font-bold">Order Details</h1>
                </div>
                 {order.status === 'Pending' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Ban className="mr-2" />
                                Cancel Order
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. You will be refunded if applicable.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90">Confirm Cancellation</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.status === 'Cancelled' ? (
                        <div className="flex items-center gap-4 p-4 bg-red-50 text-red-700 rounded-md">
                            <PackageX className="h-10 w-10"/>
                            <div>
                                <h3 className="font-semibold">Order Cancelled</h3>
                                <p className="text-sm">This order was cancelled and will not be processed.</p>
                            </div>
                        </div>
                    ) : (
                         <div className="flex justify-between items-center">
                            {timelineSteps.map((step, index) => {
                                const isActive = index <= currentStatusIndex;
                                return (
                                    <React.Fragment key={step.status}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                                isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground/20"
                                            )}>
                                                <step.icon className="w-6 h-6"/>
                                            </div>
                                            <p className={cn("text-sm font-medium transition-colors duration-300", isActive ? "text-foreground" : "text-muted-foreground")}>{step.text}</p>
                                        </div>
                                        {index < timelineSteps.length - 1 && (
                                            <Separator className={cn(
                                                "flex-1 h-1 transition-all duration-300",
                                                isActive && index < currentStatusIndex ? "bg-primary" : "bg-muted-foreground/20"
                                            )} />
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package /> Order #{order.id}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map(item => (
                                        <TableRow key={item.productId}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Separator className="my-4" />
                            <div className="flex justify-end">
                                <div className="grid gap-2 text-right">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">₹{order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">Free</span>
                                    </div>
                                     <div className="flex justify-between gap-4 font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking History</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Location</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trackingEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell><Badge className={cn('text-white', statusColors[event.status])}>{event.status}</Badge></TableCell>
                                            <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                                            <TableCell>{event.location}</TableCell>
                                        </TableRow>
                                    ))}
                                    {trackingEvents.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No tracking updates yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <Truck /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground"/> {new Date(order.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground"/> Paid</div>
                            <div className="flex items-center gap-2">
                                <Badge className={cn('text-white', statusColors[order.status])}>{order.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default withAuth(OrderDetailsPage, 'user');
