
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized order confirmation email.
 *
 * It includes:
 * - `generateOrderConfirmationEmail`: A function to generate the email content.
 * - `OrderConfirmationEmailInput`: The input type for the `generateOrderConfirmationEmail` function.
 * - `OrderConfirmationEmailOutput`: The output type for the `generateOrderConfirmationEmail` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Order } from '@/lib/orders';

const OrderConfirmationEmailInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  order: z.custom<Order>().describe('The order details.'),
});
export type OrderConfirmationEmailInput = z.infer<typeof OrderConfirmationEmailInputSchema>;

const OrderConfirmationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type OrderConfirmationEmailOutput = z.infer<typeof OrderConfirmationEmailOutputSchema>;

export async function generateOrderConfirmationEmail(
  input: OrderConfirmationEmailInput
): Promise<OrderConfirmationEmailOutput> {
  return orderConfirmationEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'orderConfirmationEmailPrompt',
  input: { schema: OrderConfirmationEmailInputSchema },
  output: { schema: OrderConfirmationEmailOutputSchema },
  prompt: `You are a customer service assistant for an e-commerce store called "SajiloMart".

  Your task is to generate a friendly and professional order confirmation email.

  The customer's name is {{{customerName}}}.
  The order ID is {{{order.id}}}.
  The order total is ₹{{{order.total}}}.
  The items purchased are:
  {{#each order.items}}
  - <div>
      <img src="{{this.productImage}}" alt="{{this.productName}}" style="width: 50px; height: 50px; vertical-align: middle; margin-right: 10px;" />
      {{this.quantity}}x {{this.productName}} at ₹{{this.price}} each.
    </div>
  {{/each}}

  The email should:
  1. Have a clear subject line like "Your SajiloMart Order Confirmation!".
  2. Greet the customer warmly by their name.
  3. Thank them for their purchase.
  4. Confirm the order ID and the total amount.
  5. Include a list of items with their images, quantity, and price.
  6. Mention that they will receive another notification once the order ships.
  7. Be formatted in simple, clean HTML (using <p>, <strong>, <div>, and <img> tags).

  Generate the subject and body for the email based on these details.
  `,
});

const orderConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'orderConfirmationEmailFlow',
    inputSchema: OrderConfirmationEmailInputSchema,
    outputSchema: OrderConfirmationEmailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate email content.');
    }
    return output;
  }
);
