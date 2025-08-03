// src/components/layout/header/DesktopUserMenu.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

interface DesktopUserMenuProps {
  baseUrl: string;
  firstName: string | undefined;
  onSignOut: () => void;
  onClose: () => void;
}

export default function DesktopUserMenu({
  baseUrl,
  firstName,
  onSignOut,
  onClose,
}: DesktopUserMenuProps) {
  const t = useTranslations("navigation");
  const dashboardT = useTranslations("dashboard");
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  if (!user) return null;

  return (
    <>
      {/* Invisible overlay for click-outside */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

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
                  {user?.role === "admin"
                    ? t("admin")
                    : user?.role === "doctor"
                    ? t("doctor")
                    : t("member")}
                  {isPremium && " - Premium"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Quick Actions Section */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {dashboardT("quick_actions")}
              </p>
            </div>

            {/* Forum Link */}
            <Link
              href={`${baseUrl}/forum`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="w-5 h-5 text-[#118B50] group-hover:text-[#5DB996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="w-5 h-5 text-[#118B50] group-hover:text-[#5DB996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Exam Tests Link */}
            <Link
              href={`${baseUrl}/exam-tests`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="w-5 h-5 text-[#118B50] group-hover:text-[#5DB996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#118B50]">
                {dashboardT("exam_tests")}
              </span>
            </Link>

            {/* Courses Link */}
            <Link
              href={`${baseUrl}/courses`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="w-5 h-5 text-[#118B50] group-hover:text-[#5DB996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#118B50]">
                {dashboardT("courses")}
              </span>
            </Link>

            {/* Premium Link */}
            <Link
              href={`${baseUrl}/premium`}
              onClick={onClose}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-yellow-50 transition-colors duration-200 group"
            >
              <div className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-600">
                {t("premium")}
              </span>
            </Link>

            {/* Healthcare Tools Section - for doctors and admins */}
            {(user.role === "doctor" || user.role === "admin") && (
              <>
                <div className="border-t border-gray-100 mt-2">
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-[#5DB996] uppercase tracking-wide">
                      {dashboardT("healthcare_tools")}
                    </p>
                  </div>
                  <Link
                    href={`${baseUrl}/users`}
                    onClick={onClose}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-200 group"
                  >
                    <div className="w-5 h-5 text-[#5DB996] group-hover:text-[#118B50]">
                      <svg
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
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#5DB996]">
                      {dashboardT("users")}
                    </span>
                  </Link>
                  <Link
                    href={`${baseUrl}/exam-tests/create`}
                    onClick={onClose}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-200 group"
                  >
                    <div className="w-5 h-5 text-[#118B50] group-hover:text-[#0F7A42]">
                      <svg
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
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#118B50]">
                      {dashboardT("test_creation")}
                    </span>
                  </Link>

                  {/* Exam Results Link */}
                  <Link
                    href={`${baseUrl}/exam-results`}
                    onClick={onClose}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700">
                      <svg
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
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">
                      {dashboardT("exam_results")}
                    </span>
                  </Link>

                  {/* Courses Panel Link */}
                  <Link
                    href={`${baseUrl}/courses-panel`}
                    onClick={onClose}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700">
                      <svg
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
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">
                      {dashboardT("courses_panel")}
                    </span>
                  </Link>
                </div>
              </>
            )}

            {/* Admin Tools Section - for admins only */}
            {user.role === "admin" && (
              <>
                <div className="border-t border-gray-100 mt-2">
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                      {dashboardT("admin_tools")}
                    </p>
                  </div>

                  <Link
                    href={`${baseUrl}/roles`}
                    onClick={onClose}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors duration-200 group"
                  >
                    <div className="w-5 h-5 text-amber-600 group-hover:text-amber-700">
                      <svg
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
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">
                      {dashboardT("roles")}
                    </span>
                  </Link>
                </div>
              </>
            )}

            <div className="border-t border-gray-100 mt-2"></div>

            {/* Sign Out Button */}
            <button
              onClick={async () => {
                onClose(); // Close menu first
                await onSignOut(); // Wait for signout to complete
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 group"
            >
              <div className="w-5 h-5 text-red-500 group-hover:text-red-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
