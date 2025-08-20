
'use client';

import { useToast } from './use-toast';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


type SaleConfig = {
  isActive: boolean;
  endDate: string; // ISO 8601 format
  backgroundImage: string;
};

const initialSaleConfig: SaleConfig = {
  isActive: false,
  endDate: new Date().toISOString(),
  backgroundImage: '',
};

const saleDocRef = doc(db, 'site_config', 'sale');

export function useSale() {
  const [saleConfig, setSaleConfig] = useState<SaleConfig>(initialSaleConfig);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(saleDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as SaleConfig;
        // Check if the sale has expired on load or on update
        if (data.isActive && new Date(data.endDate) < new Date()) {
          // Sale has expired, update Firestore if it's currently active
          setDoc(saleDocRef, { isActive: false, backgroundImage: '' }, { merge: true });
        } else {
          setSaleConfig(data);
        }
      } else {
        console.log("Sale config document not found! Seeding with initial data.");
        // If the document doesn't exist, create it with the initial/default data.
        setDoc(saleDocRef, initialSaleConfig);
      }
    });

    return () => unsubscribe();
  }, []);

  const startSale = async (durationInHours: number, backgroundImage: string) => {
    if (durationInHours <= 0) {
      toast({ title: 'Invalid duration', description: 'Sale duration must be positive.', variant: 'destructive' });
      return;
    }
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + durationInHours);

    const newSaleConfig: SaleConfig = {
      isActive: true,
      endDate: endDate.toISOString(),
      backgroundImage: backgroundImage
    };

    try {
        await setDoc(saleDocRef, newSaleConfig, { merge: true });
        toast({ title: 'Flash Sale Started!', description: `The sale will end in ${durationInHours} hours.` });
    } catch(error) {
        toast({ title: 'Error', description: 'Could not start sale.', variant: 'destructive' });
        console.error("Error starting sale: ", error);
    }
  };

  const endSale = async () => {
     const newSaleConfig: Partial<SaleConfig> = {
      isActive: false,
      endDate: new Date().toISOString(),
      backgroundImage: '',
    };
     try {
        await setDoc(saleDocRef, newSaleConfig, { merge: true });
        toast({ title: 'Sale Ended', description: 'The flash sale has been manually ended.' });
    } catch(error) {
        toast({ title: 'Error', description: 'Could not end sale.', variant: 'destructive' });
        console.error("Error ending sale: ", error);
    }
  };

  return { saleConfig, startSale, endSale };
}
