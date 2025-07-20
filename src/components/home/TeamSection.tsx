// src/components/home/TeamSection.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function TeamSection() {
  const t = useTranslations("team");
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
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const doctors = [
    {
      name: t("doctors.doctor1.name"),
      specialization: t("doctors.doctor1.specialization"),
      description: t("doctors.doctor1.description"),
      image: "/images/doctor1.jpg",
      gradient: "from-[#118B50] to-[#5DB996]",
      accentColor: "bg-[#118B50]",
    },
    // You can add more doctors here in the future
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Enhanced Background with Medical Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-15 md:opacity-25">
          <div
            className="absolute w-72 h-72 md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] blur-3xl"
            style={{
              top: `${15 + mousePosition.y * 0.02}%`,
              right: `${10 + mousePosition.x * 0.015}%`,
              transform: "translate(50%, -50%)",
            }}
          />
          <div
            className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-l from-[#118B50] to-[#5DB996] blur-2xl"
            style={{
              bottom: `${25 + mousePosition.y * 0.02}%`,
              left: `${15 + mousePosition.x * 0.01}%`,
              transform: "translate(-50%, 50%)",
            }}
          />
          <div
            className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-[#5DB996] to-[#E3F0AF] blur-xl opacity-70"
            style={{
              top: `${60 + mousePosition.y * 0.025}%`,
              right: `${60 + mousePosition.x * 0.02}%`,
              transform: "translate(50%, -50%)",
            }}
          />
        </div>

        {/* Medical Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-8 h-8 md:w-12 md:h-12 text-[#118B50] opacity-30">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 8h2v8H4V8zm4-2h8v12H8V6z"/>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-32 right-16 animate-float-delayed">
            <div className="w-6 h-6 md:w-10 md:h-10 text-[#5DB996] opacity-40">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 md:mb-20 transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 md:mb-8">
            <span
              className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent 
                         drop-shadow-sm animate-gradient-shift"
            >
              {t("title")}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Doctors Grid - Smaller size for better image quality */}
        <div className="flex justify-center mb-16">
          <div className="max-w-md w-full">
            {doctors.map((doctor, index) => (
              <div
                key={index}
                className={`group relative bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 
                           border border-white/50 hover:border-[#5DB996]/50 
                           shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 
                           overflow-hidden ${
                             isVisible
                               ? "translate-y-0 opacity-100"
                               : "translate-y-10 opacity-0"
                           }`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  transitionDelay: `${index * 0.2}s`,
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${doctor.gradient} opacity-0 
                             group-hover:opacity-5 transition-opacity duration-700 rounded-2xl md:rounded-3xl`}
                />

                {/* Floating Medical Icons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-sm">🩺</span>
                  </div>
                </div>

                {/* Doctor Image with Smaller Size */}
                <div className="relative mb-6 md:mb-8">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${doctor.gradient} opacity-20 blur-md`} />
                    
                    {/* Main image container */}
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-1 border border-white/50">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={doctor.image}
                          alt={doctor.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Animated rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#5DB996]/30 animate-pulse" />
                    <div 
                      className="absolute inset-[-6px] rounded-full border border-[#118B50]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </div>
                </div>

                {/* Doctor Info with Enhanced Typography */}
                <div className="relative text-center space-y-3 md:space-y-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#118B50] mb-2 leading-tight">
                      {doctor.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <div className={`w-1.5 h-1.5 ${doctor.accentColor} rounded-full animate-pulse`} />
                      <p className="text-base md:text-lg font-semibold text-[#5DB996]">
                        {doctor.specialization}
                      </p>
                      <div className={`w-1.5 h-1.5 ${doctor.accentColor} rounded-full animate-pulse`} style={{ animationDelay: "0.5s" }} />
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base font-light">
                      {doctor.description}
                    </p>
                    
                    {/* Decorative quote marks */}
                    <div className="absolute -top-1 -left-1 text-[#E3F0AF] text-xl md:text-2xl opacity-50 font-serif">"</div>
                    <div className="absolute -bottom-1 -right-1 text-[#E3F0AF] text-xl md:text-2xl opacity-50 font-serif">"</div>
                  </div>

                  {/* Hover indicator */}
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full 
                               scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
                  />
                </div>

                {/* Decorative corner elements */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#5DB996]/30 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#5DB996]/30 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Text with Enhanced Styling */}
        <div
          className={`text-center max-w-3xl mx-auto transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E3F0AF]/20 via-white/40 to-[#5DB996]/20 blur-xl rounded-2xl" />
            <div className="relative bg-white/30 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/50">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                {t("bottom_text")}
              </p>
              
              {/* Mission statement decoration */}
              <div className="flex items-center justify-center mt-4 space-x-4">
                <div className="h-px bg-gradient-to-r from-transparent via-[#5DB996]/50 to-transparent flex-1" />
                <div className="w-2 h-2 bg-[#118B50] rounded-full animate-pulse" />
                <div className="h-px bg-gradient-to-r from-transparent via-[#5DB996]/50 to-transparent flex-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Future Team Members Placeholder - Hidden but ready for expansion */}
        <div className="hidden mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#E3F0AF]/30 to-[#5DB996]/30 rounded-full border border-[#5DB996]/30">
            <span className="text-[#118B50] font-medium">More team members coming soon</span>
            <div className="w-4 h-4 bg-[#118B50] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}