"use client";

import Header from "../layout/Header";
import Footer from "../layout/Footer";
import DashboardHero from "./DashboardHero";
import QuickActions from "./QuickActions";
import HealthcareTools from "./HealthcareTools";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import AdminTools from "./AdminTools";
import { useAuthorization } from "@/hooks/useAuthorization";

export default function DashboardPage() {
  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["user", "doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  // Show loading while checking authorization
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

  // Don't render dashboard if user is not authenticated
  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Dashboard Content */}
        <main>
          <DashboardHero />
          <QuickActions />
          <HealthcareTools />
          <AdminTools />
        </main>
        <Footer />
      </div>
    </AuthModalProvider>
  );
}
