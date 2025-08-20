
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Order, OrderStatus } from '@/lib/orders';
import { type OrderTrackingEvent } from '@/lib/tracking';
import { getOrderTrackingInfo } from './actions';
import { Loader2, PackageSearch, PackageX, Truck, PackageCheck, ClipboardList, Bike } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import React from 'react';

type TrackingInfo = {
    order: Order;
    trackingEvents: OrderTrackingEvent[];
} | null;

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

const timelineSteps: { status: OrderStatus, icon: React.ElementType, text: string }[] = [
    { status: 'Order Placed', icon: PackageSearch, text: 'Order Placed' },
    { status: 'Packed', icon: ClipboardList, text: 'Packed' },
    { status: 'Rider Assigned', icon: Bike, text: 'Rider Assigned' },
    { status: 'Picked Up', icon: Truck, text: 'Picked Up' },
    { status: 'Out for Delivery', icon: Truck, text: 'Out for Delivery' },
    { status: 'Delivered', icon: PackageCheck, text: 'Delivered' },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setTrackingInfo(null);

    const result = await getOrderTrackingInfo(orderId.trim());

    if (result.success) {
      setTrackingInfo(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };
  
  const currentStatusIndex = trackingInfo ? timelineSteps.findIndex(step => step.status === trackingInfo.order.status) : -1;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <PackageSearch className="mx-auto h-16 w-16 text-primary" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-4">Track Your Order</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enter your order ID below to see its current status and location.
        </p>
      </div>

      <Card className="max-w-xl mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow space-y-2">
              <Label htmlFor="orderId" className="sr-only">Order ID</Label>
              <Input
                id="orderId"
                placeholder="Enter your order ID (e.g., ORD001)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PackageSearch className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Searching...' : 'Track Order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="max-w-4xl mx-auto mt-8 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>{error}</CardDescription>
            </CardHeader>
        </Card>
      )}

      {trackingInfo && (
        <div className="max-w-4xl mx-auto mt-8 space-y-8">
           <Card>
                <CardHeader>
                    <CardTitle>Order Status: #{trackingInfo.order.id}</CardTitle>
                    <CardDescription>
                        Current Status: <Badge className={cn('text-white', statusColors[trackingInfo.order.status])}>{trackingInfo.order.status}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {trackingInfo.order.status === 'Cancelled' ? (
                        <div className="flex items-center gap-4 p-4 bg-red-50 text-red-700 rounded-md">
                            <PackageX className="h-10 w-10"/>
                            <div>
                                <h3 className="font-semibold">Order Cancelled</h3>
                                <p className="text-sm">This order was cancelled and will not be processed.</p>
                            </div>
                        </div>
                    ) : (
                         <div className="flex justify-between items-center overflow-x-auto pb-4">
                            {timelineSteps.map((step, index) => {
                                const isActive = index <= currentStatusIndex;
                                return (
                                    <React.Fragment key={step.status}>
                                        <div className="flex flex-col items-center gap-2 text-center flex-shrink-0">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                                isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground/20"
                                            )}>
                                                <step.icon className="w-6 h-6"/>
                                            </div>
                                            <p className={cn("text-xs md:text-sm font-medium transition-colors duration-300", isActive ? "text-foreground" : "text-muted-foreground")}>{step.text}</p>
                                        </div>
                                        {index < timelineSteps.length - 1 && (
                                            <Separator className={cn(
                                                "flex-1 h-1 transition-all duration-300 mx-1",
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
                            {trackingInfo.trackingEvents.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell><Badge className={cn('text-white', statusColors[event.status])}>{event.status}</Badge></TableCell>
                                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>{event.location}</TableCell>
                                </TableRow>
                            ))}
                            {trackingInfo.trackingEvents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No tracking updates yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
