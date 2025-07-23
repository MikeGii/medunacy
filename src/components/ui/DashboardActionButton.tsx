// src/components/ui/DashboardActionButton.tsx
"use client";

import Link from "next/link";
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
  // Color schemes for hover effects
  const colorSchemes = {
    green: "hover:text-[#118B50] hover:border-[#5DB996]/50",
    amber: "hover:text-amber-700 hover:border-amber-500/50",
    blue: "hover:text-blue-700 hover:border-blue-500/50",
  };

  return (
    <NotificationBadge showBadge={showNotification}>
      <Link href={href} className="group block">
        <div
          className={`relative bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 
                     ${colorSchemes[colorScheme]} hover:shadow-lg transition-all duration-300 
                     overflow-hidden transform hover:-translate-y-1 h-full`}
        >
          {/* Hover gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 
                       group-hover:opacity-100 transition-opacity duration-500`}
          />

          {/* Content */}
          <div className="relative p-4 md:p-5 h-full flex flex-col">
            {/* Icon and Title Row */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl 
                           bg-gradient-to-br ${gradient} text-white 
                           flex items-center justify-center shadow-md 
                           group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="w-6 h-6 md:w-7 md:h-7">{icon}</div>
              </div>

              {/* Title */}
              <div className="flex-1">
                <h3
                  className="text-base md:text-lg font-semibold text-gray-900 
                              group-hover:text-[#118B50] transition-colors duration-300"
                >
                  {title}
                </h3>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <div
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 group-hover:bg-[#118B50] 
                              flex items-center justify-center transition-all duration-300"
                >
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 group-hover:text-white 
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

            {/* Description - Desktop only, shown on hover */}
            <div className="hidden md:block mt-3 overflow-hidden">
              <p
                className={`text-sm text-gray-600 leading-relaxed transition-all duration-300
                            opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20`}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </NotificationBadge>
  );
}
