// src/components/forum/ForumPage.tsx - IMPROVED VERSION
"use client";

import { useState, useCallback, memo } from "react";
import Header from "../layout/Header";
import ForumHero from "./ForumHero";
import ForumCategories from "./ForumCategories";
import ForumSearchBar from "./ForumSearchBar";
import ForumPostList from "./ForumPostList";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/hooks/useAuthorization";
// Import from LazyComponents - using LazyLoadWrapper instead of Suspense
import {
  LazyCreatePostModal,
  LazyLoadWrapper,
} from "@/components/common/LazyComponents";

const ForumPageContent = memo(function ForumPageContent() {
  const t = useTranslations("forum");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);

  // Handle post creation
  const handlePostCreated = useCallback(() => {
    setShowCreatePost(false);
    // Trigger refresh for components that need it
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      // Reset search when changing category
      if (categoryId !== selectedCategory) {
        setSearchQuery("");
      }
    },
    [selectedCategory]
  );

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
      <Header />

      <main>
        <ForumHero />

        {/* Forum Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Create Post Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <ForumSearchBar
                onSearch={handleSearch}
                initialValue={searchQuery}
              />
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white font-semibold 
                     rounded-xl hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#118B50]"
              aria-label={t("create_post.button")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{t("create_post.button")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <aside className="lg:col-span-1">
              <ForumCategories
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                refreshTrigger={refreshTrigger}
              />
            </aside>

            {/* Posts List */}
            <section className="lg:col-span-3">
              <ForumPostList
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                refreshTrigger={refreshTrigger}
                useInfiniteScrollMode={useInfiniteScroll}
              />
            </section>
          </div>
        </section>
      </main>

      {/* IMPROVED: Using LazyLoadWrapper which includes Suspense internally */}
      {showCreatePost && (
        <LazyLoadWrapper>
          <LazyCreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        </LazyLoadWrapper>
      )}
    </div>
  );
});

export default function ForumPage() {
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

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <ForumPageContent />
    </AuthModalProvider>
  );
}
