
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center space-y-6 text-center">
      <Frown className="h-24 w-24 text-primary" />
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {t('notFound.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('notFound.description')}
        </p>
      </div>
      <Button asChild>
        <Link href="/">{t('notFound.goHome')}</Link>
      </Button>
    </div>
  );
}

