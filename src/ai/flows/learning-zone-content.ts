'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating learning zone content based on product categories.
 *
 * It includes:
 * - `generateLearningZoneContent`: A function to generate learning zone content.
 * - `LearningZoneContentInput`: The input type for the `generateLearningZoneContent` function.
 * - `LearningZoneContentOutput`: The output type for the `generateLearningZoneContent` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningZoneContentInputSchema = z.object({
  productCategory: z.string().describe('The category of the product.'),
});
export type LearningZoneContentInput = z.infer<typeof LearningZoneContentInputSchema>;

const LearningZoneContentOutputSchema = z.object({
  content: z.string().describe('AI-generated content providing product guides, tips, and blog-style insights.'),
});
export type LearningZoneContentOutput = z.infer<typeof LearningZoneContentOutputSchema>;

export async function generateLearningZoneContent(input: LearningZoneContentInput): Promise<LearningZoneContentOutput> {
  return learningZoneContentFlow(input);
}

const learningZoneContentPrompt = ai.definePrompt({
  name: 'learningZoneContentPrompt',
  input: {schema: LearningZoneContentInputSchema},
  output: {schema: LearningZoneContentOutputSchema},
  prompt: `You are an AI assistant designed to generate learning zone content for an e-commerce platform.

  Based on the product category provided, generate helpful product guides, tips, and blog-style insights to help users make informed purchasing decisions.

  Product Category: {{{productCategory}}}

  Content:`, // Removed the handlebars tags, and only have the single Content field.
});

const learningZoneContentFlow = ai.defineFlow(
  {
    name: 'learningZoneContentFlow',
    inputSchema: LearningZoneContentInputSchema,
    outputSchema: LearningZoneContentOutputSchema,
  },
  async input => {
    const {output} = await learningZoneContentPrompt(input);
    return output!;
  }
);
