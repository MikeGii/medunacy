"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import type { UserData as UserProfileData } from "@/types/userdata";

interface UserData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

interface UserDetailsModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const t = useTranslations("users.modal");
  const tProfile = useTranslations("profile.form");
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  // Define fetchUserProfileData BEFORE the useEffect that uses it
  const fetchUserProfileData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("user_id", user.user_id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
      }

      setProfileData(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Now useEffect can reference fetchUserProfileData
  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfileData();
    }
  }, [isOpen, user, fetchUserProfileData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="relative bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#118B50] to-[#5DB996] p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("title")}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#118B50] mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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
                {t("personal_info")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {tProfile("first_name")}
                  </p>
                  <p className="font-medium text-gray-800">
                    {user.first_name || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {tProfile("last_name")}
                  </p>
                  <p className="font-medium text-gray-800">
                    {user.last_name || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {tProfile("email")}
                  </p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {tProfile("phone")}
                  </p>
                  <p className="font-medium text-gray-800">
                    {user.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : profileData ? (
              <div>
                <h3 className="text-lg font-semibold text-[#118B50] mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {t("professional_info")}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {tProfile("university")}
                    </p>
                    <p className="font-medium text-gray-800">
                      {profileData.university || "-"}
                      {profileData.university_finished && (
                        <span className="ml-2 text-sm text-green-600">
                          ({tProfile("university_finished")})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {tProfile("specialization")}
                    </p>
                    <p className="font-medium text-gray-800">
                      {profileData.specialization || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {tProfile("workplace")}
                    </p>
                    <p className="font-medium text-gray-800">
                      {profileData.workplace || "-"}
                    </p>
                  </div>
                  {profileData.languages &&
                    profileData.languages.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          {tProfile("languages")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profileData.languages.map((lang, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E3F0AF] text-[#118B50]"
                            >
                              {lang.language} ({lang.level})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {profileData.personal_description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {tProfile("personal_description")}
                      </p>
                      <p className="font-medium text-gray-800 whitespace-pre-wrap">
                        {profileData.personal_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
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
                <p>{t("professional_info")} - No data available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white font-medium rounded-lg hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
