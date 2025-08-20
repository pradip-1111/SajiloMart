
'use server';

import { getOrderById } from '@/lib/order-actions';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OrderTrackingEvent } from '@/lib/tracking';
import type { Order } from '@/lib/orders';

type TrackingInfo = {
    order: Order;
    trackingEvents: OrderTrackingEvent[];
};

export async function getOrderTrackingInfo(orderId: string): Promise<{ success: boolean; data?: TrackingInfo, error?: string; }> {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      return { success: false, error: 'Order not found. Please check the ID and try again.' };
    }

    const q = query(
      collection(db, 'order_tracking_log'),
      where('orderId', '==', orderId)
      // Removed orderBy to prevent index error. Sorting will be done on the client.
    );

    const snapshot = await getDocs(q);
    const trackingEvents = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      timestamp: doc.data().timestamp.toDate().toISOString(),
    })) as OrderTrackingEvent[];

    // Sort events by timestamp here on the server
    trackingEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      success: true,
      data: {
        order,
        trackingEvents,
      },
    };
  } catch (error) {
    console.error('Error fetching tracking info:', error);
    return { success: false, error: 'An unexpected error occurred while fetching tracking information.' };
  }
}
