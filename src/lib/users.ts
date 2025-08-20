
export type User = {
    id: string;
    name: string;
    email: string;
    registrationDate: string;
    status: 'active' | 'blocked';
    orderIds: string[];
}

const getDateString = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString();
}

// This is now just a type definition and helper, the data is fetched from Firestore.
// The seed script will populate initial data.
export const users: User[] = [];
