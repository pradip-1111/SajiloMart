
'use server';

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  DocumentData,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/lib/orders';
import { sendCustomEmailAction } from '@/app/admin/actions';
import type { OrderTrackingEvent } from '@/lib/tracking';

const ordersCollection = collection(db, 'orders');
const trackingLogCollection = collection(db, 'order_tracking_log');

const fromFirestore = (doc: DocumentData): Order => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings
        date: (data.date instanceof Timestamp) ? data.date.toDate().toISOString() : data.date,
    } as Order;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order | null> {
    try {
        const orderDate = new Date();
        
        // 1. Create the complete, final data object for the order first.
        // This ensures data consistency throughout the function.
        const newOrderData = {
            ...orderData,
            status: 'Order Placed' as const,
            date: orderDate, // Use the Date object for now
        };

        // 2. Add the new order to the 'orders' collection.
        // Use a Firestore Timestamp for the date field here.
        const docRef = await addDoc(ordersCollection, {
            ...newOrderData,
            date: Timestamp.fromDate(orderDate),
        });
        
        // 3. Add the new order's ID to the corresponding user's document.
        const userDocRef = doc(db, 'users', orderData.userId);
        await updateDoc(userDocRef, {
            orderIds: arrayUnion(docRef.id)
        });

        // 4. Create the initial tracking event for the order.
        await addDoc(trackingLogCollection, {
            orderId: docRef.id,
            status: 'Order Placed',
            timestamp: Timestamp.fromDate(orderDate),
            location: 'Warehouse', 
            notes: 'Order successfully created by customer.',
        });

        // 5. Return the final, serializable Order object to the client.
        // The id is from the docRef, and the date is converted to an ISO string.
        return {
            ...newOrderData,
            id: docRef.id,
            date: orderDate.toISOString(),
        };
    } catch (error) {
        console.error("Error creating order: ", error);
        return null;
    }
}

export async function getAllOrders(): Promise<Order[]> {
    try {
        const q = query(ordersCollection, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        return [];
    }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching order by ID: ", error);
        return null;
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, updatedBy: string = 'admin'): Promise<boolean> {
    try {
        const orderDocRef = doc(db, 'orders', orderId);
        await updateDoc(orderDocRef, { status });

        // Create a new tracking log entry
         await addDoc(trackingLogCollection, {
            orderId: orderId,
            status: status,
            timestamp: Timestamp.now(),
            location: 'Warehouse', // This could be dynamic in a real app
            notes: `Status updated to ${status} by ${updatedBy}.`,
        });


        // Get updated order to send email
        const order = await getOrderById(orderId);
        if (order && (status === 'Cancelled' || status === 'Delivered')) {
             let subject = '';
            let body = '';
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

            switch (status) {
                case 'Cancelled':
                subject = `Your Order #${order.id} Has Been Cancelled`;
                body = `
                    <p>Hi ${order.customerName},</p>
                    <p>Your order #${order.id} has been successfully cancelled.</p>
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                    <p>Thanks,</p>
                    <p>The SajiloMart Team</p>
                `;
                break;
                case 'Delivered':
                    subject = `Your Order #${order.id} Has Been Delivered!`;
                    body = `
                    <p>Hi ${order.customerName},</p>
                    <p>Great news! Your order #${order.id} has been successfully delivered.</p>
                    <p>We hope you enjoy your purchase. Thank you for shopping with SajiloMart!</p>
                    ${baseUrl ? `<p>You can view your order details here: <a href="${baseUrl}/account/orders/${order.id}">View Order</a></p>` : ''}
                    `;
                    break;
            }

            try {
                await sendCustomEmailAction({
                    to: order.customerEmail,
                    name: order.customerName,
                    subject,
                    body
                });
            } catch (error) {
                 console.error(`Failed to send ${order.status} email for order ${order.id}:`, error);
            }
        }

        return true;
    } catch (error) {
        console.error("Error updating order status: ", error);
        return false;
    }
}
