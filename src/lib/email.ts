
import * as brevo from '@getbrevo/brevo';

// Check for the API key when initializing the module.
if (!process.env.BREVO_API_KEY) {
    console.error("Brevo API key is not set. Please add BREVO_API_KEY to your .env file.");
    // We can choose to throw an error or handle it gracefully.
    // For now, we log the error. The send function will fail if the key is not set.
}

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY!;

// IMPORTANT: To send emails, you must verify a sender in your Brevo account.
// Update the email address below to the one you have verified in Brevo.
const fromEmail = { email: 'sonarp166@gmail.com', name: 'SajiloMart' };

export { apiInstance, fromEmail };
