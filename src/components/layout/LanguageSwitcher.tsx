// src/components/layout/LanguageSwitcher.tsx
'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface LanguageSwitcherProps {
  onLanguageChange?: () => void;
  preventClose?: boolean;
}

const LanguageSwitcher = React.memo(function LanguageSwitcher({ 
  onLanguageChange, 
  preventClose = false 
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Memoize current locale extraction
  const currentLocale = useMemo(() => 
    pathname.startsWith('/ukr') ? 'ukr' : 'et',
    [pathname]
  );
  
  // Memoize the path without locale
  const pathWithoutLocale = useMemo(() => 
    pathname.replace(/^\/(et|ukr)/, '') || '/',
    [pathname]
  );
  
  // Optimize language switch handler
  const switchLanguage = useCallback((newLocale: string) => {
    // Skip if switching to same language
    if (newLocale === currentLocale) return;
    
    // Construct new path
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Use router.push with optimizations
    router.push(newPath, { scroll: false });
    
    // Handle callback only if needed
    if (onLanguageChange && !preventClose) {
      onLanguageChange();
    }
  }, [currentLocale, pathWithoutLocale, router, onLanguageChange, preventClose]);

  // Memoize button configurations
  const buttons = useMemo(() => [
    { locale: 'et', label: 'EST' },
    { locale: 'ukr', label: 'УКР' }
  ], []);

  return (
    <div className="flex items-center space-x-1 bg-[#E3F0AF] rounded-full p-1">
      {buttons.map(({ locale, label }) => (
        <LanguageButton
          key={locale}
          locale={locale}
          label={label}
          isActive={currentLocale === locale}
          onSwitch={switchLanguage}
        />
      ))}
    </div>
  );
});

// Separate button component for better optimization
const LanguageButton = React.memo(function LanguageButton({
  locale,
  label,
  isActive,
  onSwitch
}: {
  locale: string;
  label: string;
  isActive: boolean;
  onSwitch: (locale: string) => void;
}) {
  const handleClick = useCallback(() => {
    onSwitch(locale);
  }, [locale, onSwitch]);

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
        isActive
          ? 'bg-[#118B50] text-white shadow-sm'
          : 'text-[#118B50] hover:bg-[#5DB996] hover:text-white'
      }`}
      aria-label={`Switch to ${label}`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
});

export default LanguageSwitcher;