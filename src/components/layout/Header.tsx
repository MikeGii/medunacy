// src/components/layout/Header.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('navigation');
  
  // Extract current locale from pathname
  const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
  const baseUrl = `/${currentLocale}`;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white to-[#FBF6E9] border-b-2 border-[#E3F0AF] shadow-lg backdrop-blur-sm">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language Switcher - normal behavior for desktop */}
              <LanguageSwitcher />
              
              {/* Navigation */}           
              <button className="px-6 py-2.5 text-white bg-[#118B50] hover:bg-[#5DB996] 
                               font-semibold rounded-full transition-all duration-300 ease-in-out
                               border-2 border-[#118B50] hover:border-[#E3F0AF]
                               shadow-md hover:shadow-lg transform hover:scale-105">
                {t('login')}
              </button>
            </div>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200 z-50"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col justify-center items-center w-6 h-6">
                <span
                  className={`block w-5 h-0.5 bg-[#118B50] transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside header container */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeMobileMenu}>
          <div 
            className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#FBF6E9] to-white shadow-2xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={closeMobileMenu}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
              >
                <span className="text-[#118B50] text-xl font-bold">×</span>
              </button>
            </div>

            {/* Menu Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Language Switcher - prevent close for mobile */}
              <div className="flex justify-center">
                <LanguageSwitcher preventClose={true} />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-4">                
                <button 
                  onClick={closeMobileMenu}
                  className="block w-full px-6 py-3 text-center text-white bg-[#118B50] 
                           hover:bg-[#5DB996] font-semibold rounded-full transition-all 
                           duration-300 ease-in-out border-2 border-[#118B50] 
                           hover:border-[#E3F0AF] shadow-md hover:shadow-lg"
                >
                  {t('login')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}