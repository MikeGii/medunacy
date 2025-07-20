'use client';

import { useState } from 'react';

export function useAuthModal() {
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

  return {
    isOpen,
    currentModal,
    openLogin,
    openRegister,
    switchToLogin,
    switchToRegister,
    close
  };
}