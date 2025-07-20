// src/components/dashboard/QuickActions.tsx
"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import NotificationBadge from "../ui/NotificationBadge";

export default function QuickActions() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { isComplete, isLoading } = useProfileCompletion();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const baseUrl = `/${currentLocale}`;

  const quickActions = [
    {
      title: t("forum"),
      description: "Liitu kogukonna aruteludega",
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
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"
          />
        </svg>
      ),
      href: `${baseUrl}/forum`,
      gradient: "from-[#118B50] to-[#5DB996]",
      bgGradient: "from-[#118B50]/10 to-[#5DB996]/10",
      showNotification: false,
    },
    {
      title: t("my_data"),
      description: "Halda oma profiili andmeid",
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
      href: `${baseUrl}/profile`,
      gradient: "from-[#5DB996] to-[#E3F0AF]",
      bgGradient: "from-[#5DB996]/10 to-[#E3F0AF]/10",
      showNotification: !isLoading && !isComplete, // Show notification if profile is incomplete
    },
  ];

  return (
    <section className="relative py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
              {t("quick_actions")}
            </span>
          </h2>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className={`transform transition-all duration-1000 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
                transitionDelay: `${index * 0.2}s`,
              }}
            >
              <NotificationBadge showBadge={action.showNotification}>
                <Link
                  href={action.href}
                  className={`group relative bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 
                     border border-white/50 hover:border-[#5DB996]/50 
                     shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 
                     overflow-hidden block`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 
                         group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl`}
                  />

                  {/* Content */}
                  <div className="relative flex items-center space-x-4 md:space-x-6">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl 
                         bg-gradient-to-br ${action.gradient} text-white flex items-center justify-center 
                         shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {action.icon}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-[#118B50] mb-2 group-hover:text-[#0F7A43] transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 text-[#118B50] group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Hover indicator line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full 
                       transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  />
                </Link>
              </NotificationBadge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
