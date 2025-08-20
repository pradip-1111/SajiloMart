
export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Order Placed' | 'Packed' | 'Rider Assigned' | 'Picked Up' | 'Out for Delivery';

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  productImage: string;
};

export type Address = {
    street: string;
    city: string;
    zip: string;
};

export type Order = {
  id: string;
  userId: string; // Add userId to link to the user
  customerName: string;
  customerEmail: string;
  date: string; // Will be ISO string from Firestore
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  shippingAddress: Address;
};

// Mock data is no longer needed as we will fetch from Firestore.
export const orders: Order[] = [];
