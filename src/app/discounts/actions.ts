
'use server';

import {
  generateDiscountSpinner,
  type DiscountSpinnerInput,
  type DiscountSpinnerOutput,
} from '@/ai/flows/interactive-discount-spinner';
import type { Coupon } from '@/lib/coupons';

function parseDiscountValue(value: string): Pick<Coupon, 'type' | 'value'> {
  if (value.includes('%')) {
    return { type: 'percentage', value: parseFloat(value.replace('%', '')) };
  }
  if (value.startsWith('$')) {
    return { type: 'fixed', value: parseFloat(value.replace('$', '')) };
  }
  // Default fallback
  return { type: 'fixed', value: 5 };
}

type GenerateDiscountSpinnerActionOutput = {
  spinnerData: DiscountSpinnerOutput;
  newCoupon: Coupon;
};

export async function generateDiscountSpinnerAction(
  input: DiscountSpinnerInput
): Promise<GenerateDiscountSpinnerActionOutput> {
  try {
    const result = await generateDiscountSpinner(input);
    
    const { type, value } = parseDiscountValue(result.result.value);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Coupon expires in 7 days

    const newCoupon: Coupon = {
      code: result.result.code,
      type,
      value,
      usageLimit: 1,
      timesUsed: 0,
      expiryDate: expiryDate.toISOString(),
      applicableScope: 'all',
      applicableIds: [],
      isActive: true,
    };

    return { spinnerData: result, newCoupon: newCoupon };
  } catch (error) {
    console.error('Error generating discount spinner:', error);
    throw new Error(
      'Sorry, we were unable to generate discounts at this time. Please try again later.'
    );
  }
}
