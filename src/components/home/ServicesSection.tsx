// src/components/home/ServicesSection.tsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";

export default function ServicesSection() {
  const t = useTranslations("services");
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { user } = useAuth();
  const { openLogin } = useAuthModal();

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

  const services = [
    {
      icon: (
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: t("student_guidance.title"),
      description: t("student_guidance.description"),
      gradient: "from-[#118B50] to-[#5DB996]",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      title: t("graduate_support.title"),
      description: t("graduate_support.description"),
      gradient: "from-[#5DB996] to-[#E3F0AF]",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: t("documentation.title"),
      description: t("documentation.description"),
      gradient: "from-[#E3F0AF] to-[#118B50]",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      title: t("training.title"),
      description: t("training.description"),
      gradient: "from-[#118B50] to-[#5DB996]",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      title: t("exam_prep.title"),
      description: t("exam_prep.description"),
      gradient: "from-[#5DB996] to-[#E3F0AF]",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      title: t("personal_consulting.title"),
      description: t("personal_consulting.description"),
      gradient: "from-[#E3F0AF] to-[#118B50]",
    },
  ];

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FBF6E9] to-white">
        {/* Animated background patterns - subtle */}
        <div className="absolute inset-0 opacity-10 md:opacity-20">
          <div
            className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] blur-3xl"
            style={{
              top: `${30 + mousePosition.y * 0.02}%`,
              left: `${80 + mousePosition.x * 0.01}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-l from-[#118B50] to-[#5DB996] blur-2xl"
            style={{
              bottom: `${20 + mousePosition.y * 0.015}%`,
              left: `${10 + mousePosition.x * 0.01}%`,
              transform: "translate(-50%, 50%)",
            }}
          />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 md:mb-16 transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
            <span
              className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent 
                           drop-shadow-sm animate-gradient-shift"
            >
              {t("title")}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {t("subtitle")} {t("team_info")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 
                         border border-white/50 hover:border-[#5DB996]/50 
                         shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 
                         overflow-hidden ${
                           isVisible
                             ? "translate-y-0 opacity-100"
                             : "translate-y-10 opacity-0"
                         }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                transitionDelay: `${index * 0.1}s`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 
                             group-hover:opacity-5 transition-opacity duration-500 rounded-2xl md:rounded-3xl`}
              ></div>

              {/* Icon */}
              <div
                className={`relative inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 
                           rounded-xl md:rounded-2xl bg-gradient-to-br ${service.gradient} text-white mb-4 md:mb-6 
                           group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                {service.icon}
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#118B50] mb-3 md:mb-4 leading-tight">
                  {service.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
                  {service.description}
                </p>

                {/* Subtle hover indicator */}
                <div
                  className="w-12 h-1 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full 
                              transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div
            className={`text-center mt-12 md:mt-16 transform transition-all duration-1000 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            <button
              onClick={openLogin}
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#118B50] to-[#5DB996] 
       text-white font-semibold rounded-xl md:rounded-2xl overflow-hidden
       shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300
       border border-white/20 hover:border-white/40"
            >
              {/* Button shimmer effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
            -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              ></div>

              <span className="relative z-10">{t("get_started")}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
