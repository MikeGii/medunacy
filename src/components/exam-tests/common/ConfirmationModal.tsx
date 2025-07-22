// src/components/exam-tests/common/ConfirmationModal.tsx

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = "warning",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const t = useTranslations("common");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: "text-red-600",
      iconBg: "bg-red-100",
      confirmBtn: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-yellow-600",
      iconBg: "bg-yellow-100",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
      confirmBtn: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const style = colors[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onCancel}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center`}
            >
              <svg
                className={`w-6 h-6 ${style.icon}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {type === "danger" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.667-2.308-1.667-3.08 0L3.34 19c-.77 1.333.192 3 1.732 3z"
                  />
                )}
                {type === "warning" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
                {type === "info" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {cancelText || t("cancel")}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${style.confirmBtn}`}
            >
              {confirmText || t("confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
