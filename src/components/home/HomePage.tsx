// src/components/home/HomePage.tsx
import Header from '../layout/Header';
import HeroSection from './HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Future content sections will go here */}
      <main className="bg-white">
        {/* Content will be added here in next steps */}
      </main>
    </div>
  );
}