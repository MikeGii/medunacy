"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
  const t = useTranslations("navigation");
  const { user, signOut } = useAuth();

  const firstName = user?.user_metadata?.first_name;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#FBF6E9] to-white shadow-2xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-[#E3F0AF]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#118B50] rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <div>
              <p className="text-sm font-bold text-[#118B50]">
                {firstName || user?.email}
              </p>
              <p className="text-xs text-gray-500">Medunacy Member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menu Content - Only Sign Out Button */}
        <div className="px-6 py-8 space-y-6">
          {/* User name display for mobile */}
          <div className="text-center border-b border-gray-100 pb-4">
            <p className="text-lg font-bold text-[#118B50]">
              {firstName || user?.email}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-300"
          >
            <svg
              className="w-5 h-5 text-red-600"
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
            <span className="text-red-700 font-semibold">{t("sign_out")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
