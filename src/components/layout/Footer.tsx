// src/components/layout/Footer.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  
  // Get current locale
  const currentLocale = useMemo(
    () => (pathname.startsWith("/ukr") ? "ukr" : "et"),
    [pathname]
  );
  
  const baseUrl = useMemo(() => `/${currentLocale}`, [currentLocale]);
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-[#FBF6E9] to-white border-t border-[#E3F0AF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Logo and Copyright */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <Link href={baseUrl} className="inline-block mb-4">
                  <Image
                    src="/images/header_logo.png"
                    alt="Medunacy Logo"
                    width={180}
                    height={40}
                    className="h-12 w-auto"
                  />
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-auto">
                {t("copyright", { year: currentYear })}
              </p>
            </div>
            
            {/* Middle Column - Legal Links */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#118B50] mb-4">
                {t("legal")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`${baseUrl}/privacy-policy`}
                    className="text-gray-600 hover:text-[#118B50] transition-colors"
                  >
                    {t("privacy_policy")}
                  </Link>
                </li>
                {/* Add more legal links here when needed */}
              </ul>
            </div>
            
            {/* Right Column - Made with love */}
            <div className="flex items-end justify-end h-full">
              <p className="text-sm text-gray-600">
                {t("made_with")} <span className="text-red-500">❤️</span> {t("in_estonia")}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
}