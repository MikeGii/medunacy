// src/components/privacy-policy/PrivacyPolicyPage.tsx
"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import PrivacyPolicyHero from "./PrivacyPolicyHero";
import PrivacyContent from "./PrivacyContent";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
      <Header />
      <main>
        <PrivacyPolicyHero />
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}