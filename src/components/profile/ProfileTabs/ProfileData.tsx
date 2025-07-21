// src/components/profile/ProfileTabs/ProfileData.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter, usePathname } from "next/navigation";

export default function ProfileData() {
  const t = useTranslations("profile.personal");
  const { personalData, loading, updatePersonalData } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    language: "et",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load data into form when personalData is available
  useEffect(() => {
    if (personalData && !loading) {
      setFormData(personalData);
    }
  }, [personalData, loading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({ type: "error", text: t("messages.name_required") });
      return;
    }

    const languageChanged = personalData?.language !== formData.language;
    const newLanguage = formData.language;

    setIsSubmitting(true);

    const success = await updatePersonalData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      language: formData.language,
    });

    if (success) {
      setMessage({ type: "success", text: t("messages.save_success") });

      // If language changed, redirect to new language
      if (languageChanged) {
        const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

        if (newLanguage !== currentLocale) {
          const pathWithoutLocale = pathname.replace(/^\/(et|ukr)/, "") || "/";
          const newPath = `/${newLanguage}${pathWithoutLocale}`;

          // Show success message briefly, then redirect
          setTimeout(() => {
            router.push(newPath);
          }, 1000); // Give user time to see the success message
        }
      }
    } else {
      setMessage({ type: "error", text: t("messages.save_error") });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">{t("messages.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#118B50] mb-2">
          {t("title")}
        </h2>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === "success" ? (
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            )}
            <span>{message.text}</span>
            {message.type === "success" &&
              personalData?.language !== formData.language && (
                <span className="text-sm opacity-75">
                  {currentLocale === "ukr"
                    ? " - Перенаправлення..."
                    : " - Suunan ümber..."}
                </span>
              )}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("form.first_name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
              placeholder={t("placeholders.first_name")}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("form.last_name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
              placeholder={t("placeholders.last_name")}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("form.email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all bg-gray-100"
            placeholder={t("placeholders.email")}
            disabled
          />
          <p className="mt-1 text-sm text-gray-500">{t("form.email_note")}</p>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("form.phone")}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("placeholders.phone")}
          />
        </div>

        {/* Language Preference */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("form.language")} <span className="text-red-500">*</span>
          </label>
          <select
            id="language"
            name="language"
            value={formData.language || "et"}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
          >
            <option value="et">Eesti keel</option>
            <option value="ukr">Українська</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {t("form.language_note")}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white font-semibold rounded-lg hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("form.saving") : t("form.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
