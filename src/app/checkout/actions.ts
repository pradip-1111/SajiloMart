
'use server';

import {
  generateOrderConfirmationEmail,
  type OrderConfirmationEmailInput,
} from '@/ai/flows/order-confirmation-email';
import { sendEmailWithResend } from '@/app/admin/actions';


export async function generateOrderConfirmationEmailAction(
  input: OrderConfirmationEmailInput
) {
  try {
    console.log('Generating order confirmation email content for:', input.order.customerEmail);
    const emailContent = await generateOrderConfirmationEmail(input);
    console.log('Email content generated successfully.');

    await sendEmailWithResend(emailContent.subject, emailContent.body, input.order.customerEmail);
    
    return { success: true, ...emailContent };
  } catch (error: any) {
    console.error('Detailed error in generateOrderConfirmationEmailAction:', error);

    // Check for specific Resend authentication error
    if (error.message && error.message.includes('missing_required_api_key')) {
       return { success: false, error: 'Email sending failed. The RESEND_API_KEY is missing from your .env file.' };
    }

    // Return a structured error to the client
    return { success: false, error: error.message || 'Failed to generate or send confirmation email.' };
  }
}
