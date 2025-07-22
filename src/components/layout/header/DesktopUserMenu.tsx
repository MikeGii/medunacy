// src/components/layout/header/DesktopUserMenu.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

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
                    href={`${baseUrl}/test-creation`}
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
