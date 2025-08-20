
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/products';
import { generateLearningZoneContentAction } from './actions';
import { BookOpen, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LearningZonePage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    
    startTransition(async () => {
      const result = await generateLearningZoneContentAction({ productCategory: selectedCategory });
      if (result) {
        setContent(result.content);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <BookOpen className="mx-auto h-16 w-16 text-primary" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-4">Learning Zone</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Unlock expert insights, guides, and tips for our product categories. Make informed decisions and get the most out of your purchases.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
          <CardDescription>Select a product category to get started.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={!selectedCategory || isPending} className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            {isPending ? 'Generating...' : 'Generate'}
          </Button>
        </CardContent>
      </Card>

      {(isPending || content) && (
        <div className="max-w-4xl mx-auto mt-10">
          <h2 className="font-headline text-3xl font-bold mb-4">Your AI-Generated Guide</h2>
          <Card className="prose dark:prose-invert max-w-none p-6">
            {isPending ? (
               <div className="space-y-4">
                 <Skeleton className="h-8 w-3/4" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
                 <br/>
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
               </div>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
