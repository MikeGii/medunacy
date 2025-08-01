// src/components/home/HomePage.tsx
"use client";

import Header from "../layout/Header";
import Footer from "../layout/Footer";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import TeamSection from "./TeamSection";
import FAQSection from "./FAQSection";
import AuthModal from "../auth/AuthModal";
import LoginModal from "../auth/LoginModal";
import RegisterModal from "../auth/RegisterModal";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";

function HomePageContent() {
  const {
    isOpen,
    currentModal,
    switchToLogin,
    switchToRegister,
    switchToForgotPassword,
    close,
  } = useAuthModal();

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ServicesSection />
      <TeamSection />
      <FAQSection />
      <Footer />

      {/* Authentication Modals */}
      <AuthModal isOpen={isOpen} onClose={close}>
        {currentModal === "login" ? (
          <LoginModal
            onSwitchToRegister={switchToRegister}
            onSwitchToForgotPassword={switchToForgotPassword}
            onClose={close}
          />
        ) : currentModal === "register" ? (
          <RegisterModal onSwitchToLogin={switchToLogin} onClose={close} />
        ) : (
          <ForgotPasswordModal onBackToLogin={switchToLogin} onClose={close} />
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
