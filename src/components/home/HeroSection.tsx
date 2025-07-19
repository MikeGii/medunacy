// src/components/home/HeroSection.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] py-12 lg:py-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#E3F0AF] rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#5DB996] rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#118B50] rounded-full opacity-10 blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-[#118B50] leading-tight mb-6">
                {t('title')}
                <span className="block text-[#5DB996]">{t('subtitle')}</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl">
                {t('description')}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#118B50] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">
                  {t('features.verified')}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#5DB996] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">
                  {t('features.network')}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#E3F0AF] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[#118B50]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{t('features.matching')}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#118B50] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{t('features.growth')}</span>
              </div>
            </div>

            {/* CTA Button - Only shown on mobile */}
            <div className="lg:hidden flex flex-col sm:flex-row gap-4">
              <button
                className="px-8 py-4 bg-[#118B50] hover:bg-[#0F7A43] text-white font-semibold 
                               rounded-xl transition-all duration-300 ease-in-out
                               shadow-lg hover:shadow-xl transform hover:scale-105
                               border-2 border-transparent hover:border-[#E3F0AF]"
              >
                {t('cta.get_started')}
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:order-last order-first">
            <div className="relative">
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-[#E3F0AF] to-[#5DB996] p-1">
                <div className="relative overflow-hidden rounded-3xl">
                  <Image
                    src="/images/doctor_image_hero.png"
                    alt="Medical Professional"
                    width={600}
                    height={700}
                    className="w-full h-auto object-cover"
                    priority
                  />

                  {/* Professional overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#118B50]/20 via-transparent to-transparent"></div>
                  
                  {/* "Alusta täna" button positioned on image - ONLY visible on desktop */}
                  <div className="hidden lg:block absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <button
                      className="px-8 py-4 bg-[#118B50] hover:bg-[#0F7A43] text-white font-semibold 
                                 rounded-xl transition-all duration-300 ease-in-out
                                 shadow-lg hover:shadow-xl transform hover:scale-105
                                 border-2 border-transparent hover:border-[#E3F0AF]
                                 backdrop-blur-sm"
                    >
                      {t('cta.get_started')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#E3F0AF] rounded-full opacity-60 blur-sm animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#5DB996] rounded-full opacity-40 blur-md"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave separator */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,69.3C672,64,768,64,864,69.3C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}