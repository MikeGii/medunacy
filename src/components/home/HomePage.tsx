// src/components/home/HomePage.tsx
"use client";

import Header from '../layout/Header';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import TeamSection from './TeamSection';
import FAQSection from './FAQSection';
import AuthModal from '../auth/AuthModal';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

function HomePageContent() {
  const {
    isOpen,
    currentModal,
    switchToLogin,
    switchToRegister,
    close,
  } = useAuthModal();

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ServicesSection />
      <TeamSection />
      <FAQSection />
      
      {/* Authentication Modals */}
      <AuthModal isOpen={isOpen} onClose={close}>
        {currentModal === "login" ? (
          <LoginModal onSwitchToRegister={switchToRegister} onClose={close} />
        ) : (
          <RegisterModal onSwitchToLogin={switchToLogin} onClose={close} />
        )}
      </AuthModal>
      
      {/* Future content sections will go here */}
      <main className="bg-white">
        {/* Content will be added here in next steps */}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthModalProvider>
      <HomePageContent />
    </AuthModalProvider>
  );
}