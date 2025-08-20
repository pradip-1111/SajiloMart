
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { type Order, type OrderStatus } from '@/lib/orders';
import { sendCustomEmailAction } from '@/app/admin/actions';

interface OrderStatusUpdaterProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
  children: React.ReactNode;
}

const ALL_STATUSES: OrderStatus[] = ['Order Placed', 'Packed', 'Rider Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrderStatusUpdater({ order, onStatusUpdate, children }: OrderStatusUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const { toast } = useToast();

  const handleUpdate = async () => {
    onStatusUpdate(order.id, selectedStatus);
    
    // The toast and email logic is now handled in the server action `updateOrderStatus`
    // to ensure it runs even if the client disconnects.
    // However, we can show a local toast for immediate feedback.
    toast({
      title: 'Status Update Queued',
      description: `Order #${order.id} will be updated to "${selectedStatus}".`,
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the status for order #{order.id}. The customer will be notified of major changes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedStatus} onValueChange={(value: OrderStatus) => setSelectedStatus(value)}>
            <div className="space-y-2">
              {ALL_STATUSES.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <RadioGroupItem value={status} id={`status-${status}`} />
                  <Label htmlFor={`status-${status}`}>{status}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
