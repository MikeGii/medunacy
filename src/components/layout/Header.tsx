// src/components/layout/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const dashboardT = useTranslations("dashboard");
  const { user, signOut } = useAuth();
  const { openLogin, openRegister } = useAuthModal();

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const baseUrl = `/${currentLocale}`;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMobileMenu();
  };

  // Get user's first name for display
  const firstName = user?.user_metadata?.first_name;

  return (
    <>
      {/* Header Component */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-white to-[#FBF6E9] border-b-2 border-[#E3F0AF] shadow-lg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href={baseUrl} className="group">
                <Image
                  src="/images/header_logo.png"
                  alt="Medunacy Logo"
                  width={240}
                  height={55}
                  className="h-16 w-auto cursor-pointer transition-transform group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Navigation Links for Logged In Users */}
              {user && (
                <div className="flex items-center space-x-4">
                  {/* Dynamic Dashboard/Home Link */}
                  {pathname.includes("/dashboard") ? (
                    <Link
                      href={baseUrl}
                      className="flex items-center space-x-2 px-4 py-2 text-[#118B50] hover:text-[#5DB996] 
                     bg-white/50 hover:bg-white/70 rounded-full transition-all duration-300 
                     border border-[#118B50]/20 hover:border-[#5DB996]/30"
                    >
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
                      <span className="font-medium">{t("home")}</span>
                    </Link>
                  ) : (
                    <Link
                      href={`${baseUrl}/dashboard`}
                      className="flex items-center space-x-2 px-4 py-2 text-[#118B50] hover:text-[#5DB996] 
                     bg-white/50 hover:bg-white/70 rounded-full transition-all duration-300 
                     border border-[#118B50]/20 hover:border-[#5DB996]/30"
                    >
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
                      <span className="font-medium">{t("dashboard")}</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Auth Buttons or User Menu */}
              {user ? (
                <div className="flex items-center space-x-6">
                  <span className="text-lg font-bold text-[#118B50]">
                    {firstName || user.email}
                  </span>
                  {/* Desktop Burger Menu Button */}
                  <div className="relative">
                    <button
                      onClick={toggleMobileMenu}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
                      aria-label="Toggle user menu"
                    >
                      <div className="flex flex-col justify-center items-center w-6 h-6">
                        <span
                          className={`block w-5 h-0.5 bg-[#118B50] transition-all duration-300 ${
                            isMobileMenuOpen ? "rotate-45 translate-y-1" : ""
                          }`}
                        />
                        <span
                          className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
                            isMobileMenuOpen ? "opacity-0" : ""
                          }`}
                        />
                        <span
                          className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
                            isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Desktop Dropdown Menu - positioned relative to button */}
                    {isMobileMenuOpen && (
                      <>
                        {/* Invisible overlay for click-outside */}
                        <div
                          className="fixed inset-0 z-30"
                          onClick={closeMobileMenu}
                        />

                        {/* Dropdown Menu */}
                        <div className="absolute top-12 right-0 w-64 z-40">
                          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                            {/* User Info Header */}
                            <div className="bg-gradient-to-r from-[#118B50] to-[#5DB996] px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {firstName?.charAt(0).toUpperCase() ||
                                      user?.email?.charAt(0).toUpperCase() ||
                                      "U"}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {firstName || user?.email}
                                  </p>
                                  <p className="text-xs text-green-100">
                                    {t("member")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                              {/* ADD: Dashboard Quick Actions for desktop dropdown */}
                              {pathname.includes("/dashboard") && (
                                <>
                                  <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      {dashboardT("quick_actions")}
                                    </p>
                                  </div>

                                  {/* Forum Link */}
                                  <Link
                                    href={`${baseUrl}/forum`}
                                    onClick={closeMobileMenu}
                                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
                                  >
                                    <div className="w-5 h-5 text-[#118B50] group-hover:text-[#5DB996]">
                                      <svg
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
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#118B50]">
                                      {dashboardT("forum")}
                                    </span>
                                  </Link>

                                  {/* Profile Link */}
                                  <Link
                                    href={`${baseUrl}/profile`}
                                    onClick={closeMobileMenu}
                                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
                                  >
                                    <div className="w-5 h-5 text-[#118B50] group-hover:text-[#5DB996]">
                                      <svg
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
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#118B50]">
                                      {dashboardT("my_data")}
                                    </span>
                                  </Link>

                                  <div className="border-t border-gray-100"></div>
                                </>
                              )}

                              {/* Sign Out Button - existing code */}
                              <button
                                onClick={() => {
                                  handleSignOut();
                                  closeMobileMenu();
                                }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 group"
                              >
                                <div className="w-5 h-5 text-red-500 group-hover:text-red-600">
                                  <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                                  {t("sign_out")}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openLogin}
                    className="px-4 py-2.5 text-[#118B50] bg-white hover:bg-[#FBF6E9] 
             font-semibold rounded-full transition-all duration-300 ease-in-out
             border-2 border-[#118B50] hover:border-[#5DB996]
             shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {t("login")}
                  </button>
                  <button
                    onClick={openRegister}
                    className="px-4 py-2.5 text-white bg-[#118B50] hover:bg-[#5DB996] 
             font-semibold rounded-full transition-all duration-300 ease-in-out
             border-2 border-[#118B50] hover:border-[#E3F0AF]
             shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {t("register")}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Language Switcher - Always visible on mobile */}
              <LanguageSwitcher />

              {/* Mobile Burger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <div className="flex flex-col justify-center items-center w-6 h-6">
                  <span
                    className={`block w-5 h-0.5 bg-[#118B50] transition-all duration-300 ${
                      isMobileMenuOpen ? "rotate-45 translate-y-1" : ""
                    }`}
                  />
                  <span
                    className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
                      isMobileMenuOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`block w-5 h-0.5 bg-[#118B50] mt-1 transition-all duration-300 ${
                      isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - OUTSIDE the header, covers full viewport */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gradient-to-b from-[#FBF6E9] to-white">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
            >
              <span className="text-[#118B50] text-xl font-bold">×</span>
            </button>
          </div>

          {/* Menu Content */}
          <div className="px-6 py-8 space-y-6">
            {/* User name for logged-in users */}
            {user && (
              <div className="text-center border-b border-gray-100 pb-4">
                <p className="text-lg font-bold text-[#118B50]">
                  {firstName || user.email}
                </p>
              </div>
            )}

            {/* Navigation Links for Logged In Users */}
            {user && (
              <div className="space-y-3">
                {pathname.includes("/dashboard") ? (
                  <Link
                    href={baseUrl}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 w-full px-6 py-3 text-[#118B50] hover:text-[#5DB996] 
                             bg-white/50 hover:bg-white/70 rounded-full transition-all duration-300 
                             border border-[#118B50]/20 hover:border-[#5DB996]/30"
                  >
                    <svg
                      className="w-5 h-5"
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
                    <span className="font-medium">{t("home")}</span>
                  </Link>
                ) : (
                  <Link
                    href={`${baseUrl}/dashboard`}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 w-full px-6 py-3 text-[#118B50] hover:text-[#5DB996] 
                             bg-white/50 hover:bg-white/70 rounded-full transition-all duration-300 
                             border border-[#118B50]/20 hover:border-[#5DB996]/30"
                  >
                    <svg
                      className="w-5 h-5"
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
                    <span className="font-medium">{t("dashboard")}</span>
                  </Link>
                )}
              </div>
            )}

            {/* ADD: Dashboard Quick Actions for logged in users */}
            {user && pathname.includes("/dashboard") && (
              <div className="space-y-3">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {dashboardT("quick_actions")}
                  </p>
                </div>

                {/* Forum Link */}
                <Link
                  href={`${baseUrl}/forum`}
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 w-full px-6 py-3 text-[#118B50] hover:text-[#5DB996] 
                       bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 
                       border border-[#118B50]/10 hover:border-[#5DB996]/20"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span className="font-medium">{dashboardT("forum")}</span>
                </Link>

                {/* Profile Link */}
                <Link
                  href={`${baseUrl}/profile`}
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 w-full px-6 py-3 text-[#118B50] hover:text-[#5DB996] 
                       bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 
                       border border-[#118B50]/10 hover:border-[#5DB996]/20"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span className="font-medium">{dashboardT("my_data")}</span>
                </Link>
              </div>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMobileMenu();
                  }}
                  className="block w-full px-6 py-3 text-center text-[#118B50] bg-white hover:bg-[#FBF6E9] 
                           font-semibold rounded-full transition-all duration-300 ease-in-out 
                           border-2 border-[#118B50] hover:border-[#5DB996] shadow-md hover:shadow-lg"
                >
                  {t("sign_out")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    openLogin();
                    closeMobileMenu();
                  }}
                  className="block w-full px-6 py-3 text-center text-[#118B50] bg-white hover:bg-[#FBF6E9] 
                           font-semibold rounded-full transition-all duration-300 ease-in-out 
                           border-2 border-[#118B50] hover:border-[#5DB996] shadow-md hover:shadow-lg"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => {
                    openRegister();
                    closeMobileMenu();
                  }}
                  className="block w-full px-6 py-3 text-center text-white bg-[#118B50] 
                           hover:bg-[#5DB996] font-semibold rounded-full transition-all 
                           duration-300 ease-in-out border-2 border-[#118B50] 
                           hover:border-[#E3F0AF] shadow-md hover:shadow-lg"
                >
                  {t("register")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
