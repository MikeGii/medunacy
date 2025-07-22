"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminTools() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Only show for admin users
  if (user?.role !== "admin") {
    return null;
  }

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const baseUrl = `/${currentLocale}`;

  const adminActions = [
    {
      title: t("roles"),
      description: t("roles_description"),
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: `${baseUrl}/roles`,
      gradient: "from-yellow-500 to-amber-600",
      bgGradient: "from-yellow-500/10 to-amber-600/10",
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
            <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              {t("admin_tools")}
            </span>
          </h2>
        </div>

        {/* Admin Tool Buttons */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {adminActions.map((action, index) => (
            <div
              key={index}
              className={`transform transition-all duration-1000 ease-out h-full ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
                transitionDelay: `${index * 0.2}s`,
              }}
            >
              <Link
                href={action.href}
                className={`group relative bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 
  border border-white/50 hover:border-amber-500/50 
  shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 
  overflow-hidden h-full flex items-center`}
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 
             group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl`}
                />

                {/* Content */}
                <div className="relative flex items-center space-x-4 md:space-x-6 w-full">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl 
               bg-gradient-to-br ${action.gradient} text-white flex items-center justify-center 
               shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {action.icon}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 py-2">
                    <h3 className="text-xl md:text-2xl font-bold text-amber-700 mb-2 group-hover:text-amber-800 transition-colors duration-300">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300"
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
