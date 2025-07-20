// src/components/home/FAQSection.tsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function FAQSection() {
  const t = useTranslations("faq");
  const [isVisible, setIsVisible] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([]);
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

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  // Original 4 FAQ items
  const faqItems = [
    {
      question: t("questions.q1.question"),
      answer: t("questions.q1.answer"),
    },
    {
      question: t("questions.q2.question"),
      answer: t("questions.q2.answer"),
    },
    {
      question: t("questions.q3.question"),
      answer: t("questions.q3.answer"),
    },
    {
      question: t("questions.q4.question"),
      answer: t("questions.q4.answer"),
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-white via-[#FBF6E9] to-white">
      {/* Enhanced Background with Medical Theme */}
      <div className="absolute inset-0">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10 md:opacity-20">
          <div
            className="absolute w-80 h-80 md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-r from-[#5DB996] to-[#E3F0AF] blur-3xl"
            style={{
              top: `${10 + mousePosition.y * 0.015}%`,
              left: `${5 + mousePosition.x * 0.01}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-64 h-64 md:w-[400px] md:h-[400px] rounded-full bg-gradient-to-l from-[#118B50] to-[#5DB996] blur-2xl"
            style={{
              bottom: `${15 + mousePosition.y * 0.02}%`,
              right: `${10 + mousePosition.x * 0.015}%`,
              transform: "translate(50%, 50%)",
            }}
          />
          <div
            className="absolute w-56 h-56 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#118B50] blur-xl opacity-60"
            style={{
              top: `${70 + mousePosition.y * 0.02}%`,
              left: `${70 + mousePosition.x * 0.025}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Medical Question Mark Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-32 right-20 animate-float">
            <div className="w-8 h-8 md:w-12 md:h-12 text-[#5DB996] opacity-40">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-40 left-16 animate-float-delayed">
            <div className="w-6 h-6 md:w-10 md:h-10 text-[#118B50] opacity-30">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 md:mb-16 transform transition-all duration-1000 ease-out ${
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
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 md:space-y-6">
          {faqItems.map((item, index) => {
            const isOpen = openItems.includes(index);

            return (
              <div
                key={index}
                className={`group relative bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl 
                           border border-white/50 hover:border-[#5DB996]/50 
                           shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden
                           ${isOpen ? "ring-2 ring-[#5DB996]/30" : ""}
                           ${
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
                  className={`absolute inset-0 bg-gradient-to-r from-[#118B50]/5 to-[#5DB996]/5 opacity-0 
                             group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl`}
                />

                {/* Question Button */}
                <button
                  onClick={() => toggleItem(index)}
                  className="relative w-full text-left p-6 md:p-8 focus:outline-none focus:ring-2 focus:ring-[#5DB996]/50 focus:ring-inset"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Question Number Badge */}
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm md:text-base font-bold">
                          {index + 1}
                        </span>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-lg md:text-xl font-semibold text-[#118B50] leading-tight pr-4">
                        {item.question}
                      </h3>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0 ml-4">
                      <div
                        className={`w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] rounded-full flex items-center justify-center transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 text-[#118B50]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Answer Content */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="relative px-6 md:px-8 pb-6 md:pb-8">
                    {/* Decorative separator */}
                    <div className="flex items-center mb-4 space-x-4">
                      <div className="w-12 md:w-16 h-px bg-gradient-to-r from-[#118B50] to-[#5DB996]" />
                      <div className="w-2 h-2 bg-[#5DB996] rounded-full animate-pulse" />
                      <div className="flex-1 h-px bg-gradient-to-r from-[#5DB996] to-transparent" />
                    </div>

                    {/* Answer Text */}
                    <div className="relative ml-12 md:ml-14">
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base font-light">
                        {item.answer}
                      </p>

                      {/* Subtle decorative quote */}
                      <div className="absolute -left-6 top-0 text-[#E3F0AF] text-2xl opacity-30 font-serif">
                        &ldquo;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative corner elements for open items */}
                {isOpen && (
                  <>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#5DB996]/40 rounded-tr-lg opacity-60" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#5DB996]/40 rounded-bl-lg opacity-60" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
