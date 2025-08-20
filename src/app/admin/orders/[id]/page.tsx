
'use client'

import { useParams, notFound } from "next/navigation";
import { type Order } from "@/lib/orders";
import withAuth from "@/components/with-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, MapPin, Package, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getOrderById } from "@/lib/order-actions";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<Order['status'], string> = {
    'Pending': 'bg-yellow-500',
    'Shipped': 'bg-blue-500',
    'Delivered': 'bg-green-500',
    'Cancelled': 'bg-red-500',
};

function OrderDetailsPage() {
    const params = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            getOrderById(params.id).then(orderData => {
                if (orderData) {
                    setOrder(orderData);
                } else {
                    notFound();
                }
                setLoading(false);
            });
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 space-y-8">
                <Skeleton className="h-10 w-64" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <Skeleton className="h-72 w-full" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Button asChild variant="outline" size="icon">
                    <Link href="/admin">
                       <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="font-headline text-3xl font-bold">Order Details</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
                                            <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
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
                </div>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <User /> Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/> {order.customerName}</div>
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> {order.customerEmail}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <MapPin /> Shipping Address
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

export default withAuth(OrderDetailsPage, 'admin');
