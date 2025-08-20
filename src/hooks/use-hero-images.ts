
'use client';

import { useToast } from './use-toast';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const initialHeroImages: string[] = [
    'https://placehold.co/1920x1080/60a5fa/ffffff.png',
    'https://placehold.co/1920x1080/f87171/ffffff.png',
    'https://placehold.co/1920x1080/4ade80/ffffff.png',
];

const heroDocRef = doc(db, 'site_config', 'hero');

export function useHeroImages() {
  const [heroImages, setHeroImages] = useState<string[]>(initialHeroImages);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(heroDocRef, (doc) => {
      if (doc.exists()) {
        setHeroImages(doc.data().images || []);
      } else {
        console.log("Hero images document not found! Seeding with initial data.");
        setDoc(heroDocRef, { images: initialHeroImages });
      }
    }, (error) => {
        console.error("Error fetching hero images:", error);
    });
    return () => unsubscribe();
  }, []);

  const addHeroImage = async (imageUrl: string) => {
    if (heroImages.includes(imageUrl)) {
        toast({ title: "Image already exists.", variant: 'destructive'});
        return;
    }
    
    try {
        await updateDoc(heroDocRef, {
            images: arrayUnion(imageUrl)
        });
        toast({ title: 'Hero image added!'});
    } catch(error) {
        toast({ title: "Error", description: "Could not add hero image.", variant: "destructive" });
        console.error("Error adding hero image: ", error);
    }
  };

  const removeHeroImage = async (imageUrl: string) => {
    if (heroImages.length <= 1) {
        toast({ title: 'Cannot remove last image.', description: 'The hero section must have at least one image.', variant: 'destructive' });
        return;
    }
    
    try {
        await updateDoc(heroDocRef, {
            images: arrayRemove(imageUrl)
        });
        toast({ title: 'Hero image removed.' });
    } catch(error) {
        toast({ title: "Error", description: "Could not remove hero image.", variant: "destructive" });
        console.error("Error removing hero image: ", error);
    }
  };

  return { heroImages, addHeroImage, removeHeroImage };
}
