// src/components/auth/ForgotPasswordModal.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

interface ForgotPasswordModalProps {
  onBackToLogin: () => void;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  onBackToLogin,
  onClose: _onClose,
}: ForgotPasswordModalProps) {
  const t = useTranslations("auth.forgot_password");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: t("messages.success"),
      });

      // Clear the form
      setEmail("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("messages.error");
      setMessage({
        type: "error",
        text: errorMessage.includes("User not found")
          ? t("messages.user_not_found")
          : t("messages.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#118B50] mb-2">{t("title")}</h2>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-all"
            placeholder={t("placeholders.email")}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-[#118B50] hover:bg-[#0F7A43] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("button.sending") : t("button.send")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t("back_to_login.text")}{" "}
          <button
            onClick={onBackToLogin}
            className="text-[#118B50] hover:underline font-medium"
          >
            {t("back_to_login.link")}
          </button>
        </p>
      </div>
    </div>
  );
}
