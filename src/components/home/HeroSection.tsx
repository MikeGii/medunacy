// src/components/home/HeroSection.tsx
"use client";

import { useAuthModal } from "@/hooks/useAuthModal";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const t = useTranslations("hero");
  const { user } = useAuth();
  const { openRegister } = useAuthModal();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Mouse parallax effect (disabled on mobile for performance)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth >= 768) {
        // Only on tablet and up
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Get user's full name for personalized greeting
  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const fullName =
    firstName && lastName ? `${firstName} ${lastName}` : firstName;

  // Create personalized greeting based on locale
  const getPersonalizedGreeting = () => {
    if (!user || !fullName) return null;

    // Get current locale from URL or default to Estonian
    const currentLocale = window.location.pathname.startsWith("/ukr")
      ? "ukr"
      : "et";

    if (currentLocale === "ukr") {
      return `Привіт ${fullName}!`;
    } else {
      return `Tere ${fullName}!`;
    }
  };

  const personalizedGreeting = getPersonalizedGreeting();

  return (
    <section className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center">
      {/* Enhanced Background with Glass Morphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        {/* Animated background patterns - reduced on mobile */}
        <div className="absolute inset-0 opacity-20 md:opacity-30">
          <div
            className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] blur-2xl md:blur-3xl animate-pulse"
            style={{
              top: `${20 + mousePosition.y * 0.05}%`, // Reduced movement on mobile
              left: `${10 + mousePosition.x * 0.02}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-l from-[#118B50] to-[#5DB996] blur-xl md:blur-2xl animate-pulse"
            style={{
              bottom: `${10 + mousePosition.y * 0.04}%`,
              right: `${15 + mousePosition.x * 0.015}%`,
              transform: "translate(50%, 50%)",
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-[#5DB996] to-[#E3F0AF] blur-lg md:blur-xl opacity-60"
            style={{
              top: `${60 + mousePosition.y * 0.03}%`,
              left: `${70 + mousePosition.x * 0.02}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: "2s",
            }}
          />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            className={`space-y-6 md:space-y-8 transform transition-all duration-1000 ease-out ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            {/* Main Title with Enhanced Typography - Mobile optimized */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span
                  className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent 
                 drop-shadow-sm animate-gradient-shift block"
                >
                  {t("title")}
                </span>
                <span
                  className="bg-gradient-to-r from-[#5DB996] to-[#E3F0AF] bg-clip-text text-transparent 
                 drop-shadow-sm animate-gradient-shift-delayed block"
                >
                  {t("subtitle")}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl font-light">
                {t("description")}
              </p>
            </div>

            {/* Enhanced Key Features - Mobile responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { icon: "👥", text: t("features.network"), delay: "0.2s" },
                { icon: "📈", text: t("features.growth"), delay: "0.4s" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl md:rounded-2xl 
                           bg-white/30 backdrop-blur-md border border-white/40 hover:border-[#5DB996]/50 
                           transition-all duration-300 hover:shadow-lg hover:scale-105"
                  style={{ animationDelay: feature.delay }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#5DB996] to-[#118B50] 
                                rounded-lg md:rounded-xl flex items-center justify-center shadow-lg 
                                group-hover:scale-110 transition-transform duration-300"
                  >
                    <span className="text-lg md:text-xl">{feature.icon}</span>
                  </div>
                  <span className="text-gray-700 font-medium text-base md:text-lg">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Button - Mobile hidden */}
            <div className="lg:hidden pt-2">
              {/* Mobile button intentionally removed */}
            </div>
          </div>

          {/* Right Image - Mobile optimized */}
          <div
            className={`relative lg:order-last order-first transform transition-all duration-1000 ease-out ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative group max-w-md mx-auto lg:max-w-none">
              {/* Glass Morphism Frame - Mobile responsive */}
              <div
                className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl 
                            bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border border-white/30 p-1 md:p-2"
              >
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
                  <Image
                    src="/images/doctor_image_hero.png"
                    alt="Medical Professional"
                    width={600}
                    height={700}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Enhanced overlay with subtle animation */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#118B50]/30 via-transparent to-transparent 
                                opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                  ></div>

                  {/* Desktop CTA Button - Enhanced */}
                  <div className="hidden lg:block absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={user ? undefined : openRegister}
                      className="group relative px-6 md:px-8 py-3 md:py-4 bg-white/90 backdrop-blur-md text-[#118B50] 
                               font-semibold rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 
                               transition-all duration-300 border border-white/50 hover:border-[#5DB996]/50 overflow-hidden"
                    >
                      {/* Button glow effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-[#118B50]/0 via-[#5DB996]/10 to-[#118B50]/0 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      ></div>

                      <span className="relative z-10">
                        {user && personalizedGreeting
                          ? personalizedGreeting
                          : t("cta.get_started")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Elements - Reduced on mobile */}
              <div
                className="absolute -top-3 md:-top-6 -right-3 md:-right-6 w-16 h-16 md:w-24 md:h-24 
                            bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] rounded-full opacity-60 blur-sm animate-pulse"
              ></div>
              <div
                className="absolute -bottom-4 md:-bottom-8 -left-4 md:-left-8 w-20 h-20 md:w-32 md:h-32 
                            bg-gradient-to-br from-[#5DB996] to-[#118B50] rounded-full opacity-40 blur-md animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* New floating medical symbols - Hidden on mobile for cleaner look */}
              <div className="hidden md:block absolute top-8 lg:top-10 -left-2 lg:-left-4 animate-float">
                <div
                  className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center 
                              justify-center border border-white/30 shadow-lg"
                >
                  <span className="text-lg lg:text-2xl">🩺</span>
                </div>
              </div>
              <div className="hidden md:block absolute bottom-16 lg:bottom-20 -right-3 lg:-right-6 animate-float-delayed">
                <div
                  className="w-10 h-10 lg:w-12 lg:h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center 
                              justify-center border border-white/40 shadow-lg"
                >
                  <span className="text-sm lg:text-lg">💉</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto opacity-80"
        >
          <path
            d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,69.3C672,64,768,64,864,69.3C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            fill="white"
            className="drop-shadow-sm"
          />
        </svg>
      </div>
    </section>
  );
}
