"use client";

import Header from "../layout/Header";
import RolesTable from "./RolesTable";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useAuthorization } from "@/hooks/useAuthorization";

export default function RolesPage() {
  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["admin"],
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

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Roles Content */}
        <main>
          <RolesTable />
        </main>
      </div>
    </AuthModalProvider>
  );
}
