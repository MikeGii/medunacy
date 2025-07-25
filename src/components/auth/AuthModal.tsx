// src/components/auth/AuthModal.tsx
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Create a stable container for the portal
let portalRoot: HTMLElement | null = null;

const getPortalRoot = () => {
  if (typeof window === "undefined") return null;

  if (!portalRoot) {
    portalRoot = document.getElementById("modal-root");
    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.id = "modal-root";
      document.body.appendChild(portalRoot);
    }
  }
  return portalRoot;
};

const AuthModal = React.memo(function AuthModal({
  isOpen,
  onClose,
  children,
}: AuthModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousActiveElement.current = document.activeElement as HTMLElement;

      setShouldRender(true);
      // Small delay for animation
      requestAnimationFrame(() => {
        setIsVisible(true);
        // Focus trap
        modalRef.current?.focus();
      });
    } else {
      setIsVisible(false);
      // Wait for animation before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Restore focus
        previousActiveElement.current?.focus();
      }, 300); // Match transition duration

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Optimized escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleEscape, { capture: true });
  }, [isOpen, onClose]);

  // Body scroll lock with better performance
  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    // Prevent layout shift from scrollbar
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.paddingRight = originalStyles.paddingRight;
    };
  }, [isOpen]);

  // Optimized backdrop click handler
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  if (!shouldRender) return null;

  const portalRoot = getPortalRoot();
  if (!portalRoot) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop with animation */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Content with animation */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative z-10 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#118B50] focus:ring-offset-2"
            aria-label="Close modal"
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

          <div id="modal-title" className="sr-only">
            Authentication Modal
          </div>
          {children}
        </div>
      </div>
    </div>,
    portalRoot
  );
});

export default AuthModal;
