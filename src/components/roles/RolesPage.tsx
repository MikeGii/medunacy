"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../layout/Header';
import RolesTable from './RolesTable';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';

export default function RolesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // Check if user is admin
      if (user.role === 'admin') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
        router.push(`/${currentLocale}/dashboard`);
      }
    } else if (!loading && !user) {
      // Not authenticated
      setIsAuthorized(false);
      const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
      router.push(`/${currentLocale}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading while checking authorization
  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />
        
        {/* Main Roles Content */}
        <main>
          <RolesTable />
        </main>
      </div>
    </AuthModalProvider>
  );
}