'use server';

import { generateLearningZoneContent, type LearningZoneContentInput } from '@/ai/flows/learning-zone-content';

export async function generateLearningZoneContentAction(input: LearningZoneContentInput) {
  try {
    const result = await generateLearningZoneContent(input);
    return result;
  } catch (error) {
    console.error('Error generating learning zone content:', error);
    return { content: 'Sorry, we were unable to generate content at this time. Please try again later.' };
  }
}
