
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized welcome email for new users.
 *
 * It includes:
 * - `generateWelcomeEmail`: A function to generate the email content.
 * - `WelcomeEmailInput`: The input type for the `generateWelcomeEmail` function.
 * - `WelcomeEmailOutput`: The output type for the `generateWelcomeEmail` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WelcomeEmailInputSchema = z.object({
  name: z.string().describe('The name of the new user.'),
});
export type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;

const WelcomeEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type WelcomeEmailOutput = z.infer<typeof WelcomeEmailOutputSchema>;

export async function generateWelcomeEmail(
  input: WelcomeEmailInput
): Promise<WelcomeEmailOutput> {
  return welcomeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: { schema: WelcomeEmailInputSchema },
  output: { schema: WelcomeEmailOutputSchema },
  prompt: `You are a customer service assistant for an e-commerce store called "SajiloMart".

  Your task is to generate a friendly and welcoming email to a new user who just signed up.

  The user's name is {{{name}}}.

  The email should:
  1. Have a warm and inviting subject line like "Welcome to SajiloMart!".
  2. Greet the user by their name.
  3. Thank them for joining the SajiloMart community.
  4. Briefly mention what they can do on the platform (e.g., discover great products, enjoy amazing deals).
  5. End with a friendly closing.
  6. Be formatted in simple, clean HTML (using <p>, <strong>, etc.).

  Generate the subject and body for the email based on these details.
  `,
});

const welcomeEmailFlow = ai.defineFlow(
  {
    name: 'welcomeEmailFlow',
    inputSchema: WelcomeEmailInputSchema,
    outputSchema: WelcomeEmailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate email content.');
    }
    return output;
  }
);
