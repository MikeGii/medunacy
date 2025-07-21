"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useAuth } from "@/contexts/AuthContext";
import ForumHero from "./ForumHero";
import ForumCategories from "./ForumCategories";

export default function ForumPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      // User is authenticated
      setIsAuthorized(true);
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

  // Don't render forum if user is not authenticated
  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Forum Content */}
        <main>
          <ForumHero />

          {/* Forum Content */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <ForumCategories
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                />
              </div>

              {/* Posts List */}
              <div className="lg:col-span-3">
                {/* Posts component will go here */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-6">
                  <p className="text-gray-600">Posts will be displayed here</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthModalProvider>
  );
}
