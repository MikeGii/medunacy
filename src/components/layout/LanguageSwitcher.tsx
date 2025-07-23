// src/components/layout/LanguageSwitcher.tsx
"use client";

import React, { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface LanguageSwitcherProps {
  onLanguageChange?: () => void;
  preventClose?: boolean;
}

const LanguageSwitcher = React.memo(function LanguageSwitcher({
  onLanguageChange,
  preventClose = false,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoize current locale extraction
  const currentLocale = useMemo(
    () => (pathname.startsWith("/ukr") ? "ukr" : "et"),
    [pathname]
  );

  // Memoize the path without locale
  const pathWithoutLocale = useMemo(
    () => pathname.replace(/^\/(et|ukr)/, "") || "/",
    [pathname]
  );

  // Prefetch the other locale route
  React.useEffect(() => {
    const otherLocale = currentLocale === "et" ? "ukr" : "et";
    const prefetchPath = `/${otherLocale}${pathWithoutLocale}`;
    router.prefetch(prefetchPath);
  }, [currentLocale, pathWithoutLocale, router]);

  // Optimize language switch handler
  const switchLanguage = useCallback(
    (newLocale: string) => {
      // Skip if switching to same language or already transitioning
      if (newLocale === currentLocale || isTransitioning) return;

      setIsTransitioning(true);

      // Construct new path
      const newPath = `/${newLocale}${pathWithoutLocale}`;

      // Store transition state with more data
      if (typeof window !== "undefined") {
        const transitionData = {
          fromLocale: currentLocale,
          toLocale: newLocale,
          timestamp: Date.now(),
          isAuthenticated: !!user,
          userId: user?.id,
        };

        sessionStorage.setItem(
          "medunacy_lang_transition",
          JSON.stringify(transitionData)
        );
      }

      // Use startTransition for smoother updates
      startTransition(() => {
        router.replace(newPath, { scroll: false });
      });

      // Handle callback only if needed
      if (onLanguageChange && !preventClose) {
        onLanguageChange();
      }

      // Reset transition state after navigation completes
      // Increased timeout to ensure smooth transition
      setTimeout(() => {
        setIsTransitioning(false);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("medunacy_lang_transition");
        }
      }, 500);
    },
    [
      currentLocale,
      pathWithoutLocale,
      router,
      onLanguageChange,
      preventClose,
      user,
      isTransitioning,
    ]
  );

  const buttons = useMemo(
    () => [
      { locale: "et", label: "EST" },
      { locale: "ukr", label: "УКР" },
    ],
    []
  );

  return (
    <div className="flex items-center space-x-1 bg-[#E3F0AF] rounded-full p-1">
      {buttons.map(({ locale, label }) => (
        <LanguageButton
          key={locale}
          locale={locale}
          label={label}
          isActive={currentLocale === locale}
          isDisabled={isTransitioning || isPending}
          onSwitch={switchLanguage}
        />
      ))}
    </div>
  );
});

// Enhanced LanguageButton component
const LanguageButton = React.memo(function LanguageButton({
  locale,
  label,
  isActive,
  isDisabled,
  onSwitch,
}: {
  locale: string;
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onSwitch: (locale: string) => void;
}) {
  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onSwitch(locale);
    }
  }, [locale, onSwitch, isDisabled]);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${
        isActive
          ? "bg-[#118B50] text-white shadow-sm"
          : isDisabled
          ? "text-gray-400 cursor-not-allowed"
          : "text-[#118B50] hover:bg-[#5DB996] hover:text-white"
      }`}
      aria-label={`Switch to ${label}`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
});

export default LanguageSwitcher;
