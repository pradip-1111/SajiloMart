
import { collection, writeBatch, doc, setDoc } from 'firebase/firestore';
import { products } from '../src/lib/products';
import { orders } from '../src/lib/orders';
import { initialCoupons } from '@/lib/coupons';
import { db } from '../src/lib/firebase';
import type { ShowcaseCategory } from '@/hooks/use-showcase-categories';

// Define a static list of users to seed, with predictable UIDs
const usersToSeed = [
    {
        id: 'seed-user-1-admin',
        name: 'Pradip Sarraf',
        email: 'sarrafpradeep857@gmail.com',
        registrationDate: new Date().toISOString(),
        status: 'active' as const,
        orderIds: [], // FIX: Initialize orderIds for admin user
    },
    {
        id: 'seed-user-2-alex',
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
        orderIds: ['ORD001'],
    },
    {
        id: 'seed-user-3-sam',
        name: 'Samantha Lee',
        email: 'sam.lee@example.com',
        registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const,
        orderIds: ['ORD002'],
    },
];

const initialAdminEmails: string[] = [
    'sarrafpradeep857@gmail.com',
];

const initialHeroImages: string[] = [
    'https://placehold.co/1920x1080/60a5fa/ffffff.png',
    'https://placehold.co/1920x1080/f87171/ffffff.png',
    'https://placehold.co/1920x1080/4ade80/ffffff.png',
];

const initialBanners = [
  {
    title: 'Modern Furniture',
    subtitle: 'From $299',
    description: 'Explore the latest trends in home decor.',
    image: 'https://placehold.co/300x300/60a5fa/ffffff.png',
    background: 'https://placehold.co/1200x400/60a5fa/ffffff.png',
    link: '/products',
  },
  {
    title: 'Top Electronics',
    subtitle: 'Up to 40% Off',
    description: 'Get the latest gadgets and accessories.',
    image: 'https://placehold.co/300x300/f87171/ffffff.png',
    background: 'https://placehold.co/1200x400/f87171/ffffff.png',
    link: '/products',
  },
  {
    title: 'New Fashion Arrivals',
    subtitle: 'Starting at $19.99',
    description: 'Update your wardrobe with new styles.',
    image: 'https://placehold.co/300x300/4ade80/ffffff.png',
    background: 'https://placehold.co/1200x400/4ade80/ffffff.png',
    link: '/products',
  },
];

const initialShowcaseData: Omit<ShowcaseCategory, 'id'>[] = [
  {
    mainTitle: 'Revamp your home in style',
    mainHref: '/products?q=home',
    order: 1,
    items: [
      { title: 'Cushion covers, bedsheets & more', image: 'https://placehold.co/200x200.png', productId: 'prod-3', href: '/products?q=cushion', aiHint: 'colorful cushions' },
      { title: 'Figurines, vases & more', image: 'https://placehold.co/200x200.png', productId: 'prod-4', href: '/products?q=figurine', aiHint: 'astronaut figurine' },
      { title: 'Home storage', image: 'https://placehold.co/200x200.png', productId: 'prod-6', href: '/products?q=storage', aiHint: 'fabric storage box' },
      { title: 'Lighting solutions', image: 'https://placehold.co/200x200.png', productId: 'prod-2', href: '/products?q=lighting', aiHint: 'modern wall lamp' },
    ],
  },
  {
    mainTitle: 'Appliances for your home | Up to 55% off',
    mainHref: '/products?category=Home%20&%20Kitchen',
    order: 2,
    items: [
      { title: 'Air conditioners', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=ac', aiHint: 'air conditioner' },
      { title: 'Refrigerators', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=refrigerator', aiHint: 'stainless steel refrigerator' },
      { title: 'Microwaves', image: 'https://placehold.co/200x200.png', productId: 'prod-4', href: '/products?q=microwave', aiHint: 'black microwave' },
      { title: 'Washing machines', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=washing%20machine', aiHint: 'front load washing machine' },
    ],
  },
  {
    mainTitle: 'PlayStation 5 Slim & Accessories',
    mainHref: '/products?q=playstation',
    order: 3,
    items: [
      { title: 'PS5 Slim digital edition', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=ps5%20digital', aiHint: 'gaming console box' },
      { title: 'PS5 Slim disc edition', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=ps5%20disc', aiHint: 'playstation 5 console' },
      { title: 'PS5 Slim Fortnite digital edition', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=ps5%20fortnite', aiHint: 'gaming console bundle' },
      { title: 'PS5 DualSense Wireless Controller', image: 'https://placehold.co/200x200.png', productId: 'prod-2', href: '/products?q=dualsense', aiHint: 'white game controller' },
    ],
  },
  {
    mainTitle: 'Automotive essentials | Up to 60% off',
    mainHref: '/products?q=automotive',
    order: 4,
    items: [
      { title: 'Cleaning accessories', image: 'https://placehold.co/200x200.png', productId: 'prod-3', href: '/products?q=car%20cleaning', aiHint: 'car interior cleaning' },
      { title: 'Tyre & rim care', image: 'https://placehold.co/200x200.png', productId: 'prod-3', href: '/products?q=tyre%20care', aiHint: 'washing car wheel' },
      { title: 'Helmets', image: 'https://placehold.co/200x200.png', productId: 'prod-8', href: '/products?q=helmet', aiHint: 'motorcycle helmet' },
      { title: 'Vacuum cleaner', image: 'https://placehold.co/200x200.png', productId: 'prod-1', href: '/products?q=car%20vacuum', aiHint: 'handheld car vacuum' },
    ],
  },
];


async function seedDatabase() {
    console.log("Starting to seed database...");

    try {
        // Seed Products
        const productBatch = writeBatch(db);
        const productsCollection = collection(db, 'products');
        console.log(`Seeding ${products.length} products...`);
        products.forEach((product) => {
            const docRef = doc(productsCollection, product.id);
            productBatch.set(docRef, product);
        });
        await productBatch.commit();
        console.log("✅ Products seeded successfully.");

        // Seed Users
        const userBatch = writeBatch(db);
        const usersCollection = collection(db, 'users');
        console.log(`Seeding ${usersToSeed.length} users...`);
        usersToSeed.forEach((user) => {
            // Use the explicit ID from our array as the document ID
            const docRef = doc(usersCollection, user.id);
            userBatch.set(docRef, user);
        });
        await userBatch.commit();
        console.log("✅ Users seeded successfully.");

        // Seed Orders
        const orderBatch = writeBatch(db);
        const ordersCollection = collection(db, 'orders');
        console.log(`Seeding ${orders.length} orders...`);
        orders.forEach((order) => {
            const docRef = doc(ordersCollection, order.id);
            orderBatch.set(docRef, order);
        });
        await orderBatch.commit();
        console.log("✅ Orders seeded successfully.");

        // Seed Coupons
        const couponBatch = writeBatch(db);
        const couponsCollection = collection(db, 'coupons');
        console.log(`Seeding ${initialCoupons.length} coupons...`);
        initialCoupons.forEach((coupon) => {
            const docRef = doc(couponsCollection, coupon.code);
            couponBatch.set(docRef, coupon);
        });
        await couponBatch.commit();
        console.log("✅ Coupons seeded successfully.");
        
        // --- Seed Site Configuration ---
        console.log("Seeding site configuration...");
        const siteConfigCollection = collection(db, 'site_config');
        
        // Seed Admins
        await setDoc(doc(siteConfigCollection, 'admins'), { emails: initialAdminEmails });
        console.log("✅ Admins seeded successfully.");
        
        // Seed Hero Images
        await setDoc(doc(siteConfigCollection, 'hero'), { images: initialHeroImages });
        console.log("✅ Hero images seeded successfully.");

        // Seed Sale Config
        await setDoc(doc(siteConfigCollection, 'sale'), { 
            isActive: false, 
            endDate: new Date().toISOString(), 
            backgroundImage: '' 
        }, { merge: true });
        console.log("✅ Sale config seeded successfully.");
        
        // Seed Promo Banners
        const bannerBatch = writeBatch(db);
        const promoBannersCollection = collection(db, 'promo_banners');
        console.log(`Seeding ${initialBanners.length} promo banners...`);
        initialBanners.forEach((banner) => {
            const docRef = doc(promoBannersCollection); // Auto-generate ID
            bannerBatch.set(docRef, { ...banner, id: docRef.id });
        });
        await bannerBatch.commit();
        console.log("✅ Promo banners seeded successfully.");

        // Seed Showcase Categories
        const showcaseBatch = writeBatch(db);
        const showcaseCollection = collection(db, 'showcase_categories');
        console.log(`Seeding ${initialShowcaseData.length} showcase categories...`);
        initialShowcaseData.forEach((category) => {
            const docRef = doc(showcaseCollection);
            showcaseBatch.set(docRef, { ...category, id: docRef.id });
        });
        await showcaseBatch.commit();
        console.log("✅ Showcase categories seeded successfully.");


        console.log("\nDatabase seeding complete! ✨");

    } catch (e) {
        console.error("Error seeding database: ", e);
    } finally {
        // The script hangs otherwise
        process.exit(0);
    }
}

seedDatabase();
