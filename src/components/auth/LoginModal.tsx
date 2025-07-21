// src/components/auth/LoginModal.tsx - Optimized version
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@/hooks/useAuth";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onClose: () => void;
}

export default function LoginModal({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onClose,
}: LoginModalProps) {
  const t = useTranslations("auth.login");
  const { signIn, loading } = useAuthActions();
  const { user, isInitialized } = useAuth(); // Add isInitialized
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Use refs to prevent stale closures
  const isClosingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Effect cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle successful authentication
  useEffect(() => {
    // Only proceed if initialized and not already closing
    if (!isInitialized || isClosingRef.current) return;

    if (user) {
      isClosingRef.current = true;

      // Small delay for smooth transition
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          onClose();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user, onClose, isInitialized]);

  // Memoize handlers to prevent recreating on each render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(), // Trim whitespace as user types
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Reset any previous messages
      setMessage(null);

      // Basic validation
      if (!formData.email || !formData.password) {
        setMessage({
          type: "error",
          text: t("validation.fill_all_fields"),
        });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage({
          type: "error",
          text: t("validation.invalid_email"),
        });
        return;
      }

      try {
        const result = await signIn(formData.email, formData.password);

        if (!isMountedRef.current) return;

        if (result.success) {
          setMessage({
            type: "success",
            text: t("success.signing_in"),
          });
        } else {
          let errorMessage = result.message;

          if (errorMessage.includes("Invalid login credentials")) {
            errorMessage = t("errors.invalid_credentials");
          } else if (errorMessage.includes("Email not confirmed")) {
            errorMessage = t("errors.email_not_verified");
          } else if (errorMessage.includes("Too many requests")) {
            errorMessage = t("errors.too_many_attempts");
          } else if (errorMessage.includes("Sign in failed")) {
            errorMessage = t("errors.sign_in_failed");
          }

          setMessage({
            type: "error",
            text: errorMessage,
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        if (isMountedRef.current) {
          setMessage({
            type: "error",
            text: t("errors.unexpected_error"),
          });
        }
      }
    },
    [formData, signIn]
  );

  // Prevent form submission while already loading or closing
  const isDisabled = loading || isClosingRef.current || !!user;

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#118B50] mb-2">{t("title")}</h2>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg transition-all duration-300 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === "success" ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                <span>{message.text}</span>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("placeholders.email")}
            disabled={isDisabled}
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("placeholders.password")}
            disabled={isDisabled}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-[#118B50] hover:bg-[#0F7A43] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#118B50]"
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
              {t("button.signing_in")}
            </span>
          ) : (
            t("button.sign_in")
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToForgotPassword}
          className="text-sm text-[#118B50] hover:underline focus:outline-none focus:ring-2 focus:ring-[#118B50] focus:ring-offset-2 rounded"
          disabled={isDisabled}
        >
          {t("forgot_password_link")}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t("register_link.text")}{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-[#118B50] hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-[#118B50] focus:ring-offset-2 rounded"
            disabled={isDisabled}
          >
            {t("register_link.link")}
          </button>
        </p>
      </div>
    </div>
  );
}
