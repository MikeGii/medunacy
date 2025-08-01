// src/components/layout/header/MobileMenu.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useSubscription } from "@/hooks/useSubscription";

interface MobileMenuProps {
  isOpen: boolean;
  baseUrl: string;
  pathname: string;
  firstName: string | undefined;
  onClose: () => void;
  onSignOut: () => void;
}

export default function MobileMenu({
  isOpen,
  baseUrl,
  pathname,
  firstName,
  onClose,
  onSignOut,
}: MobileMenuProps) {
  const t = useTranslations("navigation");
  const dashboardT = useTranslations("dashboard");
  const { user } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const { isPremium } = useSubscription();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-gradient-to-b from-[#FBF6E9] to-white">
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E3F0AF] hover:bg-[#5DB996] transition-colors duration-200"
        >
          <span className="text-[#118B50] text-xl font-bold">×</span>
        </button>
      </div>

      {/* Menu Content */}
      <div className="px-6 py-8 space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto">
        {/* User name for logged-in users */}
        {user && (
          <div className="text-center border-b border-gray-100 pb-4">
            <p className="text-lg font-bold text-[#118B50]">
              {firstName || user.email}
              {(user.role === "admin" || user.role === "doctor") && (
                <span className="text-sm font-normal text-[#5DB996]">
                  {user.role === "admin" ? " - Admin" : " - Arst"}
                </span>
              )}
              {isPremium && (
                <span className="text-sm font-normal text-yellow-500">
                  {" - Premium"}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Navigation Links for Logged In Users */}
        {user && (
          <div className="space-y-3">
            {pathname.includes("/dashboard") ? (
              <Link
                href={baseUrl}
                onClick={onClose}
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
                onClick={onClose}
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

        {/* Quick Actions for ALL users */}
        {user && (
          <div className="space-y-3">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-[#118B50] uppercase tracking-wide">
                {dashboardT("quick_actions")}
              </p>
            </div>

            {/* Forum Link */}
            <Link
              href={`${baseUrl}/forum`}
              onClick={onClose}
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
              onClick={onClose}
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

            {/* Exam Tests Link */}
            <Link
              href={`${baseUrl}/exam-tests`}
              onClick={onClose}
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span className="font-medium">{dashboardT("exam_tests")}</span>
            </Link>

            <Link
              href={`${baseUrl}/courses`}
              onClick={onClose}
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="font-medium">{dashboardT("courses")}</span>
            </Link>
          </div>
        )}

        {/* Healthcare Tools - for doctors and admins */}
        {user && (user.role === "doctor" || user.role === "admin") && (
          <div className="space-y-3">
            <div className="px-3 py-2 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-[#5DB996] uppercase tracking-wide">
                {dashboardT("healthcare_tools")}
              </p>
            </div>

            {/* Users Link */}
            <Link
              href={`${baseUrl}/users`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-6 py-3 text-[#5DB996] hover:text-[#118B50] 
               bg-gradient-to-r from-[#E3F0AF]/20 to-[#118B50]/20 hover:from-[#E3F0AF]/30 hover:to-[#118B50]/30 
               rounded-full transition-all duration-300 border border-[#5DB996]/20"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium">{dashboardT("users")}</span>
            </Link>

            {/* Test Creation Link */}
            <Link
              href={`${baseUrl}/exam-tests/create`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-6 py-3 text-[#5DB996] hover:text-[#118B50] 
   bg-gradient-to-r from-[#E3F0AF]/20 to-[#118B50]/20 hover:from-[#E3F0AF]/30 hover:to-[#118B50]/30 
   rounded-full transition-all duration-300 border border-[#5DB996]/20"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">{dashboardT("test_creation")}</span>
            </Link>

            {/* Exam Results Link */}
            <Link
              href={`${baseUrl}/exam-results`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-6 py-3 text-[#5DB996] hover:text-[#118B50] 
   bg-gradient-to-r from-[#E3F0AF]/20 to-[#118B50]/20 hover:from-[#E3F0AF]/30 hover:to-[#118B50]/30 
   rounded-full transition-all duration-300 border border-[#5DB996]/20"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{dashboardT("exam_results")}</span>
            </Link>

            {/* Courses Panel Link */}
            <Link
              href={`${baseUrl}/courses-panel`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-6 py-3 text-[#5DB996] hover:text-[#118B50] 
   bg-gradient-to-r from-[#E3F0AF]/20 to-[#118B50]/20 hover:from-[#E3F0AF]/30 hover:to-[#118B50]/30 
   rounded-full transition-all duration-300 border border-[#5DB996]/20"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="font-medium">{dashboardT("courses_panel")}</span>
            </Link>
          </div>
        )}

        {/* Admin Tools - for admins only */}
        {user && user.role === "admin" && (
          <div className="space-y-3">
            <div className="px-3 py-2 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-amber-600 uppercase tracking-wide">
                {dashboardT("admin_tools")}
              </p>
            </div>

            {/* Roles Link */}
            <Link
              href={`${baseUrl}/roles`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-6 py-3 text-amber-700 hover:text-amber-800 
               bg-gradient-to-r from-yellow-500/20 to-amber-600/20 hover:from-yellow-500/30 hover:to-amber-600/30 
               rounded-full transition-all duration-300 border border-amber-500/20"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium">{dashboardT("roles")}</span>
            </Link>
          </div>
        )}

        {/* Auth Buttons */}
        {user ? (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <button
              onClick={async () => {
                onClose(); // Close menu first
                await onSignOut(); // Wait for signout to complete
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
                onClose();
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
                onClose();
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
  );
}
