// src/components/with-auth.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ComponentType, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Role = 'user' | 'admin';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>, role: Role = 'user') => {
  const WithAuthComponent = (props: P) => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
      if (!loading && user && role === 'admin' && !isAdmin) {
          router.replace('/');
      }
    }, [user, loading, isAdmin, router]);

    if (loading || !user || (role === 'admin' && !isAdmin)) {
      return (
        <div className="container mx-auto px-4 py-12">
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <br/>
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithAuthComponent;
};

export default withAuth;
