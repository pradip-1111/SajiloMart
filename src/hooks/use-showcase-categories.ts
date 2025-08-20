
'use client';

import { useToast } from './use-toast';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, writeBatch, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ShowcaseItem = {
  title: string;
  image: string;
  productId?: string; // Changed from href
  href: string; // Keep href for fallback/links
  aiHint: string;
};

export type ShowcaseCategory = {
  id: string;
  mainTitle: string;
  mainHref: string;
  order: number;
  items: ShowcaseItem[];
};

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

const showcaseCollectionRef = collection(db, 'showcase_categories');

export function useShowcaseCategories() {
  const [showcaseCategories, setShowcaseCategories] = useState<ShowcaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(showcaseCollectionRef, (snapshot) => {
        setLoading(true);
        if (snapshot.empty) {
            console.log("Showcase categories collection is empty! Seeding with initial data.");
            const batch = writeBatch(db);
            initialShowcaseData.forEach((category) => {
                const docRef = doc(showcaseCollectionRef);
                batch.set(docRef, { ...category, id: docRef.id });
            });
            batch.commit().then(() => setLoading(false));
        } else {
            const categoriesData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseCategory))
                .sort((a, b) => a.order - b.order); // Sort by order
            setShowcaseCategories(categoriesData);
            setLoading(false);
        }
    }, (error) => {
        console.error("Error fetching showcase categories:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateShowcaseCategory = async (id: string, data: ShowcaseCategory) => {
    try {
        const docRef = doc(db, 'showcase_categories', id);
        await updateDoc(docRef, { ...data });
        toast({ title: 'Showcase Updated!', description: `"${data.mainTitle}" has been saved.` });
    } catch(error) {
        toast({ title: "Error", description: "Could not update showcase category.", variant: "destructive" });
        console.error("Error updating showcase category: ", error);
    }
  };
  
  const addShowcaseCategory = async (data: Omit<ShowcaseCategory, 'id'>) => {
    try {
        const docRef = await addDoc(showcaseCollectionRef, data);
        await updateDoc(docRef, { id: docRef.id });
        toast({ title: 'Showcase Added!', description: `"${data.mainTitle}" has been created.` });
    } catch(error) {
        toast({ title: "Error", description: "Could not add new showcase category.", variant: "destructive" });
        console.error("Error adding showcase category: ", error);
    }
  };

  const deleteShowcaseCategory = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'showcase_categories', id));
        toast({ title: 'Showcase Deleted', description: 'The showcase has been removed successfully.' });
    } catch (error) {
        toast({ title: "Error", description: "Could not delete showcase category.", variant: "destructive" });
        console.error("Error deleting showcase category: ", error);
    }
  };


  return { showcaseCategories, loading, updateShowcaseCategory, addShowcaseCategory, deleteShowcaseCategory };
}
