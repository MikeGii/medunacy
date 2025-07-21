// src/contexts/AuthModalContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  isOpen: boolean;
  currentModal: "login" | "register" | "forgot-password";
  openLogin: () => void;
  openRegister: () => void;
  openForgotPassword: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
  switchToForgotPassword: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState<
    "login" | "register" | "forgot-password"
  >("login");

  const openLogin = () => {
    setCurrentModal("login");
    setIsOpen(true);
  };

  const openRegister = () => {
    setCurrentModal("register");
    setIsOpen(true);
  };

  const openForgotPassword = () => {
    setCurrentModal("forgot-password");
    setIsOpen(true);
  };

  const switchToLogin = () => {
    setCurrentModal("login");
  };

  const switchToRegister = () => {
    setCurrentModal("register");
  };

  const switchToForgotPassword = () => {
    setCurrentModal("forgot-password");
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        currentModal,
        openLogin,
        openRegister,
        openForgotPassword,
        switchToLogin,
        switchToRegister,
        switchToForgotPassword,
        close,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
