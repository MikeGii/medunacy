"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../layout/Header';
import UsersTable from './UsersTable';
import UserDetailsModal from './UserDetailsModal';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    // Redirect to main page if not authenticated or if user is a regular user (not doctor or admin)
    if (!loading && (!user || user.role === 'user')) {
      const currentLocale = pathname.startsWith('/ukr') ? 'ukr' : 'et';
      router.push(`/${currentLocale}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
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
  if (!user || user.role === 'user') {
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