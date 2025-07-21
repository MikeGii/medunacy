// src/components/profile/ProfileTabs/ProfileData.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfileData() {
  const t = useTranslations("profile.personal");
  const { personalData, loading, updatePersonalData } = useUserProfile();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load data into form when personalData is available
  useEffect(() => {
    if (personalData) {
      setFormData(personalData);
    }
  }, [personalData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsSubmitting(true);

    const success = await updatePersonalData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    });

    if (success) {
      setMessage({ type: "success", text: t("messages.save_success") });
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
          {message.text}
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