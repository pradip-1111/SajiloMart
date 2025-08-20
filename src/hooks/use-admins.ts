
'use client';

import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const initialAdminEmails: string[] = [
    'sarrafpradeep857@gmail.com',
];

const adminDocRef = doc(db, 'site_config', 'admins');

export function useAdmins() {
  const [admins, setAdmins] = useState<string[]>(initialAdminEmails);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(adminDocRef, (doc) => {
      if (doc.exists()) {
        setAdmins(doc.data().emails || []);
      } else {
        console.log("Admin config document not found! Seeding with initial data.");
        // If the document doesn't exist, create it with the initial data.
        // This makes the app more resilient if the seed script hasn't run.
        setDoc(adminDocRef, { emails: initialAdminEmails });
      }
    }, (error) => {
        console.error("Error fetching admin config:", error);
    });
    return () => unsubscribe();
  }, []);


  const addAdmin = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        toast({ title: "Invalid email format.", variant: 'destructive'});
        return;
    }
    if (admins.includes(trimmedEmail)) {
        toast({ title: "User is already an admin.", variant: 'destructive'});
        return;
    }

    try {
        await updateDoc(adminDocRef, {
            emails: arrayUnion(trimmedEmail)
        });
        toast({ title: 'Admin Added!', description: `${trimmedEmail} now has admin privileges.`});
    } catch(error) {
        toast({ title: 'Error adding admin', description: 'Could not update admin list.', variant: 'destructive' });
        console.error("Error adding admin: ", error);
    }
  };

  const removeAdmin = async (email: string) => {
    if (admins.length <= 1) {
        toast({ title: 'Cannot remove last admin.', description: 'The application must have at least one administrator.', variant: 'destructive' });
        return;
    }
    
    try {
        await updateDoc(adminDocRef, {
            emails: arrayRemove(email)
        });
        toast({ title: 'Admin Removed.', description: `${email} no longer has admin privileges.` });
    } catch(error) {
         toast({ title: 'Error removing admin', description: 'Could not update admin list.', variant: 'destructive' });
         console.error("Error removing admin: ", error);
    }
  };

  return { admins, addAdmin, removeAdmin };
}
