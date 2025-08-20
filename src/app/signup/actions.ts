
'use server';

import {
  generateWelcomeEmail,
} from '@/ai/flows/welcome-email';
import { sendEmailWithResend } from '@/app/admin/actions';

interface SendWelcomeEmailInput {
    name: string;
    email: string;
}

export async function sendWelcomeEmailAction(
  input: SendWelcomeEmailInput
) {
  try {
    console.log('Generating welcome email content...');
    const emailContent = await generateWelcomeEmail({ name: input.name });
    console.log('Welcome email content generated successfully.');

    await sendEmailWithResend(emailContent.subject, emailContent.body, input.email);
    
    return { success: true };
  } catch (error: any) {
    console.error('Detailed error in sendWelcomeEmailAction:', error); 
    return { success: false, error: error.message || 'Failed to generate or send welcome email.' };
  }
}
