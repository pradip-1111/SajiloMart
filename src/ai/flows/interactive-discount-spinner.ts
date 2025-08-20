
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized interactive discount spinners using AI.
 *
 * The flow takes user interests as input and returns a structured list of potential discounts.
 *
 * @exports {generateDiscountSpinner} - An async function that generates the discount spinner description.
 * @exports {DiscountSpinnerInput} - The input type for the generateDiscountSpinner function.
 * @exports {DiscountSpinnerOutput} - The output type for the generateDiscountSpinner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscountSpinnerInputSchema = z.object({
  userInterests: z
    .string()
    .describe('A comma-separated list of the user’s interests.'),
});
export type DiscountSpinnerInput = z.infer<typeof DiscountSpinnerInputSchema>;

const DiscountSchema = z.object({
    name: z.string().describe("The name of the discount or prize, e.g., '10% Off Electronics'"),
    value: z.string().describe("The discount value, e.g., '10%' or '$5'"),
});

const DiscountSpinnerOutputSchema = z.object({
  discounts: z.array(DiscountSchema).length(8).describe('An array of exactly 8 personalized discounts tailored to the user interests.'),
  result: z.object({
    name: z.string().describe("The name of the winning discount."),
    value: z.string().describe("The value of the winning discount."),
    message: z.string().describe("A congratulatory message for the user, mentioning what they won."),
    code: z.string().describe("A unique, all-caps, alphanumeric coupon code for the prize, e.g., 'SPIN-WIN-XYZ'"),
  }),
});
export type DiscountSpinnerOutput = z.infer<typeof DiscountSpinnerOutputSchema>;

export async function generateDiscountSpinner(
  input: DiscountSpinnerInput
): Promise<DiscountSpinnerOutput> {
  return discountSpinnerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'discountSpinnerPrompt',
  input: {schema: DiscountSpinnerInputSchema},
  output: {schema: DiscountSpinnerOutputSchema},
  prompt: `You are a marketing expert creating an exciting discount spinner for an e-commerce store. Your goal is to create prizes that are appealing to customers but also beneficial for the business (e.g., encouraging purchase of certain categories, modest discounts).

Based on the user's interests, you MUST generate an array of exactly 8 personalized discounts. The discounts should be varied and appealing. Some can be percentage-based, some fixed-value, and some could be for specific product categories related to their interests.

After defining the 8 discounts, you MUST randomly select one of them as the 'winning' prize. Then, create a unique, all-caps, alphanumeric coupon code for the winning prize (e.g., 'WINNER-SPIN-123').

Finally, populate the 'result' object with the winning prize's details, the new coupon code, and a fun, congratulatory message.

User Interests: {{{userInterests}}}
`,
});

const discountSpinnerFlow = ai.defineFlow(
  {
    name: 'discountSpinnerFlow',
    inputSchema: DiscountSpinnerInputSchema,
    outputSchema: DiscountSpinnerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
