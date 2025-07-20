// src/contexts/AuthModalContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  currentModal: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState<'login' | 'register'>('login');

  const openLogin = () => {
    setCurrentModal('login');
    setIsOpen(true);
  };

  const openRegister = () => {
    setCurrentModal('register');
    setIsOpen(true);
  };

  const switchToLogin = () => {
    setCurrentModal('login');
  };

  const switchToRegister = () => {
    setCurrentModal('register');
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
        switchToLogin,
        switchToRegister,
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
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}