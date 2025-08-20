
'use client';

import { useToast } from './use-toast';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export type PromoBanner = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string; // URL
  background: string; // URL
  link: string;
};

// Hardcoded initial data for seeding
const initialBanners: Omit<PromoBanner, 'id'>[] = [
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

const promoBannersCollectionRef = collection(db, 'promo_banners');

export function usePromoBanners() {
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(promoBannersCollectionRef, (snapshot) => {
        if (snapshot.empty) {
            console.log("Promo banners collection is empty! Seeding with initial data.");
            // If the collection is empty, seed it with initial data.
            const batch = writeBatch(db);
            initialBanners.forEach((banner) => {
                const docRef = doc(promoBannersCollectionRef); // Auto-generate ID
                batch.set(docRef, { ...banner, id: docRef.id });
            });
            batch.commit();
        } else {
            const bannersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PromoBanner[];
            setPromoBanners(bannersData);
        }
    }, (error) => {
        console.error("Error fetching promo banners:", error);
    });
    return () => unsubscribe();
  }, []);


  const addPromoBanner = async (bannerData: Omit<PromoBanner, 'id'>) => {
    try {
        const docRef = await addDoc(promoBannersCollectionRef, bannerData);
        // The onSnapshot listener will update the local state automatically.
        await updateDoc(docRef, { id: docRef.id });
        toast({ title: 'Promotional banner added!' });
    } catch (error) {
        toast({ title: 'Error', description: 'Could not add banner.', variant: 'destructive' });
        console.error("Error adding promo banner: ", error);
    }
  };

  const removePromoBanner = async (bannerId: string) => {
    try {
        await deleteDoc(doc(db, 'promo_banners', bannerId));
        // The onSnapshot listener will update the local state automatically.
        toast({ title: 'Promotional banner removed.' });
    } catch(error) {
         toast({ title: 'Error', description: 'Could not remove banner.', variant: 'destructive' });
         console.error("Error removing promo banner: ", error);
    }
  };

  return { promoBanners, addPromoBanner, removePromoBanner };
}
