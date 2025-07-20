// src/components/dashboard/DashboardPage.tsx
"use client";

import Header from '../layout/Header';
import DashboardHero from './DashboardHero';
import QuickActions from './QuickActions';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

export default function DashboardPage() {
  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />
        
        {/* Main Dashboard Content */}
        <main>
          <DashboardHero />
          <QuickActions />
        </main>
      </div>
    </AuthModalProvider>
  );
}