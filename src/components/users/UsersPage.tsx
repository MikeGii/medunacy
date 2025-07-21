"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "../layout/Header";
import UsersTable from "./UsersTable";
import UserDetailsModal from "./UserDetailsModal";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useAuth } from "@/contexts/AuthContext";

interface UserData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // Check authorization after everything is loaded
      if (user.role === "user") {
        setIsAuthorized(false);
        const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
        router.push(`/${currentLocale}`);
      } else {
        setIsAuthorized(true);
      }
    } else if (!loading && !user) {
      // Not authenticated
      setIsAuthorized(false);
      const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
      router.push(`/${currentLocale}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading while checking authorization
  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render page if user doesn't have access
  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Users Content */}
        <main>
          <UsersTable onUserSelect={setSelectedUser} />
        </main>

        {/* User Details Modal - Rendered at root level */}
        <UserDetailsModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      </div>
    </AuthModalProvider>
  );
}
