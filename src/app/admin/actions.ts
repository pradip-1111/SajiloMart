
'use server';

import { apiInstance, fromEmail } from '@/lib/email';
import * as brevo from '@getbrevo/brevo';

export async function sendEmailWithResend(subject: string, htmlContent: string, toEmail: string, toName?: string) {
  // Check for credentials right before sending the email.
  if (!process.env.BREVO_API_KEY) {
    console.error("Brevo API key is not set. Please add it to your .env file.");
    throw new Error('Server configuration error: Missing email API key.');
  }

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.sender = fromEmail;
  sendSmtpEmail.to = [{ email: toEmail, name: toName }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    console.log(`Attempting to send email via Brevo to: ${toEmail}`);
    
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('Email sent successfully via Brevo. Message ID:', data.body.messageId);
    return { success: true };
  } catch (exception) {
    console.error('Exception caught while sending email via Brevo:', exception);
    const errorMessage = (exception instanceof Error) ? exception.message : 'An unexpected error occurred.';
    throw new Error(`Failed to send email via Brevo: ${errorMessage}`);
  }
}

interface SendEmailInput {
    to: string;
    name: string;
    subject: string;
    body: string; // HTML body
}

export async function sendCustomEmailAction(
  input: SendEmailInput
) {
  try {
    console.log('Sending custom email...');
    
    // Split recipients if it's a bulk email
    const recipients = input.to.split(',').map(email => email.trim());

    for (const recipientEmail of recipients) {
      const htmlBody = input.body.replace(/\n/g, '<br>');
      await sendEmailWithResend(input.subject, htmlBody, recipientEmail, input.name);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Detailed error in sendCustomEmailAction:', error); 
    return { success: false, error: error.message || 'Failed to send the email.' };
  }
}
