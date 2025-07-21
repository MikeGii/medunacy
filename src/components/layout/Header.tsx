// src/components/layout/Header.tsx - Optimized version
"use client";

import React from "react"; // Add this import
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useCallback, useMemo } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAuth } from "@/contexts/AuthContext";
import DesktopUserMenu from "./header/DesktopUserMenu";
import MobileMenu from "./header/MobileMenu";
import NotificationBell from "../ui/NotificationBell";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { user, signOut } = useAuth();
  const { openLogin, openRegister } = useAuthModal();

  // Memoize locale calculation
  const currentLocale = useMemo(
    () => (pathname.startsWith("/ukr") ? "ukr" : "et"),
    [pathname]
  );

  const baseUrl = useMemo(() => `/${currentLocale}`, [currentLocale]);

  // Memoize callbacks to prevent unnecessary re-renders
  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen((prev) => !prev),
    []
  );

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    closeMobileMenu();
  }, [signOut, closeMobileMenu]);

  // Memoize user's first name
  const firstName = useMemo(
    () => user?.user_metadata?.first_name,
    [user?.user_metadata?.first_name]
  );

  // Memoize navigation link props
  const dashboardLinkProps = useMemo(
    () => ({
      href: pathname.includes("/dashboard") ? baseUrl : `${baseUrl}/dashboard`,
      icon: pathname.includes("/dashboard") ? "home" : "dashboard",
      label: pathname.includes("/dashboard") ? t("home") : t("dashboard"),
    }),
    [pathname, baseUrl, t]
  );

  return (
    <>
      {/* Header Component */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white to-[#FBF6E9] border-b-2 border-[#E3F0AF] shadow-lg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-4">
            {/* Logo - Optimized with priority loading */}
            <div className="flex-shrink-0">
              <Link href={baseUrl} className="group" prefetch={false}>
                <Image
                  src="/images/header_logo.png"
                  alt="Medunacy Logo"
                  width={240}
                  height={55}
                  className="h-16 w-auto cursor-pointer transition-transform group-hover:scale-105"
                  priority
                  quality={85}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notification Bell - Only for logged in users */}
              {user && <NotificationBell />}

              {/* Navigation Links for Logged In Users */}
              {user && (
                <div className="flex items-center space-x-4">
                  {/* Dynamic Dashboard/Home Link */}
                  <Link
                    href={dashboardLinkProps.href}
                    className="flex items-center space-x-2 px-4 py-2 text-[#118B50] hover:text-[#5DB996] 
                             bg-white/50 hover:bg-white/70 rounded-full transition-all duration-300 
                             border border-[#118B50]/20 hover:border-[#5DB996]/30"
                    prefetch={false}
                  >
                    <NavigationIcon type={dashboardLinkProps.icon} />
                    <span className="font-medium">
                      {dashboardLinkProps.label}
                    </span>
                  </Link>
                </div>
              )}

              {/* Auth Buttons or User Menu */}
              {user ? (
                <UserSection
                  firstName={firstName}
                  onToggleMenu={toggleMobileMenu}
                  isMobileMenuOpen={isMobileMenuOpen}
                  baseUrl={baseUrl}
                  onSignOut={handleSignOut}
                  onCloseMenu={closeMobileMenu}
                />
              ) : (
                <AuthButtons
                  onOpenLogin={openLogin}
                  onOpenRegister={openRegister}
                />
              )}
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation
              user={user}
              onToggleMenu={toggleMobileMenu}
              isMobileMenuOpen={isMobileMenuOpen}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        baseUrl={baseUrl}
        pathname={pathname}
        firstName={firstName}
        onClose={closeMobileMenu}
        onSignOut={handleSignOut}
      />
    </>
  );
}

// Separate memoized components to prevent re-renders

const NavigationIcon = ({ type }: { type: string }) => {
  if (type === "home") {
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2 2H5a2 2 0 00-2 2v6a2 2 0 002 2h2z"
      />
    </svg>
  );
};

const UserSection = React.memo(
  ({
    firstName,
    onToggleMenu,
    isMobileMenuOpen,
    baseUrl,
    onSignOut,
    onCloseMenu,
  }: {
    firstName: string | undefined;
    onToggleMenu: () => void;
    isMobileMenuOpen: boolean;
    baseUrl: string;
    onSignOut: () => void;
    onCloseMenu: () => void;
  }) => (
    <div className="flex items-center space-x-6">
      <span className="text-lg font-bold text-[#118B50]">
        {firstName || "User"}
      </span>
      <div className="relative">
        <button
          onClick={onToggleMenu}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
          aria-label="Toggle user menu"
        >
          <BurgerIcon isOpen={isMobileMenuOpen} />
        </button>

        {isMobileMenuOpen && (
          <DesktopUserMenu
            baseUrl={baseUrl}
            firstName={firstName}
            onSignOut={onSignOut}
            onClose={onCloseMenu}
          />
        )}
      </div>
    </div>
  )
);

UserSection.displayName = "UserSection";

const AuthButtons = React.memo(
  ({
    onOpenLogin,
    onOpenRegister,
  }: {
    onOpenLogin: () => void;
    onOpenRegister: () => void;
  }) => {
    const t = useTranslations("navigation");

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenLogin}
          className="px-4 py-2.5 text-[#118B50] bg-white hover:bg-[#FBF6E9] 
                   font-semibold rounded-full transition-all duration-300 ease-in-out
                   border-2 border-[#118B50] hover:border-[#5DB996]
                   shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {t("login")}
        </button>
        <button
          onClick={onOpenRegister}
          className="px-4 py-2.5 text-white bg-[#118B50] hover:bg-[#5DB996] 
                   font-semibold rounded-full transition-all duration-300 ease-in-out
                   border-2 border-[#118B50] hover:border-[#E3F0AF]
                   shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {t("register")}
        </button>
      </div>
    );
  }
);

AuthButtons.displayName = "AuthButtons";

const MobileNavigation = React.memo(
  ({
    user,
    onToggleMenu,
    isMobileMenuOpen,
  }: {
    user: any;
    onToggleMenu: () => void;
    isMobileMenuOpen: boolean;
  }) => (
    <div className="md:hidden flex items-center space-x-3">
      {user && <NotificationBell />}
      <LanguageSwitcher />
      <button
        onClick={onToggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
        aria-label="Toggle menu"
      >
        <BurgerIcon isOpen={isMobileMenuOpen} />
      </button>
    </div>
  )
);

MobileNavigation.displayName = "MobileNavigation";

const BurgerIcon = React.memo(({ isOpen }: { isOpen: boolean }) => (
  <div className="flex flex-col justify-center items-center w-6 h-6">
    <span
      className={`block w-5 h-0.5 bg-[#118B50] transition-all duration-300 ${
        isOpen ? "rotate-45 translate-y-1" : ""
      }`}
    />
    <span
      className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
        isOpen ? "opacity-0" : ""
      }`}
    />
    <span
      className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
        isOpen ? "-rotate-45 -translate-y-1" : ""
      }`}
    />
  </div>
));

BurgerIcon.displayName = "BurgerIcon";
