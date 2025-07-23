// src/components/ui/DashboardActionButton.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import NotificationBadge from "./NotificationBadge";

interface DashboardActionButtonProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  showNotification?: boolean;
  colorScheme?: "green" | "amber" | "blue";
}

export default function DashboardActionButton({
  href,
  title,
  description,
  icon,
  gradient,
  bgGradient,
  showNotification = false,
  colorScheme = "green",
}: DashboardActionButtonProps) {
  const [isTouched, setIsTouched] = useState(false);

  // Color schemes for hover effects
  const colorSchemes = {
    green: "hover:text-[#118B50] hover:border-[#5DB996]/50",
    amber: "hover:text-amber-700 hover:border-amber-500/50",
    blue: "hover:text-blue-700 hover:border-blue-500/50",
  };

  return (
    <NotificationBadge showBadge={showNotification}>
      <Link href={href} className="group block h-full">
        <div
          className={`relative h-full bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 
                     ${colorSchemes[colorScheme]} hover:shadow-lg transition-all duration-300 
                     overflow-hidden transform hover:-translate-y-1`}
          onTouchStart={() => setIsTouched(true)}
          onTouchEnd={() => setTimeout(() => setIsTouched(false), 2000)}
        >
          {/* Hover gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 
                       group-hover:opacity-100 transition-opacity duration-500`}
          />

          {/* Content */}
          <div className="relative p-5 md:p-6">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl 
                           bg-gradient-to-br ${gradient} text-white 
                           flex items-center justify-center shadow-lg 
                           group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="w-7 h-7 md:w-8 md:h-8">{icon}</div>
              </div>

              {/* Title and Arrow */}
              <div className="flex-1 flex items-center justify-between">
                <h3
                  className="text-lg md:text-xl font-semibold text-gray-900 
                              group-hover:text-[#118B50] transition-colors duration-300"
                >
                  {title}
                </h3>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 ml-3">
                  <div
                    className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#118B50] 
                                flex items-center justify-center transition-all duration-300"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-white 
                                transform group-hover:translate-x-0.5 transition-all duration-300"
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
            </div>

            {/* Description - Only visible on hover/touch */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isTouched
                  ? "md:grid-rows-[1fr]"
                  : "md:group-hover:grid-rows-[1fr] grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-gray-600 leading-relaxed mt-3 pr-2">
                  {description}
                </p>
              </div>
            </div>

            {/* Mobile hint text */}
            <div className="md:hidden mt-2 flex items-center gap-1">
              <span className="text-xs text-gray-400">Tap for details</span>
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Tooltip for desktop - Alternative approach */}
          <div
            className="hidden md:block absolute inset-x-0 -bottom-2 translate-y-full 
                         opacity-0 group-hover:opacity-100 pointer-events-none 
                         transition-all duration-300 z-10 px-4"
          >
            <div
              className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 
                           shadow-lg relative"
            >
              <div
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                             w-2 h-2 bg-gray-900 rotate-45"
              ></div>
              {description}
            </div>
          </div>
        </div>
      </Link>
    </NotificationBadge>
  );
}
