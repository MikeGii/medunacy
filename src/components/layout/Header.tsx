'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  
  // Extract current locale from pathname
  const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
  const baseUrl = `/${currentLocale}`;

  return (
    <header className="bg-gradient-to-r from-white to-[#FBF6E9] border-b-2 border-[#E3F0AF] shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={baseUrl} className="group">
              <Image
                src="/images/header_logo.png"
                alt="Medunacy Logo"
                width={180}
                height={45}
                className="h-12 w-auto cursor-pointer transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Navigation */}
            {pathname.includes('/meist') ? (
              <Link 
                href={baseUrl}
                className="px-6 py-2.5 text-[#118B50] hover:text-white bg-[#E3F0AF] hover:bg-[#5DB996] 
                         font-semibold rounded-full transition-all duration-300 ease-in-out
                         border-2 border-[#5DB996] hover:border-[#118B50] 
                         shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {t('home')}
              </Link>
            ) : (
              <Link 
                href={`${baseUrl}/meist`}
                className="px-6 py-2.5 text-[#118B50] hover:text-white bg-[#E3F0AF] hover:bg-[#5DB996] 
                         font-semibold rounded-full transition-all duration-300 ease-in-out
                         border-2 border-[#5DB996] hover:border-[#118B50] 
                         shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {t('about')}
              </Link>
            )}
            
            <button className="px-6 py-2.5 text-white bg-[#118B50] hover:bg-[#5DB996] 
                             font-semibold rounded-full transition-all duration-300 ease-in-out
                             border-2 border-[#118B50] hover:border-[#E3F0AF]
                             shadow-md hover:shadow-lg transform hover:scale-105">
              {t('login')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}