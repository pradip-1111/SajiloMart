
'use client'

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Coupon } from "@/lib/coupons";


const couponsCollectionRef = collection(db, 'coupons');

export function useCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(couponsCollectionRef, (snapshot) => {
            const couponsData = snapshot.docs.map(doc => ({ ...doc.data() })) as Coupon[];
            setCoupons(couponsData);
        });
        return () => unsubscribe();
    }, []);

    const addCoupon = async (coupon: Coupon) => {
       const couponRef = doc(db, 'coupons', coupon.code);
       await setDoc(couponRef, coupon, { merge: true });
    };
    
    const updateCouponUsage = async (code: string) => {
        const coupon = coupons.find(c => c.code === code);
        if (coupon) {
             const couponRef = doc(db, 'coupons', code);
             await updateDoc(couponRef, {
                 timesUsed: coupon.timesUsed + 1
             });
        }
    };

    const toggleCouponStatus = async (code: string) => {
        const coupon = coupons.find(c => c.code === code);
        if (coupon) {
             const couponRef = doc(db, 'coupons', code);
             await updateDoc(couponRef, {
                 isActive: !coupon.isActive
             });
        }
    };

    return { coupons, addCoupon, updateCouponUsage, toggleCouponStatus };
}

    