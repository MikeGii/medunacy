"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../layout/Header';
import ForumHero from './ForumHero';
import ForumCategories from './ForumCategories';
import ForumSearchBar from './ForumSearchBar';
import ForumPostList from './ForumPostList';
import CreatePostModal from './CreatePostModal';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function ForumPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("forum");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      // User is authenticated
      setIsAuthorized(true);
    } else if (!loading && !user) {
      // Not authenticated
      setIsAuthorized(false);
      const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
      router.push(`/${currentLocale}`);
    }
  }, [user, loading, router, pathname]);

  const handlePostCreated = () => {
    // Trigger refresh of posts list
    setRefreshPosts(prev => prev + 1);
  };

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
        
        <main>
          <ForumHero />
          
          {/* Forum Content */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Create Post Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ForumSearchBar onSearch={setSearchQuery} />
              </div>
              <button 
                onClick={() => setShowCreatePost(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white font-semibold 
                         rounded-xl hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                         shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("create_post.button")}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <ForumCategories 
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  refreshTrigger={refreshPosts}
                />
              </div>
              
              {/* Posts List */}
              <div className="lg:col-span-3">
                <ForumPostList 
                  key={refreshPosts}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </section>
        </main>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </AuthModalProvider>
  );
}