// src/components/layout/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthModal from "../auth/AuthModal";
import LoginModal from "../auth/LoginModal";
import RegisterModal from "../auth/RegisterModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { user, signOut } = useAuth();
  const {
    isOpen,
    currentModal,
    openLogin,
    openRegister,
    switchToLogin,
    switchToRegister,
    close,
  } = useAuthModal();

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

            {/* Mobile Burger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200 z-50"
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
      </header>

      {/* Mobile Menu for all users */}
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

            {/* Language Switcher */}
            <div className="flex justify-center">
              <LanguageSwitcher preventClose={true} />
            </div>

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

      {/* Authentication Modals */}
      <AuthModal isOpen={isOpen} onClose={close}>
        {currentModal === "login" ? (
          <LoginModal onSwitchToRegister={switchToRegister} onClose={close} />
        ) : (
          <RegisterModal onSwitchToLogin={switchToLogin} onClose={close} />
        )}
      </AuthModal>
    </>
  );
}
