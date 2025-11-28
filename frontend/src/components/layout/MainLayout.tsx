'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
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
        {children}
      </main>
      <Toaster />
    </div>
  );
}
