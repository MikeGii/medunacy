'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract current locale from pathname
  const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
  
  const switchLanguage = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(et|ukr)/, '') || '/';
    
    // Add new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center space-x-1 bg-[#E3F0AF] rounded-full p-1">
      <button
        onClick={() => switchLanguage('et')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
          currentLocale === 'et'
            ? 'bg-[#118B50] text-white shadow-sm'
            : 'text-[#118B50] hover:bg-[#5DB996] hover:text-white'
        }`}
      >
        EST
      </button>
      <button
        onClick={() => switchLanguage('ukr')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
          currentLocale === 'ukr'
            ? 'bg-[#118B50] text-white shadow-sm'
            : 'text-[#118B50] hover:bg-[#5DB996] hover:text-white'
        }`}
      >
        УКР
      </button>
    </div>
  );
}