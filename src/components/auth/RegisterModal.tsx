// src/components/auth/RegisterModal.tsx - Optimized version
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface RegisterModalProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  language: string;
  acceptPrivacy: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterModal({
  onSwitchToLogin,
  onClose,
}: RegisterModalProps) {
  const t = useTranslations("auth.register");
  const { register, loading } = useAuthActions();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

  // Use refs for preventing stale closures
  const isMountedRef = useRef(true);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    language: currentLocale,
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Cleanup effect
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, []);

  // Handle success countdown
  useEffect(() => {
    if (message?.type === "success" && countdown !== null && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCountdown((prev) => (prev !== null ? prev - 1 : null));
        }
      }, 1000);
    } else if (countdown === 0) {
      onClose();
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, message, onClose]);

  // Validation function
  const validateField = useCallback(
    (name: string, value: string | boolean): string => {
      switch (name) {
        case "firstName":
        case "lastName":
          const fieldName = t(
            `form.${name === "firstName" ? "first_name" : "last_name"}`
          );
          const strValue = value as string; // Type assertion for string fields
          if (!strValue.trim()) {
            return t("validation.field_required", { field: fieldName });
          }
          if (strValue.trim().length < 2) {
            return t("validation.min_length", { min: 2 });
          }
          if (!/^[a-zA-ZÀ-ÿĀ-žА-я\s\-']+$/.test(strValue)) {
            return t("validation.invalid_characters");
          }
          return "";

        case "email":
          const emailValue = value as string;
          if (!emailValue.trim()) {
            return t("validation.field_required", { field: t("form.email") });
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailValue.trim())) {
            return t("validation.invalid_email");
          }
          return "";

        case "phone":
          const phoneValue = value as string;
          if (phoneValue && !/^[\d\s\-\+\(\)]+$/.test(phoneValue)) {
            return t("validation.invalid_phone");
          }
          return "";

        case "password":
          const passwordValue = value as string;
          if (!passwordValue) {
            return t("validation.field_required", {
              field: t("form.password"),
            });
          }
          if (passwordValue.length < 6) {
            return t("messages.password_short");
          }
          if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordValue)) {
            return t("validation.password_complexity");
          }
          return "";

        case "confirmPassword":
          const confirmValue = value as string;
          if (!confirmValue) {
            return t("validation.field_required", {
              field: t("form.confirm_password"),
            });
          }
          if (confirmValue !== formData.password) {
            return t("messages.password_mismatch");
          }
          return "";

        case "acceptPrivacy":
          const boolValue = value as boolean;
          if (!boolValue) {
            return t("validation.privacy_required");
          }
          return "";

        default:
          return "";
      }
    },
    [formData.password, t]
  );

  // Memoized change handler with validation
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const { name, value, type, checked } = target;

      // Update form data
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear error when user starts typing/checking
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }

      // Validate on change for acceptPrivacy checkbox
      if (name === "acceptPrivacy") {
        const error = validateField(name, checked);
        if (error) {
          setErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        }
      }

      // Validate on blur for confirmPassword
      if (name === "confirmPassword" && value) {
        const error = validateField(name, value);
        if (error) {
          setErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        }
      }
    },
    [errors, validateField]
  );

  // Validate on blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const error = validateField(name, value);

      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField]
  );

  // Form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage(null);

      // Validate all fields
      const newErrors: FormErrors = {};
      Object.keys(formData).forEach((key) => {
        if (key !== "language") {
          const value =
            key === "acceptPrivacy"
              ? formData.acceptPrivacy
              : formData[key as keyof RegisterFormData];
          const error = validateField(key, value);
          if (error) {
            newErrors[key] = error;
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setMessage({ type: "error", text: t("errors.fill_all_fields") });
        // Focus on first error field
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        element?.focus();
        return;
      }

      try {
        const result = await register({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          language: formData.language,
        });

        if (!isMountedRef.current) return;

        if (result.success) {
          setMessage({ type: "success", text: "" });
          setCountdown(10); // Start 10-second countdown

          // Clear form
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            language: currentLocale,
            acceptPrivacy: false,
          });
          setErrors({});
        } else {
          let errorMessage = result.message;

          if (errorMessage.includes("already registered")) {
            errorMessage = t("validation.email_already_exists");
          } else if (errorMessage.includes("Invalid email")) {
            errorMessage = t("validation.invalid_email");
          } else if (errorMessage.includes("Registration failed")) {
            errorMessage = t("errors.registration_failed");
          }

          setMessage({ type: "error", text: errorMessage });
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (isMountedRef.current) {
          setMessage({
            type: "error",
            text: t("messages.unexpected_error"),
          });
        }
      }
    },
    [formData, currentLocale, register, validateField, t]
  );

  const isDisabled = loading || message?.type === "success";

  return (
    <div className="p-8 max-h-[90vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-[#118B50] mb-2">{t("title")}</h2>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Success Message */}
      {message?.type === "success" && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                {t("messages.success_title")}
              </h3>
              <p className="text-green-700 text-sm leading-relaxed mb-4">
                {t("messages.success_description")}
              </p>

              {countdown !== null && (
                <div className="flex items-center space-x-2 text-green-600">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {t("messages.success_note")} {countdown}{" "}
                    {t("messages.success_seconds")}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {message?.type === "error" && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Registration Form */}
      {message?.type !== "success" && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form.first_name")} *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("placeholders.first_name")}
                disabled={isDisabled}
                autoFocus
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("form.last_name")} *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("placeholders.last_name")}
                disabled={isDisabled}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.email")} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("placeholders.email")}
              disabled={isDisabled}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.phone")}{" "}
              <span className="text-gray-500 text-xs">
                ({t("form.optional")})
              </span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("placeholders.phone")}
              disabled={isDisabled}
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.language")} *
            </label>
            <select
              id="language"
              name="language"
              required
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm"
              disabled={isDisabled}
            >
              <option value="et">Eesti keel</option>
              <option value="ukr">Українська</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.password")} *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("placeholders.password")}
              disabled={isDisabled}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("form.confirm_password")} *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all text-sm ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("placeholders.password")}
              disabled={isDisabled}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="mt-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="acceptPrivacy"
                name="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={handleChange}
                className={`mt-1 w-4 h-4 text-[#118B50] bg-gray-100 border-gray-300 rounded focus:ring-[#118B50] focus:ring-2 ${
                  errors.acceptPrivacy ? "border-red-500" : ""
                }`}
                disabled={isDisabled}
              />
              <label
                htmlFor="acceptPrivacy"
                className="ml-2 text-sm text-gray-700"
              >
                {t("form.privacy_consent")}{" "}
                <Link
                  href={`/${currentLocale}/privacy-policy`}
                  target="_blank"
                  className="text-[#118B50] hover:text-[#0F7A43] underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("form.privacy_policy_link")}
                </Link>
              </label>
            </div>
            {errors.acceptPrivacy && (
              <p className="mt-1 text-xs text-red-600 ml-6">
                {errors.acceptPrivacy}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-[#118B50] hover:bg-[#0F7A43] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#118B50] mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("button.creating")}
              </span>
            ) : (
              t("button.create")
            )}
          </button>
        </form>
      )}

      {/* Login Link */}
      {message?.type !== "success" && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {t("login_link.text")}{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-[#118B50] hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-[#118B50] focus:ring-offset-2 rounded"
              disabled={isDisabled}
            >
              {t("login_link.link")}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
