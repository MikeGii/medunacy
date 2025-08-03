// src/components/premium/PremiumPage.tsx
"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PremiumHero from "./PremiumHero";
import PricingSection from "./PricingSection";
import ComparisonTable from "./ComparisonTable";

export default function PremiumPage() {
  const t = useTranslations("premium");
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />
        <main>
          <PremiumHero isPremium={isPremium} />
          <PricingSection user={user} isPremium={isPremium} />
          <ComparisonTable />
        </main>
        <Footer />
      </div>
    </AuthModalProvider>
  );
}
