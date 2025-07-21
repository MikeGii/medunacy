// src/components/auth/LoginModal.tsx
"use client";

import { useState, useEffect } from "react";
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
  const { user } = useAuth(); // Add this to watch auth state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (user) {
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const result = await signIn(formData.email, formData.password);

    if (result.success) {
      // Don't close modal immediately - let the useEffect handle it
      setMessage({
        type: "success",
        text: "Signing in successfully...",
      });
    } else {
      setMessage({
        type: "error",
        text: result.message,
      });
    }
  };

  // Rest of the component remains the same...
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
          {message.type === "success" && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
              <span>{message.text}</span>
            </div>
          )}
          {message.type === "error" && message.text}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#118B50] hover:bg-[#0F7A43] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("button.signing_in") : t("button.sign_in")}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToForgotPassword}
          className="text-sm text-[#118B50] hover:underline"
          disabled={loading}
        >
          {t("forgot_password_link")}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t("register_link.text")}{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-[#118B50] hover:underline font-medium"
            disabled={loading}
          >
            {t("register_link.link")}
          </button>
        </p>
      </div>
    </div>
  );
}
