// src/hooks/useLanguageSync.ts
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useLanguageSync() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const syncUserLanguage = async () => {
      if (!user) return;

      try {
        // Get user's preferred language from database
        const { data, error } = await supabase
          .from('users')
          .select('preferred_language')
          .eq('user_id', user.id)
          .single();

        if (error || !data?.preferred_language) return;

        const preferredLang = data.preferred_language;
        const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';

        // If user's preferred language doesn't match current locale, redirect
        if (
          (preferredLang === 'ukr' && currentLocale === 'et') ||
          (preferredLang === 'et' && currentLocale === 'ukr')
        ) {
          const newLocale = preferredLang;
          const pathWithoutLocale = pathname.replace(/^\/(et|ukr)/, '') || '/';
          const newPath = `/${newLocale}${pathWithoutLocale}`;
          
          router.push(newPath);
        }
      } catch (error) {
        console.error('Error syncing language preference:', error);
      }
    };

    syncUserLanguage();
  }, [user, pathname, router]);
}