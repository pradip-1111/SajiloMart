
import type { OrderStatus } from "./orders";

export type OrderTrackingEvent = {
    id: string;
    orderId: string;
    userId: string;
    status: OrderStatus;
    timestamp: string; // ISO 8601 string
    location: string;
    notes?: string;
}
