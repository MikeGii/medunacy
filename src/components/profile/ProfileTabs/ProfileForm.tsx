// src/components/profile/ProfileTabs/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { UserDataUpdate } from "@/types/userdata";

const AVAILABLE_LANGUAGES = [
  "Eesti keel / Естонська",
  "English / Англійська",
  "Русский / Російська",
  "Українська / Українська",
  "Deutsch / Німецька",
  "Français / Французька",
  "Español / Іспанська",
  "Suomi / Фінська",
];

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ProfileForm() {
  const t = useTranslations("profile.form");
  const tMessages = useTranslations("profile.messages");
  const { professionalData, loading, updateProfessionalData } = useUserProfile();

  const [formData, setFormData] = useState<UserDataUpdate>({
    university: "",
    university_finished: false,
    specialization: "",
    workplace: "",
    languages: [],
    personal_description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load existing data into form
  useEffect(() => {
    if (professionalData) {
      setFormData({
        university: professionalData.university || "",
        university_finished: professionalData.university_finished || false,
        specialization: professionalData.specialization || "",
        workplace: professionalData.workplace || "",
        languages: professionalData.languages || [],
        personal_description: professionalData.personal_description || "",
      });
    }
  }, [professionalData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLanguageToggle = (languageName: string) => {
    setFormData((prev) => {
      const currentLanguages = prev.languages || [];
      const existingLanguage = currentLanguages.find(
        (lang) => lang.language === languageName
      );

      if (existingLanguage) {
        return {
          ...prev,
          languages: currentLanguages.filter(
            (lang) => lang.language !== languageName
          ),
        };
      } else {
        return {
          ...prev,
          languages: [
            ...currentLanguages,
            { language: languageName, level: "A1" },
          ],
        };
      }
    });
  };

  const handleLanguageLevelChange = (
    languageName: string,
    newLevel: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      languages: (prev.languages || []).map((lang) =>
        lang.language === languageName ? { ...lang, level: newLevel } : lang
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Validation for required fields
    if (!formData.university || formData.university.trim() === '') {
      setMessage({ type: "error", text: tMessages("university_required") });
      return;
    }
    
    if (!formData.specialization || formData.specialization.trim() === '') {
      setMessage({ type: "error", text: tMessages("specialization_required") });
      return;
    }
    
    if (!formData.languages || formData.languages.length === 0) {
      setMessage({ type: "error", text: tMessages("languages_required") });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await updateProfessionalData({
        user_id: "", // This will be filled by the hook
        university: formData.university || "",
        university_finished: formData.university_finished || false,
        specialization: formData.specialization || "",
        workplace: formData.workplace || "",
        languages: formData.languages || [],
        personal_description: formData.personal_description || "",
      });

      if (success) {
        setMessage({ type: "success", text: tMessages("save_success") });
      } else {
        setMessage({ type: "error", text: tMessages("save_error") });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : tMessages("save_error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">{tMessages("loading")}</p>
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
        {/* University */}
        <div>
          <label
            htmlFor="university"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("university")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="university"
            name="university"
            value={formData.university || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("university_placeholder")}
          />
        </div>

        {/* University Finished Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="university_finished"
            name="university_finished"
            checked={formData.university_finished || false}
            onChange={handleInputChange}
            className="w-4 h-4 text-[#118B50] bg-gray-100 border-gray-300 rounded focus:ring-[#118B50] focus:ring-2"
          />
          <label
            htmlFor="university_finished"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            {t("university_finished")}
          </label>
        </div>

        {/* Specialization */}
        <div>
          <label
            htmlFor="specialization"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("specialization")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={formData.specialization || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("specialization_placeholder")}
          />
        </div>

        {/* Workplace */}
        <div>
          <label
            htmlFor="workplace"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("workplace")}
          </label>
          <input
            type="text"
            id="workplace"
            name="workplace"
            value={formData.workplace || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("workplace_placeholder")}
          />
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("languages")} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_LANGUAGES.map((language) => {
              const isSelected =
                formData.languages?.some(
                  (lang) => lang.language === language
                ) || false;
              const selectedLanguage = formData.languages?.find(
                (lang) => lang.language === language
              );

              return (
                <div key={language} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`lang-${language}`}
                    checked={isSelected}
                    onChange={() => handleLanguageToggle(language)}
                    className="w-4 h-4 text-[#118B50] bg-gray-100 border-gray-300 rounded focus:ring-[#118B50] focus:ring-2"
                  />
                  <label
                    htmlFor={`lang-${language}`}
                    className="ml-2 text-sm text-gray-700 flex-1"
                  >
                    {language}
                  </label>

                  {isSelected && (
                    <select
                      value={selectedLanguage?.level || "A1"}
                      onChange={(e) =>
                        handleLanguageLevelChange(language, e.target.value)
                      }
                      className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#118B50] focus:border-transparent"
                    >
                      {LANGUAGE_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Languages Display */}
          {formData.languages && formData.languages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.languages.map((langSkill) => (
                <span
                  key={`${langSkill.language}-${langSkill.level}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E3F0AF] text-[#118B50]"
                >
                  {langSkill.language} ({langSkill.level})
                  <button
                    type="button"
                    onClick={() => handleLanguageToggle(langSkill.language)}
                    className="ml-2 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Personal Description */}
        <div>
          <label
            htmlFor="personal_description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("personal_description")}
          </label>
          <textarea
            id="personal_description"
            name="personal_description"
            value={formData.personal_description || ""}
            onChange={handleInputChange}
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all resize-vertical"
            placeholder={t("personal_description_placeholder")}
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {(formData.personal_description || "").length}/1000
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white font-semibold rounded-lg hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>

        {/* Form completion indicator */}
        {professionalData && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] text-[#118B50]">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Profiil on loodud</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}