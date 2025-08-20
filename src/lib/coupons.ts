
export type Coupon = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit: number;
  timesUsed: number;
  expiryDate: string; // ISO 8601 format: "YYYY-MM-DDTHH:mm:ss.sssZ"
  applicableScope: 'all' | 'category' | 'product';
  applicableIds: string[];
  isActive: boolean;
};

// Function to get an ISO date string for a date X days from now
const getExpiryDate = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
}

export const initialCoupons: Coupon[] = [
  {
    code: 'SUMMER20',
    type: 'percentage',
    value: 20,
    usageLimit: 100,
    timesUsed: 25,
    expiryDate: getExpiryDate(30), // Expires in 30 days
    applicableScope: 'all',
    applicableIds: [],
    isActive: true,
  },
  {
    code: 'SAVE10',
    type: 'fixed',
    value: 10,
    usageLimit: 200,
    timesUsed: 150,
    expiryDate: getExpiryDate(60), // Expires in 60 days
    applicableScope: 'all',
    applicableIds: [],
    isActive: true,
  },
  {
    code: 'ELECTRONICS15',
    type: 'percentage',
    value: 15,
    usageLimit: 50,
    timesUsed: 10,
    expiryDate: getExpiryDate(15), // Expires in 15 days
    applicableScope: 'category',
    applicableIds: ['Electronics'],
    isActive: true,
  },
    {
    code: 'FREESHIRT',
    type: 'fixed',
    value: 119.50, // Price of the jacket
    usageLimit: 5,
    timesUsed: 4,
    expiryDate: getExpiryDate(10), // Expires in 10 days
    applicableScope: 'product',
    applicableIds: ['prod-8'], // Classic Denim Jacket
    isActive: true,
  },
  {
    code: 'EXPIRED',
    type: 'percentage',
    value: 50,
    usageLimit: 10,
    timesUsed: 2,
    expiryDate: getExpiryDate(-5), // Expired 5 days ago
    applicableScope: 'all',
    applicableIds: [],
    isActive: true, // Still active but expired
  },
    {
    code: 'MAXEDOUT',
    type: 'fixed',
    value: 5,
    usageLimit: 20,
    timesUsed: 20,
    expiryDate: getExpiryDate(20), // Expires in 20 days
    applicableScope: 'all',
    applicableIds: [],
    isActive: true, // Active but fully used
  },
  {
    code: 'INACTIVE',
    type: 'percentage',
    value: 10,
    usageLimit: 1000,
    timesUsed: 0,
    expiryDate: getExpiryDate(365), // Expires in a year
    applicableScope: 'all',
    applicableIds: [],
    isActive: false, // Manually deactivated
  },
];

    