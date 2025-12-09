'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { PageTransition, TransitionVariant, TransitionType } from '@/components/motion/PageTransition';

interface MainLayoutProps {
  children: React.ReactNode;
  /** Animation variant for page transitions (ignored when directionAware is true) */
  transition?: TransitionVariant;
  /** Transition timing preset */
  transitionType?: TransitionType;
  /** Disable page transition animation */
  disableTransition?: boolean;
  /** Enable direction-aware sliding based on nav tab position (default: true) */
  directionAware?: boolean;
  /** Fallback animation when direction cannot be determined */
  fallbackTransition?: TransitionVariant;
}

export default function MainLayout({
  children,
  transition = 'scaleBlur',
  transitionType = 'smooth',
  disableTransition = false,
  directionAware = true,
  fallbackTransition = 'scaleBlur',
}: MainLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, isPublicPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <PageTransition
          variant={transition}
          transition={transitionType}
          disabled={disableTransition}
          directionAware={directionAware}
          fallbackVariant={fallbackTransition}
        >
          {children}
        </PageTransition>
      </main>
      <Toaster />
    </div>
  );
}
