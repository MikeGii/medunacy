// src/components/profile/ProfilePage.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../layout/Header';
import ProfileHero from './ProfileHero';
import ProfileForm from './ProfileForm';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to main page if not authenticated
    if (!loading && !user) {
      const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
      router.push(`/${currentLocale}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render profile if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />
        
        {/* Main Profile Content */}
        <main>
          <ProfileHero />
          <ProfileForm />
        </main>
      </div>
    </AuthModalProvider>
  );
}